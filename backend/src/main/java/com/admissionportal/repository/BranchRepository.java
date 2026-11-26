package com.admissionportal.repository;

import com.admissionportal.entity.Branch;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {
    @Query("SELECT b FROM Branch b WHERE b.course.id = :courseId")
    List<Branch> findByCourseId(@Param("courseId") Long courseId);

    List<Branch> findByIsActiveTrue();

    @Query("SELECT b FROM Branch b WHERE b.course.id = :courseId AND b.name = :name")
    Optional<Branch> findByCourseIdAndName(@Param("courseId") Long courseId, @Param("name") String name);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Branch b WHERE b.id = :id")
    Optional<Branch> findByIdWithLock(@Param("id") Long id);
}
