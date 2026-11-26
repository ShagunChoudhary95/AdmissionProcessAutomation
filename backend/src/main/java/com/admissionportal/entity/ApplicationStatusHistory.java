package com.admissionportal.entity;

import com.admissionportal.enums.ApplicationStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "application_status_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    @JsonIgnore
    private Application application;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(nullable = false, length = 100)
    private String actor;

    @Column(columnDefinition = "TEXT")
    private String note;

    @CreationTimestamp
    @Column(nullable = false)
    private Instant timestamp;

    @JsonProperty("_id")
    public String getUnderscoreId() {
        return id != null ? String.valueOf(id) : null;
    }

    public ApplicationStatus getToStatus() {
        return status != null ? ApplicationStatus.fromValue(status) : null;
    }

    public String getRemarks() {
        return note;
    }

    public User getChangedBy() {
        return null;
    }

    public String getActor() {
        return actor;
    }

    public static class ApplicationStatusHistoryBuilder {
        public ApplicationStatusHistoryBuilder toStatus(ApplicationStatus s) {
            this.status = s != null ? s.name() : null;
            return this;
        }

        public ApplicationStatusHistoryBuilder fromStatus(ApplicationStatus s) {
            return this;
        }

        public ApplicationStatusHistoryBuilder remarks(String r) {
            this.note = r;
            return this;
        }

        public ApplicationStatusHistoryBuilder changedBy(User u) {
            this.actor = u != null ? u.getName() : "System";
            return this;
        }
    }
}
