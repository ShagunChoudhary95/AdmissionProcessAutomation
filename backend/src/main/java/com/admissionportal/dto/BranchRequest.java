package com.admissionportal.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class BranchRequest {
    private String courseId;
    private String name;
    private String code;
    private Double minMarks;
    private Integer totalSeats;
    private BigDecimal tuitionFee;
    private BigDecimal registrationFee;
    private String qualificationRequired;
    private String requiredSubjects;
    private Boolean entranceExamRequired;
    private String entranceExamName;
    private Boolean isActive;

    public Integer getIntake() {
        return totalSeats;
    }

    public void setIntake(Integer intake) {
        this.totalSeats = intake;
    }

    public BigDecimal getAdmissionFee() {
        return tuitionFee != null ? tuitionFee : BigDecimal.valueOf(125000);
    }

    public void setAdmissionFee(BigDecimal fee) {
        this.tuitionFee = fee;
    }
}
