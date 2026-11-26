package com.admissionportal.dto;

import lombok.Data;

@Data
public class PaymentVerifyRequest {
    private String applicationId;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
    private String paymentMethod;
}
