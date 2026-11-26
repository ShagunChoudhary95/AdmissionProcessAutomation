package com.admissionportal.repository;

import com.admissionportal.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    @Query("SELECT s FROM StudentProfile s WHERE s.user.id = :userId")
    Optional<StudentProfile> findByUserId(@Param("userId") Long userId);
}
