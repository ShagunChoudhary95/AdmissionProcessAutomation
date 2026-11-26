package com.admissionportal.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class SeatOverbookingException extends RuntimeException {
    public SeatOverbookingException(String message) {
        super(message);
    }
}
