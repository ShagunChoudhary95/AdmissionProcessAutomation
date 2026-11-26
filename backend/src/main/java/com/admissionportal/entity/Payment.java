package com.admissionportal.entity;

import com.admissionportal.enums.PaymentStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private Application application;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(nullable = false, unique = true, length = 50)
    private String receiptNumber;

    @Column(nullable = false, length = 100)
    private String razorpayOrderId;

    private String razorpayPaymentId;
    private String razorpaySignature;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Builder.Default
    @Column(length = 10)
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.CREATED;

    @Builder.Default
    @Column(length = 50)
    private String mode = "Online (Razorpay)";

    @Column(columnDefinition = "TEXT")
    private String feeBreakdownJson;

    private Instant paidAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @JsonProperty("_id")
    public String getUnderscoreId() {
        return id != null ? String.valueOf(id) : null;
    }

    @JsonProperty("applicationNumber")
    public String getApplicationNumber() {
        return application != null ? application.getApplicationNumber() : null;
    }

    @JsonProperty("studentName")
    public String getStudentName() {
        return student != null ? student.getName() : null;
    }

    @JsonProperty("course")
    public String getCourseAndBranch() {
        if (application != null && application.getCourse() != null && application.getBranch() != null) {
            return application.getCourse().getName() + " — " + application.getBranch().getName();
        }
        return null;
    }

    @JsonProperty("academicYear")
    public String getAcademicYear() {
        return "2026–27";
    }

    @JsonProperty("feeBreakdown")
    public List<Map<String, Object>> getFeeBreakdown() {
        BigDecimal total = amount != null ? amount : BigDecimal.ZERO;
        BigDecimal registration = new BigDecimal("5000.00");
        BigDecimal tuition = total.subtract(registration).max(BigDecimal.ZERO);

        return List.of(
            Map.of("label", "Tuition Fee", "amount", tuition),
            Map.of("label", "Registration Fee", "amount", registration)
        );
    }
}
