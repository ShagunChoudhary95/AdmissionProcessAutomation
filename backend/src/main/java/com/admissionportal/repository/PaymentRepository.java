package com.admissionportal.repository;

import com.admissionportal.entity.Payment;
import com.admissionportal.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    @Query("SELECT p FROM Payment p WHERE p.application.id = :applicationId")
    Optional<Payment> findByApplicationId(@Param("applicationId") Long applicationId);

    Optional<Payment> findByReceiptNumber(String receiptNumber);
    Optional<Payment> findByRazorpayOrderId(String orderId);

    @Query("SELECT p FROM Payment p WHERE p.student.id = :studentId")
    List<Payment> findByStudentId(@Param("studentId") Long studentId);

    List<Payment> findByStatus(PaymentStatus status);
}
