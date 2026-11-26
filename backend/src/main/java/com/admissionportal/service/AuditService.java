package com.admissionportal.service;

import com.admissionportal.entity.AuditLog;
import com.admissionportal.entity.User;

import java.util.List;

public interface AuditService {
    void log(User actor, String action, String targetType, Long targetId, String details);
    void log(String actorName, String actorRole, String action, String targetType, Long targetId, String details);
    List<AuditLog> getAllLogs();
}
