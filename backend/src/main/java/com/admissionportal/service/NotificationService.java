package com.admissionportal.service;

import com.admissionportal.entity.Notification;
import com.admissionportal.entity.User;

import java.util.List;

public interface NotificationService {
    Notification sendNotification(User user, String title, String message, String type);
    List<Notification> getNotificationsForUser(Long userId);
    void markAsRead(Long notificationId);
    void markAllAsRead(Long userId);
}
