package com.admissionportal.dto;

import lombok.Data;

@Data
public class ReviewActionRequest {
    private String action; // approve, reject, correction, offer
    private String reason;
}
