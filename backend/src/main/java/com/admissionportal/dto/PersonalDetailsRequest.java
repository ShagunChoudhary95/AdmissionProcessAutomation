package com.admissionportal.dto;

import lombok.Data;

@Data
public class PersonalDetailsRequest {
    private String dob;
    private String gender;
    private String phone;
    private String alternatePhone;
    private String category;
    private String religion;
    private String nationality;
    private String domicileState;
    private String parentName;
    private String parentPhone;
    private String parentOccupation;
    private String annualIncome;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String pincode;
}
