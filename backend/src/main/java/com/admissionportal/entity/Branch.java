package com.admissionportal.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.Map;

@Entity
@Table(name = "branches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Branch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnore
    private Course course;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 30)
    private String code;

    @Builder.Default
    @Column(nullable = false)
    private Double minMarks = 50.0;

    @Builder.Default
    private String qualificationRequired = "12th";

    private String requiredSubjects;

    @Builder.Default
    private Boolean entranceExamRequired = false;

    private String entranceExamName;

    @Builder.Default
    @Column(nullable = false)
    private Integer totalSeats = 60;

    @Builder.Default
    @Column(nullable = false)
    private Integer confirmedSeats = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer reservedSeats = 0;

    @Builder.Default
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal tuitionFee = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal registrationFee = new BigDecimal("5000.00");

    @Builder.Default
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalFee = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @JsonProperty("_id")
    public String getUnderscoreId() {
        return id != null ? String.valueOf(id) : null;
    }

    @JsonProperty("courseId")
    public String getCourseIdString() {
        return course != null ? String.valueOf(course.getId()) : null;
    }

    @JsonProperty("courseName")
    public String getCourseName() {
        return course != null ? course.getName() : null;
    }

    public Integer getIntake() {
        return totalSeats != null ? totalSeats : 60;
    }

    public void setIntake(Integer intake) {
        this.totalSeats = intake;
    }

    public Integer getFilledSeats() {
        return confirmedSeats != null ? confirmedSeats : 0;
    }

    public void setFilledSeats(Integer filledSeats) {
        this.confirmedSeats = filledSeats;
    }

    public BigDecimal getAdmissionFee() {
        if (totalFee != null && totalFee.compareTo(BigDecimal.ZERO) > 0) return totalFee;
        if (tuitionFee != null) return tuitionFee.add(registrationFee != null ? registrationFee : BigDecimal.ZERO);
        return BigDecimal.valueOf(125000);
    }

    public void setAdmissionFee(BigDecimal fee) {
        this.totalFee = fee;
        this.tuitionFee = fee;
    }

    @JsonProperty("fees")
    public Map<String, Object> getFees() {
        return Map.of(
            "tuition", tuitionFee,
            "registration", registrationFee,
            "total", totalFee != null && totalFee.compareTo(BigDecimal.ZERO) > 0 ? totalFee : tuitionFee.add(registrationFee)
        );
    }
}
