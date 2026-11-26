package com.admissionportal.repository;

import com.admissionportal.entity.MeritRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeritRuleRepository extends JpaRepository<MeritRule, Long> {
    List<MeritRule> findByIsActiveTrue();
    Optional<MeritRule> findByCourseAndBranch(String course, String branch);
    List<MeritRule> findByCourse(String course);
}
