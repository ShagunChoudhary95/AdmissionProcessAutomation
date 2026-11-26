package com.admissionportal.repository;

import com.admissionportal.entity.SeatReservation;
import com.admissionportal.enums.SeatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatReservationRepository extends JpaRepository<SeatReservation, Long> {
    @Query("SELECT s FROM SeatReservation s WHERE s.application.id = :applicationId AND s.status = :status")
    Optional<SeatReservation> findByApplicationIdAndStatus(@Param("applicationId") Long applicationId, @Param("status") SeatStatus status);

    @Query("SELECT s FROM SeatReservation s WHERE s.branch.id = :branchId AND s.status = :status")
    List<SeatReservation> findByBranchIdAndStatus(@Param("branchId") Long branchId, @Param("status") SeatStatus status);
}
