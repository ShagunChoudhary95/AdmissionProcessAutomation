package com.admissionportal.controller;

import com.admissionportal.dto.AcademicDetailsRequest;
import com.admissionportal.dto.PersonalDetailsRequest;
import com.admissionportal.security.CustomUserDetails;
import com.admissionportal.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(studentService.getStudentProfile(userDetails.getId()));
    }

    @PutMapping("/profile/personal")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> updatePersonal(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody PersonalDetailsRequest request) {
        studentService.updatePersonalDetails(userDetails.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Personal details saved successfully"));
    }

    @PutMapping("/profile/academic")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> updateAcademic(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AcademicDetailsRequest request) {
        studentService.updateAcademicDetails(userDetails.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Academic details saved successfully"));
    }
}
