package com.admissionportal.service;

import com.admissionportal.dto.BranchRequest;
import com.admissionportal.dto.ReviewActionRequest;
import com.admissionportal.dto.SeatUpdateRequest;
import com.admissionportal.entity.*;

import java.util.List;
import java.util.Map;

public interface AdminService {
    Map<String, Object> getDashboardStats();
    Map<String, Object> getApplications(String status, String courseId, String search, int page, int limit);
    Map<String, Object> getApplicationDetail(Long id);
    void reviewApplication(Long id, ReviewActionRequest request, User admin);
    void issueOffer(Long id, Map<String, Object> offerData, User admin);
    List<Map<String, Object>> getMeritList(Long branchId);

    List<Course> getAllCourses();
    Course createCourse(Course course);
    Course updateCourse(Long id, Course course);

    List<Branch> getBranches(Long courseId);
    Branch createBranch(BranchRequest request);
    Branch updateBranch(Long id, BranchRequest request);

    List<EligibilityRule> getEligibilityRules();
    EligibilityRule createEligibilityRule(EligibilityRule rule);
    EligibilityRule updateEligibilityRule(Long id, EligibilityRule rule);

    List<MeritRule> getMeritRules();
    MeritRule createMeritRule(MeritRule rule);
    MeritRule updateMeritRule(Long id, MeritRule rule);

    List<Map<String, Object>> getSeats();
    void updateSeats(Long branchId, SeatUpdateRequest request);

    Map<String, Object> getReports(String type, Map<String, String> params);
}
