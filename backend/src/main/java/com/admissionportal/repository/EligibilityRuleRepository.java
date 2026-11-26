package com.admissionportal.repository;

import com.admissionportal.entity.EligibilityRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EligibilityRuleRepository extends JpaRepository<EligibilityRule, Long> {
    List<EligibilityRule> findByIsActiveTrue();
    Optional<EligibilityRule> findByCourseAndBranch(String course, String branch);
    List<EligibilityRule> findByCourse(String course);
}
