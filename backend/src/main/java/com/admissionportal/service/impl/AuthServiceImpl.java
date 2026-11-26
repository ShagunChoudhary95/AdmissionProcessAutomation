package com.admissionportal.service.impl;

import com.admissionportal.dto.AuthResponse;
import com.admissionportal.dto.LoginRequest;
import com.admissionportal.dto.RegisterRequest;
import com.admissionportal.entity.StudentProfile;
import com.admissionportal.entity.User;
import com.admissionportal.enums.Role;
import com.admissionportal.exception.BadRequestException;
import com.admissionportal.exception.ResourceNotFoundException;
import com.admissionportal.repository.StudentProfileRepository;
import com.admissionportal.repository.UserRepository;
import com.admissionportal.security.JwtUtils;
import com.admissionportal.service.AuditService;
import com.admissionportal.service.AuthService;
import com.admissionportal.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email already exists.");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .phone(request.getPhone().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .build();

        user = userRepository.save(user);

        // Automatically initialize an empty profile for the student
        StudentProfile profile = StudentProfile.builder()
                .user(user)
                .nationality("Indian")
                .build();
        profileRepository.save(profile);

        notificationService.sendNotification(user, "Welcome to AdmissionPortal!",
                "Your student account has been created successfully. Complete your profile to get started.", "success");

        auditService.log(user, "USER_REGISTERED", "User", user.getId(), "Student self-registration completed.");
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name());

        AuthResponse.UserDTO userDto = AuthResponse.UserDTO.builder()
                .id(user.getId())
                .underscoreId(String.valueOf(user.getId()))
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name().toLowerCase())
                .build();

        auditService.log(user, "USER_LOGIN", "User", user.getId(), "User logged in successfully.");

        return AuthResponse.builder()
                .token(token)
                .user(userDto)
                .build();
    }

    @Override
    public AuthResponse.UserDTO getCurrentUser(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return AuthResponse.UserDTO.builder()
                .id(user.getId())
                .underscoreId(String.valueOf(user.getId()))
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name().toLowerCase())
                .build();
    }
}
