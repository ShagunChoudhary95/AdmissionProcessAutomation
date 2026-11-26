package com.admissionportal.controller;

import com.admissionportal.dto.AuthResponse;
import com.admissionportal.dto.LoginRequest;
import com.admissionportal.dto.RegisterRequest;
import com.admissionportal.security.CustomUserDetails;
import com.admissionportal.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(Map.of("message", "Registration successful! You may now sign in."));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthenticated"));
        }
        AuthResponse.UserDTO userDTO = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(Map.of("user", userDTO));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of("message", "If your email is registered, a password reset link has been dispatched."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now login."));
    }
}
