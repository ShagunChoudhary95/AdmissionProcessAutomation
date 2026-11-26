package com.admissionportal.service.impl;

import com.admissionportal.dto.BranchRequest;
import com.admissionportal.dto.CourseRequest;
import com.admissionportal.entity.Branch;
import com.admissionportal.entity.Course;
import com.admissionportal.exception.BadRequestException;
import com.admissionportal.exception.ResourceNotFoundException;
import com.admissionportal.repository.BranchRepository;
import com.admissionportal.repository.CourseRepository;
import com.admissionportal.service.AuditService;
import com.admissionportal.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final BranchRepository branchRepository;
    private final AuditService auditService;

    @Override
    @Transactional(readOnly = true)
    public List<Course> getActiveCoursesWithBranches() {
        return courseRepository.findByIsActiveTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Course> getAllCoursesAdmin() {
        return courseRepository.findAll();
    }

    @Override
    @Transactional
    public Course createCourse(CourseRequest request) {
        if (request.getName() == null || request.getName().trim().isBlank()) {
            throw new BadRequestException("Course name is required.");
        }
        String name = request.getName().trim();
        if (courseRepository.findByName(name).isPresent()) {
            throw new BadRequestException("A course with this name already exists.");
        }

        Course course = Course.builder()
                .name(name)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        course = courseRepository.save(course);
        auditService.log("ADMIN", "ADMIN", "CREATE_COURSE", "Course", course.getId(), "Created course: " + name);
        return course;
    }

    @Override
    @Transactional
    public Course updateCourse(Long id, CourseRequest request) {
        Course course = getCourseById(id);
        if (request.getName() != null && !request.getName().trim().isBlank()) {
            course.setName(request.getName().trim());
        }
        if (request.getIsActive() != null) {
            course.setIsActive(request.getIsActive());
        }
        course = courseRepository.save(course);
        auditService.log("ADMIN", "ADMIN", "UPDATE_COURSE", "Course", course.getId(), "Updated course: " + course.getName());
        return course;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Branch> getAllBranches(String courseFilter) {
        if (courseFilter != null && !courseFilter.equalsIgnoreCase("All")) {
            return courseRepository.findByName(courseFilter)
                    .map(Course::getBranches)
                    .orElse(List.of());
        }
        return branchRepository.findAll();
    }

    @Override
    @Transactional
    public Branch createBranch(BranchRequest request) {
        if (request.getName() == null || request.getName().trim().isBlank()) {
            throw new BadRequestException("Branch name is required.");
        }
        if (request.getCourseId() == null) {
            throw new BadRequestException("Course ID is required.");
        }

        Long courseId = Long.parseLong(request.getCourseId());
        Course course = getCourseById(courseId);

        BigDecimal tuition = request.getTuitionFee() != null ? request.getTuitionFee() : BigDecimal.ZERO;
        BigDecimal registration = request.getRegistrationFee() != null ? request.getRegistrationFee() : new BigDecimal("5000.00");
        BigDecimal total = tuition.add(registration);

        Branch branch = Branch.builder()
                .course(course)
                .name(request.getName().trim())
                .minMarks(request.getMinMarks() != null ? request.getMinMarks() : 50.0)
                .totalSeats(request.getTotalSeats() != null ? request.getTotalSeats() : 60)
                .confirmedSeats(0)
                .reservedSeats(0)
                .tuitionFee(tuition)
                .registrationFee(registration)
                .totalFee(total)
                .qualificationRequired(request.getQualificationRequired() != null ? request.getQualificationRequired() : "12th")
                .requiredSubjects(request.getRequiredSubjects())
                .entranceExamRequired(Boolean.TRUE.equals(request.getEntranceExamRequired()))
                .entranceExamName(request.getEntranceExamName())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        branch = branchRepository.save(branch);
        auditService.log("ADMIN", "ADMIN", "CREATE_BRANCH", "Branch", branch.getId(), "Created branch: " + branch.getName() + " for " + course.getName());
        return branch;
    }

    @Override
    @Transactional
    public Branch updateBranch(Long id, BranchRequest request) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id: " + id));

        if (request.getName() != null && !request.getName().trim().isBlank()) {
            branch.setName(request.getName().trim());
        }
        if (request.getMinMarks() != null) branch.setMinMarks(request.getMinMarks());
        if (request.getTotalSeats() != null) branch.setTotalSeats(request.getTotalSeats());
        if (request.getTuitionFee() != null) branch.setTuitionFee(request.getTuitionFee());
        if (request.getRegistrationFee() != null) branch.setRegistrationFee(request.getRegistrationFee());
        branch.setTotalFee(branch.getTuitionFee().add(branch.getRegistrationFee()));

        if (request.getQualificationRequired() != null) branch.setQualificationRequired(request.getQualificationRequired());
        if (request.getRequiredSubjects() != null) branch.setRequiredSubjects(request.getRequiredSubjects());
        if (request.getEntranceExamRequired() != null) branch.setEntranceExamRequired(request.getEntranceExamRequired());
        if (request.getEntranceExamName() != null) branch.setEntranceExamName(request.getEntranceExamName());
        if (request.getIsActive() != null) branch.setIsActive(request.getIsActive());

        branch = branchRepository.save(branch);
        auditService.log("ADMIN", "ADMIN", "UPDATE_BRANCH", "Branch", branch.getId(), "Updated branch: " + branch.getName());
        return branch;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSeatsMatrix() {
        List<Branch> branches = branchRepository.findAll();
        List<Map<String, Object>> list = new ArrayList<>();

        for (Branch b : branches) {
            Map<String, Object> map = new HashMap<>();
            map.put("_id", String.valueOf(b.getId()));
            map.put("course", b.getCourse() != null ? b.getCourse().getName() : "");
            map.put("branch", b.getName());
            map.put("total", b.getTotalSeats());
            map.put("reserved", b.getReservedSeats());
            map.put("confirmed", b.getConfirmedSeats());
            map.put("available", Math.max(0, b.getTotalSeats() - b.getConfirmedSeats() - b.getReservedSeats()));
            list.add(map);
        }
        return list;
    }

    @Override
    @Transactional
    public void updateSeatCapacity(Long branchId, Integer totalSeats) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with id: " + branchId));

        int occupied = branch.getConfirmedSeats() + branch.getReservedSeats();
        if (totalSeats < occupied) {
            throw new BadRequestException("Seat capacity cannot be less than occupied seats (" + occupied + ").");
        }

        branch.setTotalSeats(totalSeats);
        branchRepository.save(branch);
        auditService.log("ADMIN", "ADMIN", "UPDATE_SEATS", "Branch", branch.getId(), "Updated total capacity to: " + totalSeats);
    }
}
