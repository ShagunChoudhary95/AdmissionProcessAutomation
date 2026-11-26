package com.admissionportal.dto;

import lombok.Data;

import java.util.List;

@Data
public class AcademicDetailsRequest {
    private List<QualificationItem> qualifications;
    private Boolean hasEntranceExam;
    private String entranceExamName;
    private String entranceExamRollNo;
    private Double entranceExamScore;
    private Integer entranceExamRank;
    private Boolean hasGap;
    private String gapReason;

    @Data
    public static class QualificationItem {
        private String level;
        private String board;
        private String schoolCollege;
        private String schoolOrCollege;
        private String yearOfPassing;
        private String marksType;
        private Double marks;
        private Double percentageOrCgpa;
        private Double maxMarks;
        private String subjects;
        private String rollNumber;

        public String getEffectiveSchoolCollege() {
            return schoolCollege != null && !schoolCollege.isBlank() ? schoolCollege : (schoolOrCollege != null ? schoolOrCollege : "");
        }

        public Double getEffectiveMarks() {
            return marks != null ? marks : (percentageOrCgpa != null ? percentageOrCgpa : 0.0);
        }
    }
}
