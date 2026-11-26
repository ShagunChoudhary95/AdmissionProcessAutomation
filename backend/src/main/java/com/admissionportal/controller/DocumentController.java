package com.admissionportal.controller;

import com.admissionportal.entity.Document;
import com.admissionportal.security.CustomUserDetails;
import com.admissionportal.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping("/{applicationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> listDocuments(@PathVariable Long applicationId) {
        List<Document> documents = documentService.getDocumentsForApplication(applicationId);
        return ResponseEntity.ok(Map.of("documents", documents));
    }

    @PostMapping(value = "/{applicationId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @PathVariable Long applicationId,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "documentType", required = false) String documentType,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String actualType = (type != null && !type.isBlank()) ? type : documentType;
        if (actualType == null || actualType.isBlank()) {
            actualType = "General Document";
        }
        Document doc = documentService.uploadDocument(applicationId, userDetails.getId(), actualType, file);
        return ResponseEntity.ok(Map.of("document", doc, "message", "Document uploaded successfully"));
    }

    @PostMapping(value = "/{applicationId}/{docId}/reupload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> reuploadDocument(
            @PathVariable Long applicationId,
            @PathVariable Long docId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Document doc = documentService.reuploadDocument(applicationId, docId, userDetails.getId(), file);
        return ResponseEntity.ok(Map.of("document", doc, "message", "Document re-uploaded successfully"));
    }

    @GetMapping("/{applicationId}/{docId}/file")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> getDocumentFile(
            @PathVariable Long applicationId,
            @PathVariable Long docId) {
        Resource file = documentService.loadDocumentFile(applicationId, docId);
        String fileName = documentService.getDocumentFileName(docId);
        String contentType = fileName.endsWith(".pdf") ? "application/pdf" : "image/jpeg";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .body(file);
    }
}
