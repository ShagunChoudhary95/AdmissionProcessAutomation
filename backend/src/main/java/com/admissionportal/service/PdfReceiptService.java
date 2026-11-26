package com.admissionportal.service;

import com.admissionportal.entity.Payment;

public interface PdfReceiptService {
    byte[] generateReceiptPdf(Payment payment);
}
