package com.admissionportal.controller;

import com.admissionportal.entity.Course;
import com.admissionportal.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> listCourses() {
        List<Course> courses = courseService.getActiveCoursesWithBranches();
        return ResponseEntity.ok(Map.of("courses", courses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }
}
