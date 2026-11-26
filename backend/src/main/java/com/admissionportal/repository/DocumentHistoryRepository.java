package com.admissionportal.repository;

import com.admissionportal.entity.DocumentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentHistoryRepository extends JpaRepository<DocumentHistory, Long> {
    List<DocumentHistory> findByDocumentIdOrderByTimestampDesc(Long documentId);

    @Query("SELECT dh FROM DocumentHistory dh LEFT JOIN FETCH dh.document d LEFT JOIN FETCH d.application a LEFT JOIN FETCH a.student s ORDER BY dh.timestamp DESC")
    List<DocumentHistory> findAllByOrderByTimestampDesc();
}
