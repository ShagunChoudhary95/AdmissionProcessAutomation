package com.admissionportal.service.impl;

import com.admissionportal.entity.*;
import com.admissionportal.enums.ApplicationStatus;
import com.admissionportal.enums.DocumentStatus;
import com.admissionportal.exception.ResourceNotFoundException;
import com.admissionportal.repository.ApplicationRepository;
import com.admissionportal.repository.ApplicationStatusHistoryRepository;
import com.admissionportal.repository.DocumentHistoryRepository;
import com.admissionportal.repository.DocumentRepository;
import com.admissionportal.service.DocumentService;
import com.admissionportal.service.NotificationService;
import com.admissionportal.service.OfficerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OfficerServiceImpl implements OfficerService {

    private final ApplicationRepository applicationRepository;
    private final DocumentRepository documentRepository;
    private final DocumentHistoryRepository historyRepository;
    private final DocumentService documentService;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        long pendingApps = applicationRepository.countByStatus(ApplicationStatus.SUBMITTED)
                + applicationRepository.countByStatus(ApplicationStatus.UNDER_VERIFICATION);
        long verifiedApps = applicationRepository.countByStatus(ApplicationStatus.VERIFIED);
        long rejectedDocs = documentRepository.findAll().stream()
                .filter(d -> d.getStatus() == DocumentStatus.REJECTED 
                          || d.getStatus() == DocumentStatus.RE_UPLOAD_REQUIRED 
                          || d.getStatus() == DocumentStatus.REUPLOAD_REQUESTED)
                .count();

        Instant todayStart = Instant.now().truncatedTo(ChronoUnit.DAYS);
        long verifiedToday = historyRepository.findAll().stream()
                .filter(h -> h.getAction() != null && h.getAction().contains("VERIFIED") && h.getTimestamp() != null && h.getTimestamp().isAfter(todayStart))
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("pendingVerification", pendingApps);
        stats.put("verifiedApplications", verifiedApps);
        stats.put("rejectedOrReupload", rejectedDocs);
        stats.put("verifiedToday", verifiedToday);
        stats.put("totalQueue", pendingApps);
        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getQueue(int page, int limit, String search) {
        List<Application> allApps = applicationRepository.findAll();
        List<Application> queue = allApps.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.SUBMITTED
                        || a.getStatus() == ApplicationStatus.UNDER_VERIFICATION
                        || a.getStatus() == ApplicationStatus.CORRECTION_REQUIRED)
                .filter(a -> {
                    if (search == null || search.isBlank()) return true;
                    String s = search.toLowerCase();
                    boolean matchNum = a.getApplicationNumber() != null && a.getApplicationNumber().toLowerCase().contains(s);
                    boolean matchName = a.getStudent() != null && a.getStudent().getName() != null && a.getStudent().getName().toLowerCase().contains(s);
                    return matchNum || matchName;
                })
                .sorted(Comparator.comparing((Application a) -> a.getCreatedAt() != null ? a.getCreatedAt() : Instant.EPOCH).reversed())
                .collect(Collectors.toList());

        int total = queue.size();
        int fromIndex = Math.min((page - 1) * limit, total);
        int toIndex = Math.min(fromIndex + limit, total);
        List<Application> paged = (fromIndex <= toIndex) ? queue.subList(fromIndex, toIndex) : Collections.emptyList();

        Map<String, Object> res = new HashMap<>();
        res.put("applications", paged);
        res.put("total", total);
        res.put("page", page);
        res.put("limit", limit);
        return res;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Document> getDocuments(Long applicationId) {
        return documentService.getDocumentsForApplication(applicationId);
    }

    @Override
    @Transactional
    public void verifyDocument(Long docId, User officer, String remarks) {
        documentService.verifyDocument(docId, officer, remarks);

        // Check if all docs for this application are now verified
        Document doc = documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + docId));
        Application app = doc.getApplication();
        List<Document> docs = documentRepository.findByApplicationId(app.getId());

        boolean allVerified = !docs.isEmpty() && docs.stream().allMatch(d -> d.getStatus() == DocumentStatus.VERIFIED);
        if (allVerified) {
            ApplicationStatus prev = app.getStatus();
            app.setStatus(ApplicationStatus.VERIFIED);
            applicationRepository.save(app);

            ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                    .application(app)
                    .fromStatus(prev)
                    .toStatus(ApplicationStatus.VERIFIED)
                    .remarks("All documents verified by Officer " + (officer != null ? officer.getName() : "Officer"))
                    .changedBy(officer)
                    .build();
            statusHistoryRepository.save(history);

            notificationService.sendNotification(
                    app.getStudent(),
                    "All Documents Verified",
                    "All required documents for application " + app.getApplicationNumber() + " have been verified successfully.",
                    "DOCUMENT"
            );
        } else if (app.getStatus() == ApplicationStatus.SUBMITTED) {
            app.setStatus(ApplicationStatus.UNDER_VERIFICATION);
            applicationRepository.save(app);
        }
    }

    @Override
    @Transactional
    public void rejectDocument(Long docId, User officer, String reason) {
        documentService.rejectDocument(docId, officer, reason);

        Document doc = documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + docId));
        Application app = doc.getApplication();
        ApplicationStatus prev = app.getStatus();
        app.setStatus(ApplicationStatus.CORRECTION_REQUIRED);
        app.setCorrectionRemarks("Document rejected: " + reason);
        applicationRepository.save(app);

        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(app)
                .fromStatus(prev)
                .toStatus(ApplicationStatus.CORRECTION_REQUIRED)
                .remarks("Document rejected by Officer: " + reason)
                .changedBy(officer)
                .build();
        statusHistoryRepository.save(history);
    }

    @Override
    @Transactional
    public void requestReupload(Long docId, User officer, String reason) {
        documentService.requestReupload(docId, officer, reason);

        Document doc = documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + docId));
        Application app = doc.getApplication();
        ApplicationStatus prev = app.getStatus();
        app.setStatus(ApplicationStatus.CORRECTION_REQUIRED);
        app.setCorrectionRemarks("Document re-upload requested: " + reason);
        applicationRepository.save(app);

        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(app)
                .fromStatus(prev)
                .toStatus(ApplicationStatus.CORRECTION_REQUIRED)
                .remarks("Document re-upload requested by Officer: " + reason)
                .changedBy(officer)
                .build();
        statusHistoryRepository.save(history);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getHistory(int page, int limit) {
        List<DocumentHistory> allHistory = documentService.getAllVerificationHistory();
        int total = allHistory.size();
        int fromIndex = Math.min((page - 1) * limit, total);
        int toIndex = Math.min(fromIndex + limit, total);
        List<DocumentHistory> paged = (fromIndex <= toIndex) ? allHistory.subList(fromIndex, toIndex) : Collections.emptyList();

        Map<String, Object> res = new HashMap<>();
        res.put("history", paged);
        res.put("total", total);
        res.put("page", page);
        res.put("limit", limit);
        return res;
    }
}
