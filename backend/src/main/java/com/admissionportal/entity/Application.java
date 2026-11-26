package com.admissionportal.entity;

import com.admissionportal.enums.ApplicationStatus;
import com.admissionportal.enums.EligibilityStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String applicationNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private EligibilityStatus eligibilityStatus = EligibilityStatus.PENDING;

    private Double meritScore;
    private Integer meritRank;

    private Instant offerExpiresAt;
    private Instant submittedAt;
    private Instant reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User reviewedBy;

    @Column(columnDefinition = "TEXT")
    private String reviewRemarks;

    @Column(columnDefinition = "TEXT")
    private String correctionRemarks;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("timestamp DESC")
    @Builder.Default
    private List<ApplicationStatusHistory> statusHistory = new ArrayList<>();

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

    @JsonProperty("courseId")
    public Course getCourseId() {
        return course;
    }

    @JsonProperty("branchId")
    public Branch getBranchId() {
        return branch;
    }

    @JsonProperty("studentName")
    public String getStudentName() {
        return student != null ? student.getName() : null;
    }

    @JsonProperty("email")
    public String getEmail() {
        return student != null ? student.getEmail() : null;
    }
}
