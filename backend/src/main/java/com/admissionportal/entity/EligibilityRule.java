package com.admissionportal.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "eligibility_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EligibilityRule {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String course;

    @Column(length = 150)
    private String branch;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String criteriaJson;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @JsonProperty("_id")
    public String getUnderscoreId() {
        return id != null ? String.valueOf(id) : null;
    }

    @JsonProperty("criteria")
    public List<Map<String, Object>> getCriteria() {
        if (criteriaJson == null || criteriaJson.isBlank()) {
            return new ArrayList<>();
        }
        try {
            return MAPPER.readValue(criteriaJson, new TypeReference<>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    public void setCriteria(List<Map<String, Object>> criteria) {
        try {
            this.criteriaJson = MAPPER.writeValueAsString(criteria);
        } catch (Exception e) {
            this.criteriaJson = "[]";
        }
    }
}
