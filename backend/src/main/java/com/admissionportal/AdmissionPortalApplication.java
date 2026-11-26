package com.admissionportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class AdmissionPortalApplication {

    public static void main(String[] args) {
        SpringApplication.run(AdmissionPortalApplication.class, args);
    }
}
