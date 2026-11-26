package com.admissionportal.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum DocumentStatus {
    NOT_UPLOADED("Not Uploaded"),
    PENDING_VERIFICATION("Pending Verification"),
    VERIFIED("Verified"),
    RE_UPLOAD_REQUIRED("Re-upload Required"),
    REUPLOAD_REQUESTED("Re-upload Requested"),
    REJECTED("Rejected");

    private final String value;

    DocumentStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static DocumentStatus fromValue(String value) {
        for (DocumentStatus s : DocumentStatus.values()) {
            if (s.value.equalsIgnoreCase(value) || s.name().equalsIgnoreCase(value)) {
                return s;
            }
        }
        return NOT_UPLOADED;
    }

    @Override
    public String toString() {
        return value;
    }
}
