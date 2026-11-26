package com.admissionportal.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "academic_qualifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademicQualification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @JsonIgnore
    private StudentProfile profile;

    @Column(nullable = false, length = 50)
    private String level;

    @Column(nullable = false, length = 150)
    private String board;

    @Column(nullable = false, length = 255)
    private String schoolCollege;

    @Column(nullable = false, length = 4)
    private String yearOfPassing;

    @Builder.Default
    @Column(length = 20)
    private String marksType = "Percentage";

    @Column(nullable = false)
    private Double marks;

    @Builder.Default
    private Double maxMarks = 100.0;

    private String subjects;
    private String rollNumber;

    @JsonProperty("_id")
    public String getUnderscoreId() {
        return id != null ? String.valueOf(id) : null;
    }

    public String getSchoolOrCollege() {
        return schoolCollege;
    }

    public void setSchoolOrCollege(String sc) {
        this.schoolCollege = sc;
    }

    public Double getPercentageOrCgpa() {
        return marks;
    }

    public void setPercentageOrCgpa(Double m) {
        this.marks = m;
    }
}
