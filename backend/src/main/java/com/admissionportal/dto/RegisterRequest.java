package com.admissionportal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Name must be at least 2 characters")
    @Size(min = 2, message = "Name must be at least 2 characters")
    private String name;

    @NotBlank(message = "Enter a valid email")
    @Email(message = "Enter a valid email")
    private String email;

    @NotBlank(message = "Enter a valid 10-digit Indian mobile number")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit Indian mobile number")
    private String phone;

    @NotBlank(message = "Password must be at least 8 characters")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}
