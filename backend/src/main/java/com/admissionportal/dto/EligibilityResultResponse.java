package com.admissionportal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EligibilityResultResponse {
    @JsonProperty("isEligible")
    private boolean isEligible;
    private String selectedCourse;
    private String selectedBranch;
    private Double meritScore;
    private Integer meritRank;
    private List<CriterionCheck> criteria;
    private List<MeritComponent> meritComponents;
    private List<AlternativeCourse> alternativeCourses;

    public String getStatus() {
        return isEligible ? "ELIGIBLE" : "NOT_ELIGIBLE";
    }

    public List<String> getReasons() {
        if (criteria == null) return java.util.Collections.emptyList();
        return criteria.stream()
                .filter(c -> !c.isPassed())
                .map(c -> c.getLabel() + ": required " + c.getRequired() + ", but achieved " + c.getAchieved())
                .collect(java.util.stream.Collectors.toList());
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CriterionCheck {
        private String label;
        private String required;
        private String achieved;
        private boolean passed;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MeritComponent {
        private String label;
        private Double value;
        private Double weightedScore;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AlternativeCourse {
        private String courseId;
        private String branchId;
        private String course;
        private String branch;
        private String reason;
        private BigDecimal fees;
    }
}
