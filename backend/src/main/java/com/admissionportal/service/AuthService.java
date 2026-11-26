package com.admissionportal.service;

import com.admissionportal.dto.AuthResponse;
import com.admissionportal.dto.LoginRequest;
import com.admissionportal.dto.RegisterRequest;

public interface AuthService {
    void register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse.UserDTO getCurrentUser(String email);
}
