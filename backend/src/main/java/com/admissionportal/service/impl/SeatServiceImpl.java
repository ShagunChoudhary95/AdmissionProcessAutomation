package com.admissionportal.service.impl;

import com.admissionportal.entity.Application;
import com.admissionportal.entity.Branch;
import com.admissionportal.entity.SeatReservation;
import com.admissionportal.enums.SeatStatus;
import com.admissionportal.exception.ResourceNotFoundException;
import com.admissionportal.exception.SeatOverbookingException;
import com.admissionportal.repository.BranchRepository;
import com.admissionportal.repository.SeatReservationRepository;
import com.admissionportal.service.AuditService;
import com.admissionportal.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class SeatServiceImpl implements SeatService {

    private final BranchRepository branchRepository;
    private final SeatReservationRepository seatReservationRepository;
    private final AuditService auditService;

    @Override
    @Transactional
    public SeatReservation reserveSeat(Application application) {
        if (application.getBranch() == null) {
            throw new ResourceNotFoundException("No branch selected for application.");
        }

        // Lock branch row to prevent race conditions during seat reservation
        Branch branch = branchRepository.findByIdWithLock(application.getBranch().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        int occupied = branch.getConfirmedSeats() + branch.getReservedSeats();
        if (occupied >= branch.getTotalSeats()) {
            throw new SeatOverbookingException("No seats available in " + branch.getName() + " (Capacity: " + branch.getTotalSeats() + ")");
        }

        branch.setReservedSeats(branch.getReservedSeats() + 1);
        branchRepository.save(branch);

        SeatReservation reservation = SeatReservation.builder()
                .application(application)
                .branch(branch)
                .status(SeatStatus.ACTIVE)
                .reservedAt(Instant.now())
                .expiresAt(Instant.now().plus(7, ChronoUnit.DAYS))
                .build();

        reservation = seatReservationRepository.save(reservation);
        auditService.log("SYSTEM", "SYSTEM", "RESERVE_SEAT", "SeatReservation", reservation.getId(),
                "Reserved seat in " + branch.getName() + " for application: " + application.getApplicationNumber());

        return reservation;
    }

    @Override
    @Transactional
    public void confirmSeat(Application application) {
        if (application.getBranch() == null) return;

        Branch branch = branchRepository.findByIdWithLock(application.getBranch().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        // If a temporary reservation existed, transfer reserved -> confirmed
        seatReservationRepository.findByApplicationIdAndStatus(application.getId(), SeatStatus.ACTIVE)
                .ifPresent(reservation -> {
                    reservation.setStatus(SeatStatus.CONFIRMED);
                    seatReservationRepository.save(reservation);
                    if (branch.getReservedSeats() > 0) {
                        branch.setReservedSeats(branch.getReservedSeats() - 1);
                    }
                });

        branch.setConfirmedSeats(branch.getConfirmedSeats() + 1);
        branchRepository.save(branch);

        auditService.log("SYSTEM", "SYSTEM", "CONFIRM_SEAT", "Branch", branch.getId(),
                "Seat confirmed for application: " + application.getApplicationNumber());
    }

    @Override
    @Transactional
    public void releaseSeat(Application application) {
        if (application.getBranch() == null) return;

        Branch branch = branchRepository.findByIdWithLock(application.getBranch().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        seatReservationRepository.findByApplicationIdAndStatus(application.getId(), SeatStatus.ACTIVE)
                .ifPresent(reservation -> {
                    reservation.setStatus(SeatStatus.RELEASED);
                    seatReservationRepository.save(reservation);
                    if (branch.getReservedSeats() > 0) {
                        branch.setReservedSeats(branch.getReservedSeats() - 1);
                        branchRepository.save(branch);
                    }
                });

        auditService.log("SYSTEM", "SYSTEM", "RELEASE_SEAT", "Branch", branch.getId(),
                "Released seat for application: " + application.getApplicationNumber());
    }
}
