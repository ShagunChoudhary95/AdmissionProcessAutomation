package com.admissionportal.controller;

import com.admissionportal.dto.PaymentVerifyRequest;
import com.admissionportal.entity.Payment;
import com.admissionportal.security.CustomUserDetails;
import com.admissionportal.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> createOrder(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long applicationId = Long.parseLong(body.get("applicationId").toString());
        Map<String, Object> orderData = paymentService.createOrder(applicationId, userDetails.getId());
        return ResponseEntity.ok(orderData);
    }

    @PostMapping("/verify")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @RequestBody PaymentVerifyRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Payment payment = paymentService.verifyPayment(request, userDetails.getId());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Payment verified and admission confirmed",
                "payment", payment
        ));
    }

    @GetMapping("/{applicationId}/receipt")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> getReceipt(@PathVariable Long applicationId) {
        byte[] pdfBytes = paymentService.getReceiptPdf(applicationId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Receipt-ADM-" + applicationId + ".pdf\"")
                .body(pdfBytes);
    }

    @GetMapping("/{applicationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Payment> getPaymentDetails(@PathVariable Long applicationId) {
        return ResponseEntity.ok(paymentService.getPaymentDetails(applicationId));
    }
}
