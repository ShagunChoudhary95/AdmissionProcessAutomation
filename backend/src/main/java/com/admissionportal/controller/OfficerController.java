package com.admissionportal.controller;

import com.admissionportal.entity.Document;
import com.admissionportal.entity.User;
import com.admissionportal.exception.ResourceNotFoundException;
import com.admissionportal.repository.UserRepository;
import com.admissionportal.security.CustomUserDetails;
import com.admissionportal.service.OfficerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/officer")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
public class OfficerController {

    private final OfficerService officerService;
    private final UserRepository userRepository;
    private final com.admissionportal.service.AdminService adminService;

    @GetMapping("/applications/{applicationId}")
    public ResponseEntity<Map<String, Object>> getApplicationDetail(@PathVariable Long applicationId) {
        return ResponseEntity.ok(adminService.getApplicationDetail(applicationId));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(officerService.getDashboardStats());
    }

    @GetMapping("/queue")
    public ResponseEntity<Map<String, Object>> getQueue(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(officerService.getQueue(page, limit, search));
    }

    @GetMapping("/applications/{applicationId}/documents")
    public ResponseEntity<Map<String, Object>> getDocuments(@PathVariable Long applicationId) {
        List<Document> documents = officerService.getDocuments(applicationId);
        return ResponseEntity.ok(Map.of("documents", documents));
    }

    @PutMapping("/documents/{docId}/verify")
    public ResponseEntity<Map<String, String>> verifyDocument(
            @PathVariable Long docId,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User officer = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String remarks = body != null && body.containsKey("remarks") ? body.get("remarks") : "Document verified";
        officerService.verifyDocument(docId, officer, remarks);
        return ResponseEntity.ok(Map.of("message", "Document marked as verified"));
    }

    @PutMapping("/documents/{docId}/reject")
    public ResponseEntity<Map<String, String>> rejectDocument(
            @PathVariable Long docId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User officer = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String reason = body != null && body.containsKey("reason") ? body.get("reason") : "Document rejected";
        officerService.rejectDocument(docId, officer, reason);
        return ResponseEntity.ok(Map.of("message", "Document rejected"));
    }

    @PutMapping("/documents/{docId}/request-reupload")
    public ResponseEntity<Map<String, String>> requestReupload(
            @PathVariable Long docId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User officer = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String reason = body != null && body.containsKey("reason") ? body.get("reason") : "Re-upload requested";
        officerService.requestReupload(docId, officer, reason);
        return ResponseEntity.ok(Map.of("message", "Re-upload requested"));
    }

    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getHistory(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(officerService.getHistory(page, limit));
    }
}
