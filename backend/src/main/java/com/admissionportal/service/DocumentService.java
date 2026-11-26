package com.admissionportal.service;

import com.admissionportal.entity.Document;
import com.admissionportal.entity.DocumentHistory;
import com.admissionportal.entity.User;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DocumentService {
    List<Document> getDocumentsForApplication(Long applicationId);
    Document uploadDocument(Long applicationId, Long userId, String documentType, MultipartFile file);
    Document reuploadDocument(Long applicationId, Long docId, Long userId, MultipartFile file);
    Resource loadDocumentFile(Long applicationId, Long docId);
    String getDocumentFileName(Long docId);

    void verifyDocument(Long docId, User officer, String remarks);
    void rejectDocument(Long docId, User officer, String reason);
    void requestReupload(Long docId, User officer, String reason);

    List<DocumentHistory> getAllVerificationHistory();
}
