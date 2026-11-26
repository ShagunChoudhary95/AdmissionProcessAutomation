package com.admissionportal.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class MeritRuleRequest {
    private String course;
    private String branch;
    private String description;
    private List<Map<String, Object>> formula;
    private Boolean isActive;
}
