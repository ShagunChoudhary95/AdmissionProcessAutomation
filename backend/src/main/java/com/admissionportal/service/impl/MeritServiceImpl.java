package com.admissionportal.service.impl;

import com.admissionportal.entity.*;
import com.admissionportal.repository.ApplicationRepository;
import com.admissionportal.repository.MeritRuleRepository;
import com.admissionportal.repository.StudentProfileRepository;
import com.admissionportal.service.AuditService;
import com.admissionportal.service.MeritService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class MeritServiceImpl implements MeritService {

    private final MeritRuleRepository meritRuleRepository;
    private final StudentProfileRepository profileRepository;
    private final ApplicationRepository applicationRepository;
    private final AuditService auditService;

    @Override
    @Transactional
    public Double calculateMeritScore(Application application) {
        if (application.getStudent() == null) return null;

        StudentProfile profile = profileRepository.findByUserId(application.getStudent().getId()).orElse(null);
        if (profile == null || profile.getQualifications().isEmpty()) {
            return 75.0; // Baseline fallback
        }

        double score12th = 0.0;
        double score10th = 0.0;
        double scoreGrad = 0.0;
        double entranceScore = profile.getEntranceExamScore() != null ? profile.getEntranceExamScore() : 0.0;

        for (AcademicQualification q : profile.getQualifications()) {
            if ("12th".equalsIgnoreCase(q.getLevel()) || "Diploma".equalsIgnoreCase(q.getLevel())) {
                score12th = q.getMarks();
            } else if ("10th".equalsIgnoreCase(q.getLevel())) {
                score10th = q.getMarks();
            } else if ("Graduation".equalsIgnoreCase(q.getLevel())) {
                scoreGrad = q.getMarks();
            }
        }

        String courseName = application.getCourse() != null ? application.getCourse().getName() : "";
        String branchName = application.getBranch() != null ? application.getBranch().getName() : "";

        // Check configured rule
        Optional<MeritRule> ruleOpt = meritRuleRepository.findByCourseAndBranch(courseName, branchName);
        if (ruleOpt.isEmpty()) {
            ruleOpt = meritRuleRepository.findByCourseAndBranch(courseName, "All Branches");
        }
        if (ruleOpt.isEmpty()) {
            List<MeritRule> courseRules = meritRuleRepository.findByCourse(courseName);
            if (!courseRules.isEmpty()) ruleOpt = Optional.of(courseRules.get(0));
        }

        double finalScore = 0.0;
        if (ruleOpt.isPresent()) {
            MeritRule rule = ruleOpt.get();
            for (Map<String, Object> comp : rule.getFormula()) {
                String source = String.valueOf(comp.get("source"));
                double weight = Double.parseDouble(String.valueOf(comp.get("weight")));

                if ("12th_percentage".equalsIgnoreCase(source)) {
                    finalScore += score12th * weight;
                } else if ("10th_percentage".equalsIgnoreCase(source)) {
                    finalScore += score10th * weight;
                } else if ("graduation_percentage".equalsIgnoreCase(source)) {
                    finalScore += scoreGrad * weight;
                } else if ("entrance_score".equalsIgnoreCase(source)) {
                    finalScore += entranceScore * weight;
                }
            }
        } else {
            // Default 80% 12th + 20% 10th
            if (score12th > 0) {
                finalScore = (score12th * 0.8) + (score10th > 0 ? score10th * 0.2 : score12th * 0.2);
            } else {
                finalScore = scoreGrad > 0 ? scoreGrad : 70.0;
            }
        }

        finalScore = Math.round(finalScore * 100.0) / 100.0;
        application.setMeritScore(finalScore);
        return finalScore;
    }

    @Override
    @Transactional
    public Integer calculateMeritRank(Application application) {
        if (application.getBranch() == null) return 1;

        List<Application> ranked = applicationRepository.findByBranchIdOrderByMeritScoreDesc(application.getBranch().getId());
        int rank = 1;
        for (Application a : ranked) {
            if (Objects.equals(a.getId(), application.getId())) {
                application.setMeritRank(rank);
                return rank;
            }
            rank++;
        }
        application.setMeritRank(rank);
        return rank;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MeritRule> getAllMeritRules() {
        return meritRuleRepository.findAll();
    }

    @Override
    @Transactional
    public MeritRule createMeritRule(MeritRule rule) {
        MeritRule saved = meritRuleRepository.save(rule);
        auditService.log("ADMIN", "ADMIN", "CREATE_MERIT_RULE", "MeritRule", saved.getId(), "Created merit rule for: " + saved.getCourse());
        return saved;
    }

    @Override
    @Transactional
    public MeritRule updateMeritRule(Long id, MeritRule rule) {
        rule.setId(id);
        MeritRule saved = meritRuleRepository.save(rule);
        auditService.log("ADMIN", "ADMIN", "UPDATE_MERIT_RULE", "MeritRule", saved.getId(), "Updated merit rule for: " + saved.getCourse());
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRankedMeritList(Long branchId) {
        List<Application> apps = branchId != null && branchId > 0
                ? applicationRepository.findByBranchIdOrderByMeritScoreDesc(branchId)
                : applicationRepository.findAll();

        apps.sort((a, b) -> Double.compare(
                b.getMeritScore() != null ? b.getMeritScore() : 0.0,
                a.getMeritScore() != null ? a.getMeritScore() : 0.0
        ));

        List<Map<String, Object>> list = new ArrayList<>();
        int rank = 1;
        for (Application a : apps) {
            if (a.getMeritScore() == null) continue;
            Map<String, Object> map = new HashMap<>();
            map.put("_id", String.valueOf(a.getId()));
            map.put("applicationNumber", a.getApplicationNumber());
            map.put("studentName", a.getStudent() != null ? a.getStudent().getName() : "");
            map.put("course", a.getCourse() != null ? a.getCourse().getName() : "");
            map.put("branch", a.getBranch() != null ? a.getBranch().getName() : "");
            map.put("meritScore", a.getMeritScore());
            map.put("computedRank", rank++);
            map.put("status", a.getStatus() != null ? a.getStatus().getValue() : "Submitted");
            list.add(map);
        }
        return list;
    }
}
