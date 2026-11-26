package com.admissionportal.service.impl;

import com.admissionportal.dto.PaymentVerifyRequest;
import com.admissionportal.entity.Application;
import com.admissionportal.entity.ApplicationStatusHistory;
import com.admissionportal.entity.Payment;
import com.admissionportal.entity.User;
import com.admissionportal.enums.ApplicationStatus;
import com.admissionportal.enums.PaymentStatus;
import com.admissionportal.exception.BadRequestException;
import com.admissionportal.exception.ResourceNotFoundException;
import com.admissionportal.repository.ApplicationRepository;
import com.admissionportal.repository.ApplicationStatusHistoryRepository;
import com.admissionportal.repository.PaymentRepository;
import com.admissionportal.repository.UserRepository;
import com.admissionportal.service.*;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final UserRepository userRepository;
    private final SeatService seatService;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final PdfReceiptService pdfReceiptService;

    @Value("${app.razorpay.key-id:rzp_test_mock_key}")
    private String razorpayKeyId;

    @Value("${app.razorpay.key-secret:rzp_test_mock_secret}")
    private String razorpayKeySecret;

    @Override
    @Transactional
    public Map<String, Object> createOrder(Long applicationId, Long userId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        if (!application.getStudent().getId().equals(userId)) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            if (!user.getRole().name().equals("ADMIN") && !user.getRole().name().equals("ROLE_ADMIN")) {
                throw new BadRequestException("Unauthorized access to application payment");
            }
        }

        // Must be in OFFER_ISSUED or SELECTED status
        if (application.getStatus() != ApplicationStatus.OFFER_ISSUED &&
            application.getStatus() != ApplicationStatus.SELECTED &&
            application.getStatus() != ApplicationStatus.ADMISSION_CONFIRMED) {
            throw new BadRequestException("Payment can only be initiated for applications with an active offer or selection. Current status: " + application.getStatus());
        }

        // Check if an existing successful payment exists
        Optional<Payment> existingPaymentOpt = paymentRepository.findByApplicationId(applicationId);
        if (existingPaymentOpt.isPresent() && existingPaymentOpt.get().getStatus() == PaymentStatus.SUCCESS) {
            Payment p = existingPaymentOpt.get();
            Map<String, Object> res = new HashMap<>();
            res.put("orderId", p.getRazorpayOrderId());
            res.put("amount", p.getAmount());
            res.put("currency", p.getCurrency());
            res.put("keyId", razorpayKeyId);
            res.put("receiptNumber", p.getReceiptNumber());
            res.put("status", "SUCCESS");
            res.put("applicationId", applicationId);
            return res;
        }

        BigDecimal amount = BigDecimal.valueOf(125000.00);
        if (application.getBranch() != null && application.getBranch().getAdmissionFee() != null) {
            amount = application.getBranch().getAdmissionFee();
        }

        String razorpayOrderId = null;
        try {
            if (!razorpayKeyId.contains("mock") && !razorpayKeySecret.contains("mock")) {
                RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
                JSONObject orderReq = new JSONObject();
                orderReq.put("amount", amount.multiply(BigDecimal.valueOf(100)).intValue()); // paise
                orderReq.put("currency", "INR");
                orderReq.put("receipt", "RCPT-" + applicationId + "-" + System.currentTimeMillis() % 100000);
                orderReq.put("payment_capture", 1);

                Order order = client.orders.create(orderReq);
                razorpayOrderId = order.get("id");
            }
        } catch (Exception e) {
            log.warn("Failed to create Razorpay live order, falling back to local generated order: {}", e.getMessage());
        }

        if (razorpayOrderId == null) {
            razorpayOrderId = "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        }

        String receiptNumber = "RCPT-2026-" + (10000 + new Random().nextInt(90000));

        final BigDecimal finalAmount = amount;
        Payment payment = existingPaymentOpt.orElseGet(() -> Payment.builder()
                .application(application)
                .student(application.getStudent())
                .amount(finalAmount)
                .currency("INR")
                .receiptNumber(receiptNumber)
                .build());

        payment.setAmount(amount);
        payment.setRazorpayOrderId(razorpayOrderId);
        payment.setStatus(PaymentStatus.CREATED);
        payment.setReceiptNumber(receiptNumber);
        paymentRepository.save(payment);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", razorpayOrderId);
        response.put("amount", amount);
        response.put("currency", "INR");
        response.put("keyId", razorpayKeyId);
        response.put("receiptNumber", receiptNumber);
        response.put("applicationId", applicationId);
        response.put("studentName", application.getStudent().getName());
        response.put("studentEmail", application.getStudent().getEmail());
        response.put("courseName", application.getCourse() != null ? application.getCourse().getName() : "");
        response.put("branchName", application.getBranch() != null ? application.getBranch().getName() : "");
        return response;
    }

    @Override
    @Transactional
    public Payment verifyPayment(PaymentVerifyRequest request, Long userId) {
        log.info("Verifying payment for request: {}", request);
        Payment payment = null;

        if (request.getRazorpayOrderId() != null && !request.getRazorpayOrderId().isBlank()) {
            payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId()).orElse(null);
        }

        if (payment == null && request.getApplicationId() != null) {
            try {
                Long appId = Long.parseLong(request.getApplicationId());
                payment = paymentRepository.findByApplicationId(appId).orElse(null);
            } catch (NumberFormatException ignored) {}
        }

        if (payment == null) {
            throw new ResourceNotFoundException("Payment record not found for the given order or application");
        }

        // Verify signature if Razorpay keys are configured and not mock
        boolean isSignatureValid = true;
        if (!razorpayKeyId.contains("mock") && !razorpayKeySecret.contains("mock") &&
                request.getRazorpaySignature() != null && !request.getRazorpaySignature().isBlank()) {
            try {
                String payload = request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();
                Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
                SecretKeySpec secret_key = new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
                sha256_HMAC.init(secret_key);
                byte[] hash = sha256_HMAC.doFinal(payload.getBytes(StandardCharsets.UTF_8));
                StringBuilder hexString = new StringBuilder();
                for (byte b : hash) {
                    String hex = Integer.toHexString(0xff & b);
                    if (hex.length() == 1) hexString.append('0');
                    hexString.append(hex);
                }
                isSignatureValid = MessageDigest.isEqual(hexString.toString().getBytes(), request.getRazorpaySignature().getBytes());
            } catch (Exception e) {
                log.error("Error verifying Razorpay HMAC: {}", e.getMessage());
                isSignatureValid = false;
            }
        }

        if (!isSignatureValid) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new BadRequestException("Invalid payment signature");
        }

        payment.setRazorpayPaymentId(request.getRazorpayPaymentId() != null ? request.getRazorpayPaymentId() : "pay_" + UUID.randomUUID().toString().substring(0, 10));
        payment.setRazorpaySignature(request.getRazorpaySignature() != null ? request.getRazorpaySignature() : "sig_verified");
        if (request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank()) {
            payment.setMode(request.getPaymentMethod());
        }
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(Instant.now());
        paymentRepository.save(payment);

        Application application = payment.getApplication();
        application.setStatus(ApplicationStatus.ADMISSION_CONFIRMED);
        applicationRepository.save(application);

        // Confirm seat allocation permanently
        seatService.confirmSeat(application);

        // Record status history
        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(application)
                .fromStatus(ApplicationStatus.OFFER_ISSUED)
                .toStatus(ApplicationStatus.ADMISSION_CONFIRMED)
                .remarks("Admission confirmed upon successful payment of fees (Receipt: " + payment.getReceiptNumber() + ")")
                .changedBy(application.getStudent())
                .build();
        statusHistoryRepository.save(history);

        // Send confirmation notification
        notificationService.sendNotification(
                application.getStudent(),
                "Admission Confirmed! 🎉",
                "Your payment of ₹" + payment.getAmount() + " was successful. Your admission to " +
                        (application.getCourse() != null ? application.getCourse().getName() : "") + " (" +
                        (application.getBranch() != null ? application.getBranch().getName() : "") + ") is confirmed! Receipt: " + payment.getReceiptNumber(),
                "PAYMENT"
        );

        auditService.log(
                application.getStudent(),
                "PAYMENT_SUCCESS",
                "PAYMENT",
                payment.getId(),
                "Admission fee confirmed for Application " + application.getApplicationNumber()
        );

        return payment;
    }

    @Override
    @Transactional(readOnly = true)
    public Payment getPaymentDetails(Long applicationId) {
        return paymentRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment details not found for application: " + applicationId));
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] getReceiptPdf(Long applicationId) {
        Payment payment = getPaymentDetails(applicationId);
        return pdfReceiptService.generateReceiptPdf(payment);
    }
}
