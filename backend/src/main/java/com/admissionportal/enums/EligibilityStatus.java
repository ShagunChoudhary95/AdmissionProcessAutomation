package com.admissionportal.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum EligibilityStatus {
    PENDING("pending"),
    ELIGIBLE("eligible"),
    INELIGIBLE("ineligible");

    private final String value;

    EligibilityStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static EligibilityStatus fromValue(String value) {
        for (EligibilityStatus s : EligibilityStatus.values()) {
            if (s.value.equalsIgnoreCase(value) || s.name().equalsIgnoreCase(value)) {
                return s;
            }
        }
        return PENDING;
    }

    @Override
    public String toString() {
        return value;
    }
}
