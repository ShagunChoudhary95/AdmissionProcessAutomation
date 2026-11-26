package com.admissionportal.config;

import com.admissionportal.entity.*;
import com.admissionportal.enums.Role;
import com.admissionportal.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final AcademicQualificationRepository qualificationRepository;
    private final CourseRepository courseRepository;
    private final BranchRepository branchRepository;
    private final EligibilityRuleRepository eligibilityRuleRepository;
    private final MeritRuleRepository meritRuleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking database initialization...");

        // 1. Seed Users
        User admin = userRepository.findByEmail("admin@demo.com").orElseGet(() -> {
            User u = User.builder()
                    .name("Admission Admin")
                    .email("admin@demo.com")
                    .phone("9876500001")
                    .password(passwordEncoder.encode("demo1234"))
                    .role(Role.ADMIN)
                    .build();
            return userRepository.save(u);
        });

        User officer = userRepository.findByEmail("officer@demo.com").orElseGet(() -> {
            User u = User.builder()
                    .name("Document Verification Officer")
                    .email("officer@demo.com")
                    .phone("9876500002")
                    .password(passwordEncoder.encode("demo1234"))
                    .role(Role.OFFICER)
                    .build();
            return userRepository.save(u);
        });

        User student = userRepository.findByEmail("student@demo.com").orElseGet(() -> {
            User u = User.builder()
                    .name("Aarav Sharma")
                    .email("student@demo.com")
                    .phone("9876500003")
                    .password(passwordEncoder.encode("demo1234"))
                    .role(Role.STUDENT)
                    .build();
            return userRepository.save(u);
        });

        // 2. Seed Student Profile for Aarav Sharma
        if (profileRepository.findByUserId(student.getId()).isEmpty()) {
            StudentProfile profile = StudentProfile.builder()
                    .user(student)
                    .dob(LocalDate.of(2005, 8, 15))
                    .gender("Male")
                    .category("General")
                    .religion("Hindu")
                    .domicileState("Uttar Pradesh")
                    .parentName("Rajesh Sharma")
                    .parentPhone("9876500004")
                    .parentOccupation("Engineer")
                    .addressLine1("Plot 4, Sector 62")
                    .city("Noida")
                    .state("Uttar Pradesh")
                    .pincode("201301")
                    .build();
            StudentProfile savedProfile = profileRepository.save(profile);

            AcademicQualification q10 = AcademicQualification.builder()
                    .profile(savedProfile)
                    .level("10th")
                    .board("CBSE")
                    .yearOfPassing("2022")
                    .schoolCollege("Delhi Public School")
                    .marks(88.5)
                    .subjects("Science, Mathematics, English, Hindi, Social Science")
                    .build();

            AcademicQualification q12 = AcademicQualification.builder()
                    .profile(savedProfile)
                    .level("12th")
                    .board("CBSE")
                    .yearOfPassing("2024")
                    .schoolCollege("Delhi Public School")
                    .marks(85.0)
                    .subjects("Physics, Chemistry, Mathematics, English, Computer Science")
                    .build();

            qualificationRepository.saveAll(List.of(q10, q12));
        }

        // 3. Seed Courses & Branches
        if (courseRepository.count() == 0) {
            Course btech = courseRepository.save(Course.builder()
                    .name("Bachelor of Technology (B.Tech)")
                    .code("BTECH")
                    .department("Engineering & Technology")
                    .durationYears(4)
                    .description("Four-year comprehensive undergraduate engineering programme affiliated to AKTU.")
                    .isActive(true)
                    .build());

            Course mba = courseRepository.save(Course.builder()
                    .name("Master of Business Administration (MBA)")
                    .code("MBA")
                    .department("Management Studies")
                    .durationYears(2)
                    .description("Two-year postgraduate business and leadership administration programme.")
                    .isActive(true)
                    .build());

            Course mca = courseRepository.save(Course.builder()
                    .name("Master of Computer Applications (MCA)")
                    .code("MCA")
                    .department("Computer Applications")
                    .durationYears(2)
                    .description("Two-year postgraduate software design and application development degree.")
                    .isActive(true)
                    .build());

            // Branches
            branchRepository.saveAll(List.of(
                    Branch.builder()
                            .course(btech)
                            .name("Computer Science & Engineering")
                            .code("CSE")
                            .totalSeats(180)
                            .tuitionFee(BigDecimal.valueOf(130000.00))
                            .registrationFee(BigDecimal.valueOf(5000.00))
                            .totalFee(BigDecimal.valueOf(135000.00))
                            .isActive(true)
                            .build(),
                    Branch.builder()
                            .course(btech)
                            .name("Information Technology")
                            .code("IT")
                            .totalSeats(120)
                            .tuitionFee(BigDecimal.valueOf(120000.00))
                            .registrationFee(BigDecimal.valueOf(5000.00))
                            .totalFee(BigDecimal.valueOf(125000.00))
                            .isActive(true)
                            .build(),
                    Branch.builder()
                            .course(btech)
                            .name("CSE (Artificial Intelligence & Machine Learning)")
                            .code("CSE-AIML")
                            .totalSeats(120)
                            .tuitionFee(BigDecimal.valueOf(130000.00))
                            .registrationFee(BigDecimal.valueOf(5000.00))
                            .totalFee(BigDecimal.valueOf(135000.00))
                            .isActive(true)
                            .build(),
                    Branch.builder()
                            .course(btech)
                            .name("Electronics & Communication Engineering")
                            .code("ECE")
                            .totalSeats(60)
                            .tuitionFee(BigDecimal.valueOf(110000.00))
                            .registrationFee(BigDecimal.valueOf(5000.00))
                            .totalFee(BigDecimal.valueOf(115000.00))
                            .isActive(true)
                            .build(),
                    Branch.builder()
                            .course(mba)
                            .name("Finance & Marketing")
                            .code("MBA-FM")
                            .totalSeats(60)
                            .tuitionFee(BigDecimal.valueOf(105000.00))
                            .registrationFee(BigDecimal.valueOf(5000.00))
                            .totalFee(BigDecimal.valueOf(110000.00))
                            .isActive(true)
                            .build(),
                    Branch.builder()
                            .course(mba)
                            .name("Human Resource Management")
                            .code("MBA-HR")
                            .totalSeats(60)
                            .tuitionFee(BigDecimal.valueOf(105000.00))
                            .registrationFee(BigDecimal.valueOf(5000.00))
                            .totalFee(BigDecimal.valueOf(110000.00))
                            .isActive(true)
                            .build(),
                    Branch.builder()
                            .course(mca)
                            .name("Computer Applications")
                            .code("MCA-GEN")
                            .totalSeats(120)
                            .tuitionFee(BigDecimal.valueOf(105000.00))
                            .registrationFee(BigDecimal.valueOf(5000.00))
                            .totalFee(BigDecimal.valueOf(110000.00))
                            .isActive(true)
                            .build()
            ));

            // 4. Seed Eligibility Rules
            eligibilityRuleRepository.saveAll(List.of(
                    EligibilityRule.builder()
                            .course("B.Tech")
                            .branch("All")
                            .description("B.Tech Minimum 60% PCM Aggregate in 10+2")
                            .criteriaJson("[{\"type\":\"academic\",\"level\":\"12th\",\"field\":\"percentage\",\"operator\":\">=\",\"value\":60.0,\"label\":\"Class 12th PCM Aggregate\"}]")
                            .isActive(true)
                            .build(),
                    EligibilityRule.builder()
                            .course("MBA")
                            .branch("All")
                            .description("MBA Minimum 50% in Graduation")
                            .criteriaJson("[{\"type\":\"academic\",\"level\":\"Graduation\",\"field\":\"percentage\",\"operator\":\">=\",\"value\":50.0,\"label\":\"Graduation Minimum 50%\"}]")
                            .isActive(true)
                            .build(),
                    EligibilityRule.builder()
                            .course("MCA")
                            .branch("All")
                            .description("MCA Minimum 50% in Graduation with Mathematics")
                            .criteriaJson("[{\"type\":\"academic\",\"level\":\"Graduation\",\"field\":\"percentage\",\"operator\":\">=\",\"value\":50.0,\"label\":\"Graduation Minimum 50% with Math\"}]")
                            .isActive(true)
                            .build()
            ));

            // 5. Seed Merit Rules
            meritRuleRepository.saveAll(List.of(
                    MeritRule.builder()
                            .course("B.Tech")
                            .branch("All")
                            .description("70% 12th PCM aggregate + 30% Entrance percentile")
                            .formulaJson("[{\"component\":\"12th Marks\",\"weight\":70.0,\"source\":\"12th\"},{\"component\":\"JEE Main\",\"weight\":30.0,\"source\":\"entrance\"}]")
                            .isActive(true)
                            .build(),
                    MeritRule.builder()
                            .course("MBA")
                            .branch("All")
                            .description("60% Graduation percentage + 40% CAT/MAT score")
                            .formulaJson("[{\"component\":\"Graduation\",\"weight\":60.0,\"source\":\"graduation\"},{\"component\":\"CAT/MAT\",\"weight\":40.0,\"source\":\"entrance\"}]")
                            .isActive(true)
                            .build(),
                    MeritRule.builder()
                            .course("MCA")
                            .branch("All")
                            .description("80% Graduation percentage + 20% Academic record")
                            .formulaJson("[{\"component\":\"Graduation\",\"weight\":80.0,\"source\":\"graduation\"},{\"component\":\"Academic Record\",\"weight\":20.0,\"source\":\"12th\"}]")
                            .isActive(true)
                            .build()
            ));
        }

        log.info("Database initialization check complete. Default credentials ready: admin@demo.com, officer@demo.com, student@demo.com (Password: demo1234)");
    }
}
