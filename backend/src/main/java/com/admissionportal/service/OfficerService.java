package com.admissionportal.service;

import com.admissionportal.entity.Document;
import com.admissionportal.entity.User;

import java.util.List;
import java.util.Map;

public interface OfficerService {
    Map<String, Object> getDashboardStats();
    Map<String, Object> getQueue(int page, int limit, String search);
    List<Document> getDocuments(Long applicationId);
    void verifyDocument(Long docId, User officer, String remarks);
    void rejectDocument(Long docId, User officer, String reason);
    void requestReupload(Long docId, User officer, String reason);
    Map<String, Object> getHistory(int page, int limit);
}
