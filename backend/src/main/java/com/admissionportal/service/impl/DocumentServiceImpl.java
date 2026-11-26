package com.admissionportal.service.impl;

import com.admissionportal.entity.*;
import com.admissionportal.enums.DocumentStatus;
import com.admissionportal.exception.BadRequestException;
import com.admissionportal.exception.ResourceNotFoundException;
import com.admissionportal.repository.ApplicationRepository;
import com.admissionportal.repository.DocumentHistoryRepository;
import com.admissionportal.repository.DocumentRepository;
import com.admissionportal.repository.UserRepository;
import com.admissionportal.service.AuditService;
import com.admissionportal.service.DocumentService;
import com.admissionportal.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentHistoryRepository documentHistoryRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Value("${app.upload.dir:uploads/documents}")
    private String uploadDir;

    @Override
    @Transactional(readOnly = true)
    public List<Document> getDocumentsForApplication(Long applicationId) {
        return documentRepository.findByApplicationId(applicationId);
    }

    @Override
    @Transactional
    public Document uploadDocument(Long applicationId, Long userId, String documentType, MultipartFile file) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        User student = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        validateFile(file);

        String savedFileName = saveFileToDisk(applicationId, file);

        Document doc = documentRepository.findByApplicationIdAndDocumentType(applicationId, documentType)
                .orElse(Document.builder()
                        .application(app)
                        .student(student)
                        .documentType(documentType)
                        .requiredForCourse(true)
                        .build());

        doc.setFilePath(savedFileName);
        doc.setOriginalFileName(file.getOriginalFilename());
        doc.setFileType(file.getContentType());
        doc.setFileSize(file.getSize());
        doc.setVerificationStatus(DocumentStatus.PENDING_VERIFICATION);
        doc.setRemarks(null);

        doc = documentRepository.save(doc);

        auditService.log(student, "UPLOAD_DOCUMENT", "Document", doc.getId(),
                "Uploaded: " + documentType + " (" + file.getOriginalFilename() + ")");

        return doc;
    }

    @Override
    @Transactional
    public Document reuploadDocument(Long applicationId, Long docId, Long userId, MultipartFile file) {
        Document doc = documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        validateFile(file);

        // Archive current version to history
        DocumentHistory history = DocumentHistory.builder()
                .document(doc)
                .version(doc.getHistory().size() + 1)
                .filePath(doc.getFilePath())
                .decision(doc.getVerificationStatus().getValue())
                .officerName(doc.getVerifiedBy() != null ? doc.getVerifiedBy().getName() : "System")
                .remarks(doc.getRemarks())
                .build();
        documentHistoryRepository.save(history);

        String savedFileName = saveFileToDisk(applicationId, file);

        doc.setFilePath(savedFileName);
        doc.setOriginalFileName(file.getOriginalFilename());
        doc.setFileType(file.getContentType());
        doc.setFileSize(file.getSize());
        doc.setVerificationStatus(DocumentStatus.PENDING_VERIFICATION);
        doc.setRemarks(null);

        doc = documentRepository.save(doc);

        User student = userRepository.findById(userId).orElse(null);
        auditService.log(student, "REUPLOAD_DOCUMENT", "Document", doc.getId(),
                "Re-uploaded: " + doc.getDocumentType());

        return doc;
    }

    @Override
    @Transactional(readOnly = true)
    public Resource loadDocumentFile(Long applicationId, Long docId) {
        Document doc = documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        try {
            Path file = Paths.get(uploadDir, String.valueOf(applicationId), doc.getFilePath()).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found on storage disk");
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("File path invalid");
        }
    }

    @Override
    public String getDocumentFileName(Long docId) {
        return documentRepository.findById(docId)
                .map(d -> d.getOriginalFileName() != null ? d.getOriginalFileName() : d.getFilePath())
                .orElse("document.pdf");
    }

    @Override
    @Transactional
    public void verifyDocument(Long docId, User officer, String remarks) {
        Document doc = documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        doc.setVerificationStatus(DocumentStatus.VERIFIED);
        doc.setVerifiedBy(officer);
        doc.setVerifiedAt(Instant.now());
        doc.setRemarks(remarks != null && !remarks.isBlank() ? remarks : "Document verified and approved.");

        documentRepository.save(doc);

        // Record history
        DocumentHistory history = DocumentHistory.builder()
                .document(doc)
                .version(doc.getHistory().size() + 1)
                .filePath(doc.getFilePath())
                .decision("Verified")
                .officerName(officer.getName())
                .remarks(doc.getRemarks())
                .build();
        documentHistoryRepository.save(history);

        notificationService.sendNotification(doc.getStudent(), "Document Verified",
                "Your " + doc.getDocumentType() + " has been verified successfully.", "success");

        auditService.log(officer, "VERIFY_DOCUMENT", "Document", doc.getId(),
                "Verified " + doc.getDocumentType() + " for Application " + doc.getApplication().getApplicationNumber());
    }

    @Override
    @Transactional
    public void rejectDocument(Long docId, User officer, String reason) {
        if (reason == null || reason.isBlank()) {
            throw new BadRequestException("Mandatory rejection reason required.");
        }
        Document doc = documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        doc.setVerificationStatus(DocumentStatus.REJECTED);
        doc.setVerifiedBy(officer);
        doc.setVerifiedAt(Instant.now());
        doc.setRemarks(reason);

        documentRepository.save(doc);

        DocumentHistory history = DocumentHistory.builder()
                .document(doc)
                .version(doc.getHistory().size() + 1)
                .filePath(doc.getFilePath())
                .decision("Rejected")
                .officerName(officer.getName())
                .remarks(reason)
                .build();
        documentHistoryRepository.save(history);

        notificationService.sendNotification(doc.getStudent(), "Document Rejected",
                "Your " + doc.getDocumentType() + " was rejected: " + reason, "error");

        auditService.log(officer, "REJECT_DOCUMENT", "Document", doc.getId(),
                "Rejected " + doc.getDocumentType() + ": " + reason);
    }

    @Override
    @Transactional
    public void requestReupload(Long docId, User officer, String reason) {
        if (reason == null || reason.isBlank()) {
            throw new BadRequestException("Mandatory reason required for re-upload request.");
        }
        Document doc = documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        doc.setVerificationStatus(DocumentStatus.RE_UPLOAD_REQUIRED);
        doc.setVerifiedBy(officer);
        doc.setVerifiedAt(Instant.now());
        doc.setRemarks(reason);

        documentRepository.save(doc);

        DocumentHistory history = DocumentHistory.builder()
                .document(doc)
                .version(doc.getHistory().size() + 1)
                .filePath(doc.getFilePath())
                .decision("Re-upload Required")
                .officerName(officer.getName())
                .remarks(reason)
                .build();
        documentHistoryRepository.save(history);

        notificationService.sendNotification(doc.getStudent(), "Document Re-upload Required",
                "Action needed: Please re-upload your " + doc.getDocumentType() + ". Reason: " + reason, "warning");

        auditService.log(officer, "REQUEST_REUPLOAD", "Document", doc.getId(),
                "Requested re-upload for " + doc.getDocumentType() + ": " + reason);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentHistory> getAllVerificationHistory() {
        return documentHistoryRepository.findAllByOrderByTimestampDesc();
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file cannot be empty.");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("File exceeds maximum allowed size of 5 MB.");
        }
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        if (!filename.endsWith(".pdf") && !filename.endsWith(".jpg") && !filename.endsWith(".jpeg") && !filename.endsWith(".png")) {
            throw new BadRequestException("Invalid file format. Only PDF, JPG, and PNG are accepted.");
        }
    }

    private String saveFileToDisk(Long applicationId, MultipartFile file) {
        try {
            Path targetDir = Paths.get(uploadDir, String.valueOf(applicationId));
            if (!Files.exists(targetDir)) {
                Files.createDirectories(targetDir);
            }

            String extension = "";
            int i = file.getOriginalFilename() != null ? file.getOriginalFilename().lastIndexOf('.') : -1;
            if (i > 0) extension = file.getOriginalFilename().substring(i);

            String fileName = System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
            Path targetPath = targetDir.resolve(fileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return fileName;
        } catch (IOException e) {
            throw new BadRequestException("Failed to store file on server.");
        }
    }
}
