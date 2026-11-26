package com.admissionportal.service;

import com.admissionportal.dto.EligibilityResultResponse;
import com.admissionportal.entity.EligibilityRule;

import java.util.List;

public interface EligibilityService {
    EligibilityResultResponse checkEligibility(Long applicationId);
    List<EligibilityRule> getAllEligibilityRules();
    EligibilityRule createEligibilityRule(EligibilityRule rule);
    EligibilityRule updateEligibilityRule(Long id, EligibilityRule rule);
}
