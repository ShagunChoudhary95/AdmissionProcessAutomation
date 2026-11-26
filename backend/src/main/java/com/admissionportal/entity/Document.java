package com.admissionportal.entity;

import com.admissionportal.enums.DocumentStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    @JsonIgnore
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private User student;

    @Column(nullable = false, length = 100)
    private String documentType;

    @Builder.Default
    @Column(name = "required_for_course")
    private Boolean requiredForCourse = true;

    private String filePath;
    private String originalFileName;
    private String fileType;
    private Long fileSize;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private DocumentStatus verificationStatus = DocumentStatus.NOT_UPLOADED;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    private Instant verifiedAt;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("timestamp DESC")
    @Builder.Default
    private List<DocumentHistory> history = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @JsonProperty("_id")
    public String getUnderscoreId() {
        return id != null ? String.valueOf(id) : null;
    }

    @JsonProperty("required")
    public Boolean getRequired() {
        return requiredForCourse;
    }

    @JsonProperty("status")
    public DocumentStatus getStatus() {
        return verificationStatus;
    }

    public void setStatus(DocumentStatus status) {
        this.verificationStatus = status;
    }

    @JsonProperty("currentVersion")
    public Map<String, Object> getCurrentVersion() {
        Map<String, Object> version = new HashMap<>();
        version.put("filePath", filePath);
        version.put("originalFileName", originalFileName);
        version.put("uploadedAt", updatedAt != null ? updatedAt : createdAt);
        version.put("verificationStatus", verificationStatus != null ? verificationStatus.getValue() : "Not Uploaded");
        version.put("remarks", remarks);
        version.put("verifiedBy", verifiedBy != null ? verifiedBy.getName() : null);
        version.put("verifiedAt", verifiedAt);
        return version;
    }
}
