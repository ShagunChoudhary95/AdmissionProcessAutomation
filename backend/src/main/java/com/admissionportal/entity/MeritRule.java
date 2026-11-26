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
@Table(name = "merit_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeritRule {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String course;

    @Column(length = 150)
    private String branch;

    @Column(length = 255)
    private String description;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String formulaJson;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @JsonProperty("_id")
    public String getUnderscoreId() {
        return id != null ? String.valueOf(id) : null;
    }

    @JsonProperty("formula")
    public List<Map<String, Object>> getFormula() {
        if (formulaJson == null || formulaJson.isBlank()) {
            return new ArrayList<>();
        }
        try {
            return MAPPER.readValue(formulaJson, new TypeReference<>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    public void setFormula(List<Map<String, Object>> formula) {
        try {
            this.formulaJson = MAPPER.writeValueAsString(formula);
        } catch (Exception e) {
            this.formulaJson = "[]";
        }
    }
}
