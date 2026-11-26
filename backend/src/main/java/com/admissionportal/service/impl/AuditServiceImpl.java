package com.admissionportal.service.impl;

import com.admissionportal.entity.AuditLog;
import com.admissionportal.entity.User;
import com.admissionportal.repository.AuditLogRepository;
import com.admissionportal.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;

    @Override
    public void log(User actor, String action, String targetType, Long targetId, String details) {
        AuditLog entry = AuditLog.builder()
                .actorId(actor != null ? actor.getId() : null)
                .actorName(actor != null ? actor.getName() : "System")
                .actorRole(actor != null && actor.getRole() != null ? actor.getRole().name() : "SYSTEM")
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .details(details)
                .build();
        auditLogRepository.save(entry);
    }

    @Override
    public void log(String actorName, String actorRole, String action, String targetType, Long targetId, String details) {
        AuditLog entry = AuditLog.builder()
                .actorName(actorName)
                .actorRole(actorRole)
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .details(details)
                .build();
        auditLogRepository.save(entry);
    }

    @Override
    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
