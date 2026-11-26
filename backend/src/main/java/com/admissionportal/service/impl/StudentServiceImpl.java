package com.admissionportal.service.impl;

import com.admissionportal.dto.AcademicDetailsRequest;
import com.admissionportal.dto.PersonalDetailsRequest;
import com.admissionportal.entity.AcademicQualification;
import com.admissionportal.entity.StudentProfile;
import com.admissionportal.entity.User;
import com.admissionportal.exception.ResourceNotFoundException;
import com.admissionportal.repository.AcademicQualificationRepository;
import com.admissionportal.repository.StudentProfileRepository;
import com.admissionportal.repository.UserRepository;
import com.admissionportal.service.AuditService;
import com.admissionportal.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentProfileRepository profileRepository;
    private final AcademicQualificationRepository qualificationRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getStudentProfile(Long userId) {
        StudentProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                    return profileRepository.save(StudentProfile.builder().user(user).nationality("Indian").build());
                });

        Map<String, Object> personal = new HashMap<>();
        personal.put("dob", profile.getDob() != null ? profile.getDob().toString() : "");
        personal.put("gender", profile.getGender() != null ? profile.getGender() : "");
        personal.put("phone", profile.getUser().getPhone());
        personal.put("alternatePhone", profile.getAlternatePhone() != null ? profile.getAlternatePhone() : "");
        personal.put("category", profile.getCategory() != null ? profile.getCategory() : "");
        personal.put("religion", profile.getReligion() != null ? profile.getReligion() : "");
        personal.put("nationality", profile.getNationality() != null ? profile.getNationality() : "Indian");
        personal.put("domicileState", profile.getDomicileState() != null ? profile.getDomicileState() : "");
        personal.put("parentName", profile.getParentName() != null ? profile.getParentName() : "");
        personal.put("parentPhone", profile.getParentPhone() != null ? profile.getParentPhone() : "");
        personal.put("parentOccupation", profile.getParentOccupation() != null ? profile.getParentOccupation() : "");
        personal.put("annualIncome", profile.getAnnualIncome() != null ? profile.getAnnualIncome() : "");
        personal.put("addressLine1", profile.getAddressLine1() != null ? profile.getAddressLine1() : "");
        personal.put("addressLine2", profile.getAddressLine2() != null ? profile.getAddressLine2() : "");
        personal.put("city", profile.getCity() != null ? profile.getCity() : "");
        personal.put("state", profile.getState() != null ? profile.getState() : "");
        personal.put("pincode", profile.getPincode() != null ? profile.getPincode() : "");

        Map<String, Object> academic = new HashMap<>();
        List<Map<String, Object>> quals = new ArrayList<>();
        for (AcademicQualification q : profile.getQualifications()) {
            Map<String, Object> qMap = new HashMap<>();
            qMap.put("level", q.getLevel());
            qMap.put("board", q.getBoard());
            qMap.put("schoolCollege", q.getSchoolCollege());
            qMap.put("yearOfPassing", q.getYearOfPassing());
            qMap.put("marksType", q.getMarksType());
            qMap.put("marks", q.getMarks());
            qMap.put("maxMarks", q.getMaxMarks());
            qMap.put("subjects", q.getSubjects() != null ? q.getSubjects() : "");
            qMap.put("rollNumber", q.getRollNumber() != null ? q.getRollNumber() : "");
            quals.add(qMap);
        }
        academic.put("qualifications", quals);
        academic.put("hasEntranceExam", profile.getHasEntranceExam());
        academic.put("entranceExamName", profile.getEntranceExamName() != null ? profile.getEntranceExamName() : "");
        academic.put("entranceExamRollNo", profile.getEntranceExamRollNo() != null ? profile.getEntranceExamRollNo() : "");
        academic.put("entranceExamScore", profile.getEntranceExamScore());
        academic.put("entranceExamRank", profile.getEntranceExamRank());
        academic.put("hasGap", profile.getHasGap());
        academic.put("gapReason", profile.getGapReason() != null ? profile.getGapReason() : "");

        Map<String, Object> profileData = new HashMap<>();
        profileData.put("personal", personal);
        profileData.put("academic", academic);

        return Map.of("profile", profileData);
    }

    @Override
    @Transactional
    public void updatePersonalDetails(Long userId, PersonalDetailsRequest request) {
        StudentProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                    return profileRepository.save(StudentProfile.builder().user(user).build());
                });

        if (request.getDob() != null && !request.getDob().isBlank()) {
            profile.setDob(LocalDate.parse(request.getDob()));
        }
        profile.setGender(request.getGender());
        profile.setAlternatePhone(request.getAlternatePhone());
        profile.setCategory(request.getCategory());
        profile.setReligion(request.getReligion());
        profile.setNationality(request.getNationality() != null ? request.getNationality() : "Indian");
        profile.setDomicileState(request.getDomicileState());
        profile.setParentName(request.getParentName());
        profile.setParentPhone(request.getParentPhone());
        profile.setParentOccupation(request.getParentOccupation());
        profile.setAnnualIncome(request.getAnnualIncome());
        profile.setAddressLine1(request.getAddressLine1());
        profile.setAddressLine2(request.getAddressLine2());
        profile.setCity(request.getCity());
        profile.setState(request.getState());
        profile.setPincode(request.getPincode());

        // Update phone on user if changed
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            User user = profile.getUser();
            user.setPhone(request.getPhone());
            userRepository.save(user);
        }

        profileRepository.save(profile);
        auditService.log(profile.getUser(), "UPDATE_PERSONAL_DETAILS", "StudentProfile", profile.getId(), "Personal details updated.");
    }

    @Override
    @Transactional
    public void updateAcademicDetails(Long userId, AcademicDetailsRequest request) {
        StudentProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                    return profileRepository.save(StudentProfile.builder().user(user).build());
                });

        profile.setHasEntranceExam(Boolean.TRUE.equals(request.getHasEntranceExam()));
        profile.setEntranceExamName(request.getEntranceExamName());
        profile.setEntranceExamRollNo(request.getEntranceExamRollNo());
        profile.setEntranceExamScore(request.getEntranceExamScore());
        profile.setEntranceExamRank(request.getEntranceExamRank());

        profile.setHasGap(Boolean.TRUE.equals(request.getHasGap()));
        profile.setGapReason(request.getGapReason());

        // Replace qualifications
        profile.getQualifications().clear();
        if (request.getQualifications() != null) {
            for (AcademicDetailsRequest.QualificationItem item : request.getQualifications()) {
                AcademicQualification qual = AcademicQualification.builder()
                        .profile(profile)
                        .level(item.getLevel())
                        .board(item.getBoard())
                        .schoolCollege(item.getEffectiveSchoolCollege())
                        .yearOfPassing(item.getYearOfPassing())
                        .marksType(item.getMarksType() != null ? item.getMarksType() : "Percentage")
                        .marks(item.getEffectiveMarks())
                        .maxMarks(item.getMaxMarks() != null ? item.getMaxMarks() : 100.0)
                        .subjects(item.getSubjects())
                        .rollNumber(item.getRollNumber())
                        .build();
                profile.getQualifications().add(qual);
            }
        }

        profileRepository.save(profile);
        auditService.log(profile.getUser(), "UPDATE_ACADEMIC_DETAILS", "StudentProfile", profile.getId(), "Academic qualifications updated.");
    }
}
