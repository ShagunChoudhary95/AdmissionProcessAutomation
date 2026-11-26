package com.admissionportal.service.impl;

import com.admissionportal.dto.CourseSelectionRequest;
import com.admissionportal.dto.EligibilityResultResponse;
import com.admissionportal.entity.*;
import com.admissionportal.enums.ApplicationStatus;
import com.admissionportal.enums.EligibilityStatus;
import com.admissionportal.enums.Role;
import com.admissionportal.exception.BadRequestException;
import com.admissionportal.exception.ResourceNotFoundException;
import com.admissionportal.exception.UnauthorizedException;
import com.admissionportal.repository.*;
import com.admissionportal.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final AcademicQualificationRepository qualificationRepository;
    private final CourseRepository courseRepository;
    private final BranchRepository branchRepository;
    private final EligibilityService eligibilityService;
    private final MeritService meritService;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Override
    @Transactional
    public Application createDraft(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check if an open/draft application already exists
        List<Application> existing = applicationRepository.findByStudentId(userId);
        for (Application app : existing) {
            if (app.getStatus() == ApplicationStatus.DRAFT) {
                return app;
            }
        }

        String appNumber = "ADM2026-" + (100000 + new Random().nextInt(900000));

        Application application = Application.builder()
                .student(user)
                .applicationNumber(appNumber)
                .status(ApplicationStatus.DRAFT)
                .eligibilityStatus(EligibilityStatus.PENDING)
                .build();

        Application saved = applicationRepository.save(application);

        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(saved)
                .fromStatus(null)
                .toStatus(ApplicationStatus.DRAFT)
                .remarks("Application draft initialized")
                .changedBy(user)
                .build();
        statusHistoryRepository.save(history);

        auditService.log(user, "CREATE_DRAFT", "APPLICATION", saved.getId(), "Draft application created: " + appNumber);
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Application> getMyApplications(Long userId) {
        return applicationRepository.findByStudentId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Application getApplicationById(Long id, Long userId) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!application.getStudent().getId().equals(userId) &&
                user.getRole() != Role.ADMIN && user.getRole() != Role.OFFICER) {
            throw new UnauthorizedException("You are not authorized to view this application");
        }

        return application;
    }

    @Override
    @Transactional
    public Application updateCourse(Long id, CourseSelectionRequest request, Long userId) {
        Application application = getApplicationById(id, userId);

        if (application.getStatus() != ApplicationStatus.DRAFT &&
            application.getStatus() != ApplicationStatus.CORRECTION_REQUIRED) {
            throw new BadRequestException("Application cannot be edited in its current status: " + application.getStatus());
        }

        if (request.getCourseId() != null && !request.getCourseId().isBlank()) {
            Long courseId = Long.parseLong(request.getCourseId());
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
            application.setCourse(course);
        }

        if (request.getBranchId() != null && !request.getBranchId().isBlank()) {
            Long branchId = Long.parseLong(request.getBranchId());
            Branch branch = branchRepository.findById(branchId)
                    .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id: " + branchId));
            application.setBranch(branch);
        }

        application.setEligibilityStatus(EligibilityStatus.PENDING);
        return applicationRepository.save(application);
    }

    @Override
    @Transactional
    public EligibilityResultResponse checkEligibility(Long id, Long userId) {
        Application application = getApplicationById(id, userId);

        if (application.getCourse() == null) {
            throw new BadRequestException("Please select a course before checking eligibility");
        }

        EligibilityResultResponse result = eligibilityService.checkEligibility(id);
        if (result != null && result.getStatus() != null) {
            try {
                application.setEligibilityStatus(EligibilityStatus.valueOf(result.getStatus()));
                applicationRepository.save(application);
            } catch (Exception ignored) {}
        }

        return result;
    }

    @Override
    @Transactional
    public Application submitApplication(Long id, Long userId) {
        Application application = getApplicationById(id, userId);

        if (application.getStatus() != ApplicationStatus.DRAFT &&
            application.getStatus() != ApplicationStatus.CORRECTION_REQUIRED) {
            throw new BadRequestException("Application is already submitted or in review. Status: " + application.getStatus());
        }

        if (application.getCourse() == null) {
            throw new BadRequestException("Cannot submit application without selecting a course");
        }

        // Validate Profile
        Optional<StudentProfile> profileOpt = profileRepository.findByUserId(userId);
        if (profileOpt.isEmpty() || profileOpt.get().getPhone() == null || profileOpt.get().getPhone().isBlank()) {
            throw new BadRequestException("Please complete your personal profile details before submitting");
        }

        // Validate Academic Qualifications
        List<AcademicQualification> qualifications = qualificationRepository.findByProfileUserId(userId);
        if (qualifications.isEmpty()) {
            throw new BadRequestException("Please provide your academic qualifications (Class 10th / 12th) before submitting");
        }

        // Run Eligibility
        EligibilityResultResponse eligibility = eligibilityService.checkEligibility(id);
        if ("NOT_ELIGIBLE".equals(eligibility.getStatus())) {
            throw new BadRequestException("Cannot submit application: You do not meet the minimum eligibility requirements: " +
                    (eligibility.getReasons() != null ? String.join("; ", eligibility.getReasons()) : ""));
        }

        application.setEligibilityStatus(EligibilityStatus.valueOf(eligibility.getStatus()));

        // Calculate Merit Score & Rank
        Double score = meritService.calculateMeritScore(application);
        application.setMeritScore(score);

        Integer rank = meritService.calculateMeritRank(application);
        application.setMeritRank(rank);

        ApplicationStatus prevStatus = application.getStatus();
        application.setStatus(ApplicationStatus.SUBMITTED);
        application.setSubmittedAt(Instant.now());

        Application saved = applicationRepository.save(application);

        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(saved)
                .fromStatus(prevStatus)
                .toStatus(ApplicationStatus.SUBMITTED)
                .remarks("Application formally submitted by candidate")
                .changedBy(application.getStudent())
                .build();
        statusHistoryRepository.save(history);

        notificationService.sendNotification(
                application.getStudent(),
                "Application Submitted Successfully",
                "Your application " + application.getApplicationNumber() + " for " + application.getCourse().getName() + " has been submitted for verification.",
                "APPLICATION"
        );

        auditService.log(
                application.getStudent(),
                "SUBMIT_APPLICATION",
                "APPLICATION",
                saved.getId(),
                "Application " + saved.getApplicationNumber() + " submitted with Merit Score: " + score
        );

        return saved;
    }

    @Override
    @Transactional
    public Application submitCorrection(Long id, Map<String, Object> data, Long userId) {
        Application application = getApplicationById(id, userId);

        if (application.getStatus() != ApplicationStatus.CORRECTION_REQUIRED) {
            throw new BadRequestException("Application does not require corrections at this time. Current status: " + application.getStatus());
        }

        String studentRemarks = data != null && data.containsKey("remarks") ? data.get("remarks").toString() : "Corrections updated by student";

        application.setStatus(ApplicationStatus.UNDER_VERIFICATION);
        application.setCorrectionRemarks(studentRemarks);
        Application saved = applicationRepository.save(application);

        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(saved)
                .fromStatus(ApplicationStatus.CORRECTION_REQUIRED)
                .toStatus(ApplicationStatus.UNDER_VERIFICATION)
                .remarks("Student submitted corrections: " + studentRemarks)
                .changedBy(application.getStudent())
                .build();
        statusHistoryRepository.save(history);

        notificationService.sendNotification(
                application.getStudent(),
                "Corrections Received",
                "Your application " + application.getApplicationNumber() + " has been resubmitted for verification.",
                "APPLICATION"
        );

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getApplicationStatus(Long id, Long userId) {
        Application app = getApplicationById(id, userId);

        Map<String, Object> response = new HashMap<>();
        response.put("id", app.getId());
        response.put("_id", String.valueOf(app.getId()));
        response.put("applicationNumber", app.getApplicationNumber());
        response.put("status", app.getStatus().name());
        response.put("eligibilityStatus", app.getEligibilityStatus() != null ? app.getEligibilityStatus().name() : "PENDING");
        response.put("meritScore", app.getMeritScore());
        response.put("meritRank", app.getMeritRank());
        response.put("course", app.getCourse());
        response.put("branch", app.getBranch());
        response.put("offerExpiresAt", app.getOfferExpiresAt());
        response.put("reviewRemarks", app.getReviewRemarks());
        response.put("correctionRemarks", app.getCorrectionRemarks());
        response.put("submittedAt", app.getSubmittedAt());
        response.put("statusHistory", app.getStatusHistory());

        return response;
    }
}
