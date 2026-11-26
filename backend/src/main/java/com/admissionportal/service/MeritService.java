package com.admissionportal.service;

import com.admissionportal.entity.Application;
import com.admissionportal.entity.MeritRule;

import java.util.List;
import java.util.Map;

public interface MeritService {
    Double calculateMeritScore(Application application);
    Integer calculateMeritRank(Application application);
    List<MeritRule> getAllMeritRules();
    MeritRule createMeritRule(MeritRule rule);
    MeritRule updateMeritRule(Long id, MeritRule rule);
    List<Map<String, Object>> getRankedMeritList(Long branchId);
}
