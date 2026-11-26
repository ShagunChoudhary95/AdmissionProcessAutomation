package com.admissionportal.service;

import com.admissionportal.dto.CourseSelectionRequest;
import com.admissionportal.dto.EligibilityResultResponse;
import com.admissionportal.entity.Application;

import java.util.List;
import java.util.Map;

public interface ApplicationService {
    Application createDraft(Long userId);
    List<Application> getMyApplications(Long userId);
    Application getApplicationById(Long id, Long userId);
    Application updateCourse(Long id, CourseSelectionRequest request, Long userId);
    EligibilityResultResponse checkEligibility(Long id, Long userId);
    Application submitApplication(Long id, Long userId);
    Application submitCorrection(Long id, Map<String, Object> data, Long userId);
    Map<String, Object> getApplicationStatus(Long id, Long userId);
}
