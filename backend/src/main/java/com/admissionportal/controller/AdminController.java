package com.admissionportal.controller;

import com.admissionportal.dto.BranchRequest;
import com.admissionportal.dto.ReviewActionRequest;
import com.admissionportal.dto.SeatUpdateRequest;
import com.admissionportal.entity.*;
import com.admissionportal.exception.ResourceNotFoundException;
import com.admissionportal.repository.UserRepository;
import com.admissionportal.security.CustomUserDetails;
import com.admissionportal.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/applications")
    public ResponseEntity<Map<String, Object>> getApplications(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String course,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(adminService.getApplications(status, course, search, page, limit));
    }

    @GetMapping("/applications/{id}")
    public ResponseEntity<Map<String, Object>> getApplication(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getApplicationDetail(id));
    }

    @PutMapping("/applications/{id}/review")
    public ResponseEntity<Map<String, String>> reviewApplication(
            @PathVariable Long id,
            @RequestBody ReviewActionRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User admin = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        adminService.reviewApplication(id, request, admin);
        return ResponseEntity.ok(Map.of("message", "Application review saved successfully"));
    }

    @PostMapping("/applications/{id}/offer")
    public ResponseEntity<Map<String, String>> issueOffer(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> offerData,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User admin = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        adminService.issueOffer(id, offerData, admin);
        return ResponseEntity.ok(Map.of("message", "Admission offer issued successfully"));
    }

    @GetMapping("/merit-list/{branchId}")
    public ResponseEntity<Map<String, Object>> getMeritList(@PathVariable Long branchId) {
        List<Map<String, Object>> meritList = adminService.getMeritList(branchId);
        return ResponseEntity.ok(Map.of("meritList", meritList));
    }

    @GetMapping("/courses")
    public ResponseEntity<Map<String, Object>> getCourses() {
        List<Course> courses = adminService.getAllCourses();
        return ResponseEntity.ok(Map.of("courses", courses));
    }

    @PostMapping("/courses")
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        return ResponseEntity.ok(adminService.createCourse(course));
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course course) {
        return ResponseEntity.ok(adminService.updateCourse(id, course));
    }

    @GetMapping("/branches")
    public ResponseEntity<Map<String, Object>> getBranches(@RequestParam(required = false) Long courseId) {
        List<Branch> branches = adminService.getBranches(courseId);
        return ResponseEntity.ok(Map.of("branches", branches));
    }

    @PostMapping("/branches")
    public ResponseEntity<Branch> createBranch(@RequestBody BranchRequest request) {
        return ResponseEntity.ok(adminService.createBranch(request));
    }

    @PutMapping("/branches/{id}")
    public ResponseEntity<Branch> updateBranch(@PathVariable Long id, @RequestBody BranchRequest request) {
        return ResponseEntity.ok(adminService.updateBranch(id, request));
    }

    @GetMapping("/eligibility-rules")
    public ResponseEntity<Map<String, Object>> getEligibilityRules() {
        List<EligibilityRule> rules = adminService.getEligibilityRules();
        return ResponseEntity.ok(Map.of("rules", rules));
    }

    @PostMapping("/eligibility-rules")
    public ResponseEntity<EligibilityRule> createEligibilityRule(@RequestBody EligibilityRule rule) {
        return ResponseEntity.ok(adminService.createEligibilityRule(rule));
    }

    @PutMapping("/eligibility-rules/{id}")
    public ResponseEntity<EligibilityRule> updateEligibilityRule(@PathVariable Long id, @RequestBody EligibilityRule rule) {
        return ResponseEntity.ok(adminService.updateEligibilityRule(id, rule));
    }

    @GetMapping("/merit-rules")
    public ResponseEntity<Map<String, Object>> getMeritRules() {
        List<MeritRule> rules = adminService.getMeritRules();
        return ResponseEntity.ok(Map.of("rules", rules));
    }

    @PostMapping("/merit-rules")
    public ResponseEntity<MeritRule> createMeritRule(@RequestBody MeritRule rule) {
        return ResponseEntity.ok(adminService.createMeritRule(rule));
    }

    @PutMapping("/merit-rules/{id}")
    public ResponseEntity<MeritRule> updateMeritRule(@PathVariable Long id, @RequestBody MeritRule rule) {
        return ResponseEntity.ok(adminService.updateMeritRule(id, rule));
    }

    @GetMapping("/seats")
    public ResponseEntity<Map<String, Object>> getSeats() {
        List<Map<String, Object>> seats = adminService.getSeats();
        return ResponseEntity.ok(Map.of("seats", seats));
    }

    @PutMapping("/seats/{branchId}")
    public ResponseEntity<Map<String, String>> updateSeats(
            @PathVariable Long branchId,
            @RequestBody SeatUpdateRequest request) {
        adminService.updateSeats(branchId, request);
        return ResponseEntity.ok(Map.of("message", "Seat allocation updated successfully"));
    }

    @GetMapping("/reports/{type}")
    public ResponseEntity<Map<String, Object>> getReports(
            @PathVariable String type,
            @RequestParam Map<String, String> allParams) {
        return ResponseEntity.ok(adminService.getReports(type, allParams));
    }
}
