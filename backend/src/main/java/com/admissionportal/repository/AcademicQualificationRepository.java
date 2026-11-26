package com.admissionportal.repository;

import com.admissionportal.entity.AcademicQualification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AcademicQualificationRepository extends JpaRepository<AcademicQualification, Long> {
    List<AcademicQualification> findByProfileId(Long profileId);
    List<AcademicQualification> findByProfileUserId(Long userId);
    void deleteByProfileId(Long profileId);
}
