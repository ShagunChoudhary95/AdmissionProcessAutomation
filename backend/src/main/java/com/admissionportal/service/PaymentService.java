package com.admissionportal.service;

import com.admissionportal.dto.PaymentVerifyRequest;
import com.admissionportal.entity.Payment;

import java.util.Map;

public interface PaymentService {
    Map<String, Object> createOrder(Long applicationId, Long userId);
    Payment verifyPayment(PaymentVerifyRequest request, Long userId);
    Payment getPaymentDetails(Long applicationId);
    byte[] getReceiptPdf(Long applicationId);
}
