package com.admissionportal.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ApplicationStatus {
    DRAFT("Draft"),
    SUBMITTED("Submitted"),
    UNDER_ADMIN_REVIEW("Under Admin Review"),
    UNDER_VERIFICATION("Under Verification"),
    CORRECTION_REQUIRED("Correction Required"),
    ELIGIBILITY_APPROVED("Eligibility Approved"),
    NOT_ELIGIBLE("Not Eligible"),
    DOC_VERIFICATION_PENDING("Document Verification Pending"),
    VERIFIED("Verified"),
    DOCUMENTS_VERIFIED("Documents Verified"),
    SELECTED("Selected"),
    OFFER_ISSUED("Offer Issued"),
    ADMISSION_OFFERED("Admission Offered"),
    SEAT_RESERVED("Seat Reserved"),
    PAYMENT_PENDING("Payment Pending"),
    ADMISSION_CONFIRMED("Admission Confirmed"),
    REJECTED("Rejected"),
    WAITLISTED("Waitlisted"),
    OFFER_EXPIRED("Offer Expired"),
    WITHDRAWN("Withdrawn");

    private final String value;

    ApplicationStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ApplicationStatus fromValue(String value) {
        for (ApplicationStatus status : ApplicationStatus.values()) {
            if (status.value.equalsIgnoreCase(value) || status.name().equalsIgnoreCase(value)) {
                return status;
            }
        }
        return DRAFT;
    }

    @Override
    public String toString() {
        return value;
    }
}
