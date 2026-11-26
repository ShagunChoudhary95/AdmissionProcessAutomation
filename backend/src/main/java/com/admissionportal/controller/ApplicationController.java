package com.admissionportal.controller;

import com.admissionportal.dto.CourseSelectionRequest;
import com.admissionportal.dto.EligibilityResultResponse;
import com.admissionportal.entity.Application;
import com.admissionportal.security.CustomUserDetails;
import com.admissionportal.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> createDraft(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Application application = applicationService.createDraft(userDetails.getId());
        return ResponseEntity.ok(Map.of("application", application));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getMyApplications(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<Application> applications = applicationService.getMyApplications(userDetails.getId());
        Application primaryApp = applications.isEmpty() ? null : applications.get(0);
        Map<String, Object> response = new HashMap<>();
        response.put("applications", applications);
        response.put("application", primaryApp);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Application> getApplicationById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(applicationService.getApplicationById(id, userDetails.getId()));
    }

    @PutMapping("/{id}/course")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> updateCourse(
            @PathVariable Long id,
            @RequestBody CourseSelectionRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Application app = applicationService.updateCourse(id, request, userDetails.getId());
        return ResponseEntity.ok(Map.of("application", app));
    }

    @GetMapping("/{id}/eligibility")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EligibilityResultResponse> checkEligibility(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(applicationService.checkEligibility(id, userDetails.getId()));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> submitApplication(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Application app = applicationService.submitApplication(id, userDetails.getId());
        return ResponseEntity.ok(Map.of("application", app, "message", "Application submitted successfully"));
    }

    @PutMapping("/{id}/correction")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> submitCorrection(
            @PathVariable Long id,
            @RequestBody Map<String, Object> data,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Application app = applicationService.submitCorrection(id, data, userDetails.getId());
        return ResponseEntity.ok(Map.of("application", app, "message", "Corrections submitted successfully"));
    }

    @GetMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getApplicationStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(applicationService.getApplicationStatus(id, userDetails.getId()));
    }
}
