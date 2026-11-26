package com.admissionportal.service;

import com.admissionportal.dto.AcademicDetailsRequest;
import com.admissionportal.dto.PersonalDetailsRequest;

import java.util.Map;

public interface StudentService {
    Map<String, Object> getStudentProfile(Long userId);
    void updatePersonalDetails(Long userId, PersonalDetailsRequest request);
    void updateAcademicDetails(Long userId, AcademicDetailsRequest request);
}
