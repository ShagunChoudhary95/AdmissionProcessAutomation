package com.admissionportal.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class EligibilityRuleRequest {
    private String course;
    private String branch;
    private String description;
    private List<Map<String, Object>> criteria;
    private Boolean isActive;
}
