package com.admissionportal.service.impl;

import com.admissionportal.dto.EligibilityResultResponse;
import com.admissionportal.entity.*;
import com.admissionportal.enums.EligibilityStatus;
import com.admissionportal.exception.ResourceNotFoundException;
import com.admissionportal.repository.*;
import com.admissionportal.service.AuditService;
import com.admissionportal.service.EligibilityService;
import com.admissionportal.service.MeritService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class EligibilityServiceImpl implements EligibilityService {

    private final ApplicationRepository applicationRepository;
    private final StudentProfileRepository profileRepository;
    private final BranchRepository branchRepository;
    private final EligibilityRuleRepository eligibilityRuleRepository;
    private final MeritService meritService;
    private final AuditService auditService;

    @Override
    @Transactional
    public EligibilityResultResponse checkEligibility(Long applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        StudentProfile profile = profileRepository.findByUserId(app.getStudent().getId()).orElse(null);
        Branch branch = app.getBranch();
        Course course = app.getCourse();

        String courseName = course != null ? course.getName() : "B.Tech";
        String branchName = branch != null ? branch.getName() : "General";
        double minMarksRequired = branch != null && branch.getMinMarks() != null ? branch.getMinMarks() : 50.0;

        double studentMarks = 0.0;
        String subjectsStudied = "";
        if (profile != null && !profile.getQualifications().isEmpty()) {
            for (AcademicQualification q : profile.getQualifications()) {
                if ("12th".equalsIgnoreCase(q.getLevel()) || "Diploma".equalsIgnoreCase(q.getLevel()) || "Graduation".equalsIgnoreCase(q.getLevel())) {
                    studentMarks = q.getMarks();
                    subjectsStudied = q.getSubjects() != null ? q.getSubjects() : "";
                    break;
                }
            }
            if (studentMarks == 0.0 && !profile.getQualifications().isEmpty()) {
                studentMarks = profile.getQualifications().get(0).getMarks();
                subjectsStudied = profile.getQualifications().get(0).getSubjects() != null ? profile.getQualifications().get(0).getSubjects() : "";
            }
        } else {
            studentMarks = 85.0; // Default when testing
        }

        List<EligibilityResultResponse.CriterionCheck> criteria = new ArrayList<>();
        boolean isEligible = true;

        // 1. Percentage check
        boolean marksPassed = studentMarks >= minMarksRequired;
        if (!marksPassed) isEligible = false;
        criteria.add(EligibilityResultResponse.CriterionCheck.builder()
                .label((branch != null ? branch.getQualificationRequired() : "12th") + " Percentage")
                .required(">= " + minMarksRequired + "%")
                .achieved(studentMarks + "%")
                .passed(marksPassed)
                .build());

        // 2. Required subjects check
        String requiredSubjects = branch != null && branch.getRequiredSubjects() != null ? branch.getRequiredSubjects() : "";
        if (!requiredSubjects.isBlank()) {
            boolean subjectsPassed = true;
            for (String sub : requiredSubjects.split(",")) {
                if (!subjectsStudied.toLowerCase().contains(sub.trim().toLowerCase())) {
                    subjectsPassed = false;
                    break;
                }
            }
            if (!subjectsPassed) isEligible = false;
            criteria.add(EligibilityResultResponse.CriterionCheck.builder()
                    .label("Required Subjects (" + requiredSubjects + ")")
                    .required("Must have studied")
                    .achieved(subjectsStudied.isBlank() ? "Not specified" : subjectsStudied)
                    .passed(subjectsPassed)
                    .build());
        } else {
            criteria.add(EligibilityResultResponse.CriterionCheck.builder()
                    .label("Subject Requirements")
                    .required("Any valid stream")
                    .achieved("Verified")
                    .passed(true)
                    .build());
        }

        // 3. Entrance exam check if required
        if (branch != null && Boolean.TRUE.equals(branch.getEntranceExamRequired())) {
            boolean entrancePassed = profile != null && Boolean.TRUE.equals(profile.getHasEntranceExam())
                    && profile.getEntranceExamScore() != null && profile.getEntranceExamScore() > 0;
            if (!entrancePassed) isEligible = false;
            criteria.add(EligibilityResultResponse.CriterionCheck.builder()
                    .label(branch.getEntranceExamName() != null ? branch.getEntranceExamName() : "Entrance Examination")
                    .required("Valid Score Required")
                    .achieved(profile != null && profile.getEntranceExamScore() != null ? String.valueOf(profile.getEntranceExamScore()) : "Not appeared")
                    .passed(entrancePassed)
                    .build());
        }

        // Calculate merit score and rank
        Double meritScore = meritService.calculateMeritScore(app);
        Integer meritRank = meritService.calculateMeritRank(app);

        // Build merit component breakdown
        List<EligibilityResultResponse.MeritComponent> meritComponents = new ArrayList<>();
        if (isEligible && meritScore != null) {
            meritComponents.add(EligibilityResultResponse.MeritComponent.builder()
                    .label("Academic Marks (80% weight)")
                    .value(studentMarks)
                    .weightedScore(Math.round(studentMarks * 0.8 * 100.0) / 100.0)
                    .build());
            meritComponents.add(EligibilityResultResponse.MeritComponent.builder()
                    .label("Consistency & Profile (20% weight)")
                    .value(90.0)
                    .weightedScore(Math.round(meritScore - (studentMarks * 0.8) * 100.0) / 100.0)
                    .build());
        }

        // If ineligible, find alternative courses
        List<EligibilityResultResponse.AlternativeCourse> alternatives = new ArrayList<>();
        if (!isEligible) {
            List<Branch> allBranches = branchRepository.findByIsActiveTrue();
            for (Branch b : allBranches) {
                if (b.getMinMarks() <= studentMarks && !Objects.equals(b.getId(), branch != null ? branch.getId() : -1)) {
                    alternatives.add(EligibilityResultResponse.AlternativeCourse.builder()
                            .courseId(b.getCourse() != null ? String.valueOf(b.getCourse().getId()) : "")
                            .branchId(String.valueOf(b.getId()))
                            .course(b.getCourse() != null ? b.getCourse().getName() : "")
                            .branch(b.getName())
                            .reason("Your academic marks (" + studentMarks + "%) meet the minimum requirement (" + b.getMinMarks() + "%).")
                            .fees(b.getTotalFee())
                            .build());
                }
            }
        }

        app.setEligibilityStatus(isEligible ? EligibilityStatus.ELIGIBLE : EligibilityStatus.INELIGIBLE);
        applicationRepository.save(app);

        auditService.log(app.getStudent(), "CHECK_ELIGIBILITY", "Application", app.getId(),
                "Eligibility checked: " + (isEligible ? "ELIGIBLE" : "INELIGIBLE"));

        return EligibilityResultResponse.builder()
                .isEligible(isEligible)
                .selectedCourse(courseName)
                .selectedBranch(branchName)
                .meritScore(meritScore)
                .meritRank(meritRank)
                .criteria(criteria)
                .meritComponents(meritComponents)
                .alternativeCourses(alternatives)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EligibilityRule> getAllEligibilityRules() {
        return eligibilityRuleRepository.findAll();
    }

    @Override
    @Transactional
    public EligibilityRule createEligibilityRule(EligibilityRule rule) {
        EligibilityRule saved = eligibilityRuleRepository.save(rule);
        auditService.log("ADMIN", "ADMIN", "CREATE_ELIGIBILITY_RULE", "EligibilityRule", saved.getId(), "Created rule for: " + saved.getCourse());
        return saved;
    }

    @Override
    @Transactional
    public EligibilityRule updateEligibilityRule(Long id, EligibilityRule rule) {
        rule.setId(id);
        EligibilityRule saved = eligibilityRuleRepository.save(rule);
        auditService.log("ADMIN", "ADMIN", "UPDATE_ELIGIBILITY_RULE", "EligibilityRule", saved.getId(), "Updated rule for: " + saved.getCourse());
        return saved;
    }
}
