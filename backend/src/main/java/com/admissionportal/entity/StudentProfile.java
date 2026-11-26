package com.admissionportal.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "student_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    // Personal details
    private LocalDate dob;
    private String gender;
    private String alternatePhone;
    private String category;
    private String religion;
    @Builder.Default
    private String nationality = "Indian";
    private String domicileState;
    private String parentName;
    private String parentPhone;
    private String parentOccupation;
    private String annualIncome;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String pincode;

    // Academic qualifications
    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AcademicQualification> qualifications = new ArrayList<>();

    // Entrance exam
    @Builder.Default
    private Boolean hasEntranceExam = false;
    private String entranceExamName;
    private String entranceExamRollNo;
    private Double entranceExamScore;
    private Integer entranceExamRank;

    // Education gap
    @Builder.Default
    private Boolean hasGap = false;
    @Column(columnDefinition = "TEXT")
    private String gapReason;

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

    @JsonProperty("phone")
    public String getPhone() {
        return user != null ? user.getPhone() : alternatePhone;
    }

    @JsonProperty("dateOfBirth")
    public LocalDate getDateOfBirth() {
        return dob;
    }

    @JsonProperty("address")
    public String getAddress() {
        StringBuilder sb = new StringBuilder();
        if (addressLine1 != null && !addressLine1.isBlank()) sb.append(addressLine1);
        if (city != null && !city.isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(city);
        }
        if (state != null && !state.isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(state);
        }
        if (pincode != null && !pincode.isBlank()) {
            if (sb.length() > 0) sb.append(" - ");
            sb.append(pincode);
        }
        return sb.toString();
    }
}
