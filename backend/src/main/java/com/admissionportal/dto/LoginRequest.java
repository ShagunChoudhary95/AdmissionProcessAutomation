package com.admissionportal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Enter a valid email")
    @Email(message = "Enter a valid email")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
