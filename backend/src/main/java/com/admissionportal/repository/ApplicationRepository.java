package com.admissionportal.repository;

import com.admissionportal.entity.Application;
import com.admissionportal.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    Optional<Application> findByApplicationNumber(String applicationNumber);

    @Query("SELECT a FROM Application a WHERE a.student.id = :studentId")
    List<Application> findByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT a FROM Application a WHERE a.student.id = :studentId ORDER BY a.createdAt DESC")
    List<Application> findByStudentIdOrderByCreatedAtDesc(@Param("studentId") Long studentId);

    default Optional<Application> findFirstByStudentIdOrderByCreatedAtDesc(Long studentId) {
        List<Application> list = findByStudentIdOrderByCreatedAtDesc(studentId);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    @Query("SELECT a FROM Application a WHERE a.branch.id = :branchId ORDER BY a.meritScore DESC")
    List<Application> findByBranchIdOrderByMeritScoreDesc(@Param("branchId") Long branchId);

    List<Application> findByStatus(ApplicationStatus status);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.status = :status")
    long countByStatus(@Param("status") ApplicationStatus status);

    @Query("SELECT COUNT(a) FROM Application a")
    long countTotal();
}
