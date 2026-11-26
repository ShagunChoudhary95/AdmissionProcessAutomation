package com.admissionportal.service;

import com.admissionportal.dto.BranchRequest;
import com.admissionportal.dto.CourseRequest;
import com.admissionportal.entity.Branch;
import com.admissionportal.entity.Course;

import java.util.List;
import java.util.Map;

public interface CourseService {
    List<Course> getActiveCoursesWithBranches();
    Course getCourseById(Long id);

    List<Course> getAllCoursesAdmin();
    Course createCourse(CourseRequest request);
    Course updateCourse(Long id, CourseRequest request);

    List<Branch> getAllBranches(String courseFilter);
    Branch createBranch(BranchRequest request);
    Branch updateBranch(Long id, BranchRequest request);

    List<Map<String, Object>> getSeatsMatrix();
    void updateSeatCapacity(Long branchId, Integer totalSeats);
}
