package com.admissionportal.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long actorId;
    private String actorName;
    private String actorRole;

    @Column(nullable = false, length = 100)
    private String action;

    private String targetType;
    private Long targetId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @CreationTimestamp
    @Column(nullable = false)
    private Instant timestamp;

    @JsonProperty("_id")
    public String getUnderscoreId() {
        return id != null ? String.valueOf(id) : null;
    }
}
