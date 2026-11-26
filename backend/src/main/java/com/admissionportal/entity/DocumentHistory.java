package com.admissionportal.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "document_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    @JsonIgnore
    private Document document;

    @Builder.Default
    private Integer version = 1;

    private String filePath;

    @Column(nullable = false, length = 50)
    private String decision;

    private String officerName;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @CreationTimestamp
    @Column(nullable = false)
    private Instant timestamp;

    @JsonProperty("_id")
    public String getUnderscoreId() {
        return id != null ? String.valueOf(id) : null;
    }

    public String getAction() {
        return decision;
    }

    public void setAction(String action) {
        this.decision = action;
    }

    @JsonProperty("officer")
    public String getOfficer() {
        return officerName;
    }

    @JsonProperty("applicationNumber")
    public String getApplicationNumber() {
        return document != null && document.getApplication() != null ? document.getApplication().getApplicationNumber() : null;
    }

    @JsonProperty("studentName")
    public String getStudentName() {
        return document != null && document.getApplication() != null && document.getApplication().getStudent() != null
                ? document.getApplication().getStudent().getName() : null;
    }

    @JsonProperty("documentType")
    public String getDocumentType() {
        return document != null ? document.getDocumentType() : null;
    }
}
