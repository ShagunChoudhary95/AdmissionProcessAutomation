package com.admissionportal.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SeatUpdateRequest {
    private Integer totalSeats;
    private BigDecimal admissionFee;
}
