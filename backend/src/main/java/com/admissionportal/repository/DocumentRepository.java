package com.admissionportal.repository;

import com.admissionportal.entity.Document;
import com.admissionportal.enums.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    @Query("SELECT d FROM Document d WHERE d.application.id = :applicationId")
    List<Document> findByApplicationId(@Param("applicationId") Long applicationId);

    @Query("SELECT d FROM Document d WHERE d.application.id = :applicationId AND d.documentType = :documentType")
    Optional<Document> findByApplicationIdAndDocumentType(@Param("applicationId") Long applicationId, @Param("documentType") String documentType);

    List<Document> findByVerificationStatus(DocumentStatus status);
    long countByVerificationStatus(DocumentStatus status);
}
