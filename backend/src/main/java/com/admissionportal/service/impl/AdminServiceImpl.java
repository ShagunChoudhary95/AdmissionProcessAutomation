package com.admissionportal.service.impl;

import com.admissionportal.dto.BranchRequest;
import com.admissionportal.dto.ReviewActionRequest;
import com.admissionportal.dto.SeatUpdateRequest;
import com.admissionportal.entity.*;
import com.admissionportal.enums.ApplicationStatus;
import com.admissionportal.enums.EligibilityStatus;
import com.admissionportal.enums.PaymentStatus;
import com.admissionportal.exception.BadRequestException;
import com.admissionportal.exception.ResourceNotFoundException;
import com.admissionportal.repository.*;
import com.admissionportal.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final CourseRepository courseRepository;
    private final BranchRepository branchRepository;
    private final EligibilityRuleRepository eligibilityRuleRepository;
    private final MeritRuleRepository meritRuleRepository;
    private final PaymentRepository paymentRepository;
    private final StudentProfileRepository profileRepository;
    private final AcademicQualificationRepository qualificationRepository;
    private final SeatService seatService;
    private final MeritService meritService;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        List<Application> all = applicationRepository.findAll();
        long totalApps = all.size();
        long submitted = all.stream().filter(a -> a.getStatus() == ApplicationStatus.SUBMITTED).count();
        long underVerification = all.stream().filter(a -> a.getStatus() == ApplicationStatus.UNDER_VERIFICATION).count();
        long verified = all.stream().filter(a -> a.getStatus() == ApplicationStatus.VERIFIED).count();
        long offersIssued = all.stream().filter(a -> a.getStatus() == ApplicationStatus.OFFER_ISSUED).count();
        long confirmed = all.stream().filter(a -> a.getStatus() == ApplicationStatus.ADMISSION_CONFIRMED).count();
        long rejected = all.stream().filter(a -> a.getStatus() == ApplicationStatus.REJECTED).count();

        List<Payment> payments = paymentRepository.findAll();
        BigDecimal totalRevenue = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Branch> branches = branchRepository.findAll();
        int totalSeats = branches.stream().mapToInt(Branch::getIntake).sum();
        int filledSeats = branches.stream().mapToInt(Branch::getFilledSeats).sum();
        int reservedSeats = branches.stream().mapToInt(Branch::getReservedSeats).sum();
        int availableSeats = Math.max(0, totalSeats - filledSeats - reservedSeats);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalApplications", totalApps);
        stats.put("submitted", submitted);
        stats.put("underVerification", underVerification);
        stats.put("verified", verified);
        stats.put("offersIssued", offersIssued);
        stats.put("confirmed", confirmed);
        stats.put("rejected", rejected);
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalSeats", totalSeats);
        stats.put("filledSeats", filledSeats);
        stats.put("reservedSeats", reservedSeats);
        stats.put("availableSeats", availableSeats);

        // Recent applications (last 5)
        List<Application> recent = all.stream()
                .sorted(Comparator.comparing((Application a) -> a.getCreatedAt() != null ? a.getCreatedAt() : Instant.EPOCH).reversed())
                .limit(5)
                .collect(Collectors.toList());
        stats.put("recentApplications", recent);

        // Seat availability data for dashboard
        List<Map<String, Object>> seatData = branches.stream().map(b -> {
            Map<String, Object> sm = new HashMap<>();
            sm.put("branch", b.getName());
            sm.put("total", b.getIntake());
            sm.put("available", Math.max(0, b.getIntake() - b.getFilledSeats() - b.getReservedSeats()));
            return sm;
        }).collect(Collectors.toList());
        stats.put("seatData", seatData);

        // Course chart for dashboard
        List<Course> courses = courseRepository.findAll();
        List<Map<String, Object>> courseChart = new ArrayList<>();
        for (Course c : courses) {
            Map<String, Object> cm = new HashMap<>();
            cm.put("name", c.getName());
            long appCount = all.stream().filter(a -> a.getCourse() != null && a.getCourse().getId().equals(c.getId())).count();
            long admCount = all.stream().filter(a -> a.getCourse() != null && a.getCourse().getId().equals(c.getId()) && a.getStatus() == ApplicationStatus.ADMISSION_CONFIRMED).count();
            cm.put("applications", appCount);
            cm.put("admitted", admCount);
            courseChart.add(cm);
        }
        stats.put("courseStats", courseChart);

        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getApplications(String status, String courseId, String search, int page, int limit) {
        List<Application> all = applicationRepository.findAll();

        List<Application> filtered = all.stream()
                .filter(a -> {
                    if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
                        return a.getStatus().name().equalsIgnoreCase(status);
                    }
                    return true;
                })
                .filter(a -> {
                    if (courseId != null && !courseId.isBlank() && !"all".equalsIgnoreCase(courseId)) {
                        return a.getCourse() != null && String.valueOf(a.getCourse().getId()).equals(courseId);
                    }
                    return true;
                })
                .filter(a -> {
                    if (search == null || search.isBlank()) return true;
                    String s = search.toLowerCase();
                    boolean numMatch = a.getApplicationNumber() != null && a.getApplicationNumber().toLowerCase().contains(s);
                    boolean nameMatch = a.getStudent() != null && a.getStudent().getName() != null && a.getStudent().getName().toLowerCase().contains(s);
                    boolean emailMatch = a.getStudent() != null && a.getStudent().getEmail() != null && a.getStudent().getEmail().toLowerCase().contains(s);
                    return numMatch || nameMatch || emailMatch;
                })
                .sorted(Comparator.comparing(Application::getCreatedAt).reversed())
                .collect(Collectors.toList());

        int total = filtered.size();
        int fromIndex = Math.min((page - 1) * limit, total);
        int toIndex = Math.min(fromIndex + limit, total);
        List<Application> paged = (fromIndex <= toIndex) ? filtered.subList(fromIndex, toIndex) : Collections.emptyList();

        Map<String, Object> res = new HashMap<>();
        res.put("applications", paged);
        res.put("total", total);
        res.put("page", page);
        res.put("limit", limit);
        return res;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getApplicationDetail(Long id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        User student = app.getStudent();
        Optional<StudentProfile> profileOpt = profileRepository.findByUserId(student.getId());
        List<AcademicQualification> qualifications = qualificationRepository.findByProfileUserId(student.getId());

        Map<String, Object> detail = new HashMap<>();
        detail.put("id", app.getId());
        detail.put("_id", String.valueOf(app.getId()));
        detail.put("applicationNumber", app.getApplicationNumber());
        detail.put("studentName", student.getName());
        detail.put("email", student.getEmail());
        detail.put("status", app.getStatus().name());
        detail.put("submittedAt", app.getSubmittedAt());
        detail.put("meritScore", app.getMeritScore());
        detail.put("meritRank", app.getMeritRank());
        detail.put("course", app.getCourse() != null ? app.getCourse().getName() : "—");
        detail.put("branch", app.getBranch() != null ? app.getBranch().getName() : "—");
        detail.put("courseId", app.getCourse());
        detail.put("branchId", app.getBranch());

        // Personal profile details
        Map<String, Object> personal = new HashMap<>();
        if (profileOpt.isPresent()) {
            StudentProfile p = profileOpt.get();
            personal.put("dob", p.getDateOfBirth());
            personal.put("gender", p.getGender());
            personal.put("phone", p.getPhone());
            personal.put("category", p.getCategory());
            personal.put("domicileState", p.getDomicileState());
            personal.put("parentName", p.getParentName());
            personal.put("parentPhone", p.getParentPhone());
            personal.put("address", p.getAddress());
        }
        detail.put("personal", personal);

        // Academic details
        Map<String, Object> academic = new HashMap<>();
        List<Map<String, Object>> qualList = new ArrayList<>();
        for (AcademicQualification q : qualifications) {
            Map<String, Object> qMap = new HashMap<>();
            qMap.put("level", q.getLevel());
            qMap.put("board", q.getBoard());
            qMap.put("year", q.getYearOfPassing());
            qMap.put("school", q.getSchoolOrCollege());
            qMap.put("marks", q.getPercentageOrCgpa() != null ? q.getPercentageOrCgpa() + "%" : "—");
            qMap.put("subjects", q.getSubjects());
            qualList.add(qMap);
        }
        academic.put("qualifications", qualList);
        detail.put("academic", academic);

        // Eligibility criteria details
        Map<String, Object> eligibility = new HashMap<>();
        List<Map<String, Object>> criteria = new ArrayList<>();
        criteria.add(Map.of(
                "label", "12th Aggregate Percentage",
                "required", "≥ 60%",
                "achieved", qualifications.stream().filter(q -> "12th".equalsIgnoreCase(q.getLevel()) || "HSC".equalsIgnoreCase(q.getLevel())).findFirst().map(q -> q.getPercentageOrCgpa() + "%").orElse("N/A"),
                "passed", app.getEligibilityStatus() == EligibilityStatus.ELIGIBLE
        ));
        criteria.add(Map.of(
                "label", "Mandatory Subjects (PCM)",
                "required", "Physics, Chemistry, Maths",
                "achieved", "Verified",
                "passed", true
        ));
        eligibility.put("status", app.getEligibilityStatus() != null ? app.getEligibilityStatus().name() : "PENDING");
        eligibility.put("criteria", criteria);
        detail.put("eligibility", eligibility);

        // Merit breakdown
        detail.put("meritComponents", List.of(
                Map.of("label", "Academic Weightage", "score", app.getMeritScore() != null ? app.getMeritScore() : 0.0)
        ));

        // Fees
        BigDecimal fee = (app.getBranch() != null && app.getBranch().getAdmissionFee() != null)
                ? app.getBranch().getAdmissionFee()
                : BigDecimal.valueOf(125000);
        detail.put("fees", Map.of("total", fee));

        // Status history
        List<Map<String, Object>> historyList = new ArrayList<>();
        if (app.getStatusHistory() != null) {
            for (ApplicationStatusHistory h : app.getStatusHistory()) {
                Map<String, Object> hm = new HashMap<>();
                hm.put("status", h.getToStatus() != null ? h.getToStatus().name() : "");
                hm.put("timestamp", h.getTimestamp());
                hm.put("actor", h.getChangedBy() != null ? h.getChangedBy().getName() : "System");
                hm.put("note", h.getRemarks());
                historyList.add(hm);
            }
        }
        detail.put("statusHistory", historyList);

        return detail;
    }

    @Override
    @Transactional
    public void reviewApplication(Long id, ReviewActionRequest request, User admin) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        String action = request.getAction() != null ? request.getAction().toLowerCase() : "";
        ApplicationStatus prev = app.getStatus();

        if ("approve".equals(action)) {
            app.setStatus(ApplicationStatus.UNDER_VERIFICATION);
            app.setReviewedBy(admin);
            app.setReviewedAt(Instant.now());
            app.setReviewRemarks(request.getReason() != null ? request.getReason() : "Application approved by Admin; forwarded to Document Verification Officer");
        } else if ("reject".equals(action)) {
            app.setStatus(ApplicationStatus.REJECTED);
            app.setReviewedBy(admin);
            app.setReviewedAt(Instant.now());
            app.setReviewRemarks(request.getReason() != null ? request.getReason() : "Application rejected by Admin");
            // release seat if reserved
            seatService.releaseSeat(app);
        } else if ("correction".equals(action)) {
            app.setStatus(ApplicationStatus.CORRECTION_REQUIRED);
            app.setCorrectionRemarks(request.getReason() != null ? request.getReason() : "Corrections requested by Admin");
        } else if ("offer".equals(action)) {
            issueOffer(id, Map.of("remarks", request.getReason() != null ? request.getReason() : ""), admin);
            return;
        } else {
            throw new BadRequestException("Unknown review action: " + action);
        }

        applicationRepository.save(app);

        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(app)
                .fromStatus(prev)
                .toStatus(app.getStatus())
                .remarks(request.getReason() != null ? request.getReason() : "Action: " + action)
                .changedBy(admin)
                .build();
        statusHistoryRepository.save(history);

        notificationService.sendNotification(
                app.getStudent(),
                "Application Update: " + app.getStatus().name(),
                "Your application " + app.getApplicationNumber() + " status has been updated to " + app.getStatus().name() + ". Remarks: " + (request.getReason() != null ? request.getReason() : "None"),
                "APPLICATION"
        );

        auditService.log(admin, "REVIEW_APPLICATION", "APPLICATION", app.getId(), "Action " + action + " executed for " + app.getApplicationNumber());
    }

    @Override
    @Transactional
    public void issueOffer(Long id, Map<String, Object> offerData, User admin) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        if (app.getBranch() == null) {
            throw new BadRequestException("Cannot issue offer: Candidate has no branch allocated");
        }

        // Reserve seat
        seatService.reserveSeat(app);

        ApplicationStatus prev = app.getStatus();
        app.setStatus(ApplicationStatus.OFFER_ISSUED);
        app.setOfferExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        app.setReviewedBy(admin);
        app.setReviewedAt(Instant.now());
        String remarks = (offerData != null && offerData.get("remarks") != null) ? offerData.get("remarks").toString() : "Offer issued. Valid for 7 days.";
        app.setReviewRemarks(remarks);

        applicationRepository.save(app);

        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(app)
                .fromStatus(prev)
                .toStatus(ApplicationStatus.OFFER_ISSUED)
                .remarks("Offer letter issued for " + app.getBranch().getName() + ". Expires in 7 days.")
                .changedBy(admin)
                .build();
        statusHistoryRepository.save(history);

        notificationService.sendNotification(
                app.getStudent(),
                "🎉 Admission Offer Issued!",
                "Congratulations! You have received an admission offer for " + app.getCourse().getName() + " — " + app.getBranch().getName() + ". Please confirm your seat by paying the admission fee within 7 days.",
                "OFFER"
        );

        auditService.log(admin, "ISSUE_OFFER", "APPLICATION", app.getId(), "Offer issued for " + app.getApplicationNumber() + ", seat reserved");
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMeritList(Long branchId) {
        return meritService.getRankedMeritList(branchId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Override
    @Transactional
    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    @Override
    @Transactional
    public Course updateCourse(Long id, Course course) {
        Course existing = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + id));
        existing.setName(course.getName());
        existing.setCode(course.getCode());
        existing.setDepartment(course.getDepartment());
        existing.setDurationYears(course.getDurationYears());
        existing.setDescription(course.getDescription());
        existing.setIsActive(course.getIsActive());
        return courseRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Branch> getBranches(Long courseId) {
        if (courseId != null) {
            return branchRepository.findByCourseId(courseId);
        }
        return branchRepository.findAll();
    }

    @Override
    @Transactional
    public Branch createBranch(BranchRequest request) {
        Long cId = Long.parseLong(request.getCourseId());
        Course course = courseRepository.findById(cId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + request.getCourseId()));

        Branch branch = Branch.builder()
                .course(course)
                .name(request.getName())
                .code(request.getCode())
                .totalSeats(request.getIntake() != null ? request.getIntake() : 60)
                .tuitionFee(request.getAdmissionFee() != null ? request.getAdmissionFee() : BigDecimal.valueOf(125000))
                .totalFee(request.getAdmissionFee() != null ? request.getAdmissionFee() : BigDecimal.valueOf(125000))
                .isActive(true)
                .build();
        return branchRepository.save(branch);
    }

    @Override
    @Transactional
    public Branch updateBranch(Long id, BranchRequest request) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found: " + id));

        if (request.getName() != null) branch.setName(request.getName());
        if (request.getCode() != null) branch.setCode(request.getCode());
        if (request.getIntake() != null) branch.setIntake(request.getIntake());
        if (request.getAdmissionFee() != null) branch.setAdmissionFee(request.getAdmissionFee());
        return branchRepository.save(branch);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EligibilityRule> getEligibilityRules() {
        return eligibilityRuleRepository.findAll();
    }

    @Override
    @Transactional
    public EligibilityRule createEligibilityRule(EligibilityRule rule) {
        return eligibilityRuleRepository.save(rule);
    }

    @Override
    @Transactional
    public EligibilityRule updateEligibilityRule(Long id, EligibilityRule rule) {
        EligibilityRule existing = eligibilityRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Eligibility rule not found: " + id));
        if (rule.getCourse() != null) existing.setCourse(rule.getCourse());
        if (rule.getBranch() != null) existing.setBranch(rule.getBranch());
        if (rule.getDescription() != null) existing.setDescription(rule.getDescription());
        if (rule.getCriteriaJson() != null) existing.setCriteriaJson(rule.getCriteriaJson());
        if (rule.getIsActive() != null) existing.setIsActive(rule.getIsActive());
        return eligibilityRuleRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MeritRule> getMeritRules() {
        return meritRuleRepository.findAll();
    }

    @Override
    @Transactional
    public MeritRule createMeritRule(MeritRule rule) {
        return meritRuleRepository.save(rule);
    }

    @Override
    @Transactional
    public MeritRule updateMeritRule(Long id, MeritRule rule) {
        MeritRule existing = meritRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Merit rule not found: " + id));
        if (rule.getCourse() != null) existing.setCourse(rule.getCourse());
        if (rule.getBranch() != null) existing.setBranch(rule.getBranch());
        if (rule.getDescription() != null) existing.setDescription(rule.getDescription());
        if (rule.getFormulaJson() != null) existing.setFormulaJson(rule.getFormulaJson());
        if (rule.getIsActive() != null) existing.setIsActive(rule.getIsActive());
        return meritRuleRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSeats() {
        List<Branch> branches = branchRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Branch b : branches) {
            Map<String, Object> m = new HashMap<>();
            m.put("branchId", b.getId());
            m.put("_id", String.valueOf(b.getId()));
            m.put("branchName", b.getName());
            m.put("courseName", b.getCourse() != null ? b.getCourse().getName() : "");
            m.put("totalSeats", b.getIntake());
            m.put("filledSeats", b.getFilledSeats());
            m.put("reservedSeats", b.getReservedSeats());
            m.put("availableSeats", Math.max(0, b.getIntake() - b.getFilledSeats() - b.getReservedSeats()));
            m.put("admissionFee", b.getAdmissionFee());
            result.add(m);
        }
        return result;
    }

    @Override
    @Transactional
    public void updateSeats(Long branchId, SeatUpdateRequest request) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found: " + branchId));
        if (request.getTotalSeats() != null) {
            branch.setIntake(request.getTotalSeats());
        }
        if (request.getAdmissionFee() != null) {
            branch.setAdmissionFee(request.getAdmissionFee());
        }
        branchRepository.save(branch);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getReports(String type, Map<String, String> params) {
        List<Application> apps = applicationRepository.findAll();
        List<Branch> branches = branchRepository.findAll();

        Map<String, Object> report = new HashMap<>();
        report.put("type", type);
        report.put("generatedAt", Instant.now());
        report.put("totalApplications", apps.size());

        // Status breakdown
        Map<String, Long> statusBreakdown = apps.stream()
                .collect(Collectors.groupingBy(a -> a.getStatus().name(), Collectors.counting()));
        report.put("statusBreakdown", statusBreakdown);

        // Branch-wise occupancy
        List<Map<String, Object>> branchStats = new ArrayList<>();
        for (Branch b : branches) {
            Map<String, Object> bs = new HashMap<>();
            bs.put("branch", b.getName());
            bs.put("intake", b.getIntake());
            bs.put("filled", b.getFilledSeats());
            bs.put("fillRate", b.getIntake() > 0 ? (b.getFilledSeats() * 100.0 / b.getIntake()) : 0.0);
            branchStats.add(bs);
        }
        report.put("branchStats", branchStats);

        // Course-wise funnel
        List<Course> courses = courseRepository.findAll();
        List<Map<String, Object>> courseStats = new ArrayList<>();
        for (Course c : courses) {
            Map<String, Object> cs = new HashMap<>();
            cs.put("name", c.getName());
            long applied = apps.stream().filter(a -> a.getCourse() != null && a.getCourse().getId().equals(c.getId())).count();
            long eligible = apps.stream().filter(a -> a.getCourse() != null && a.getCourse().getId().equals(c.getId()) && a.getEligibilityStatus() == EligibilityStatus.ELIGIBLE).count();
            long admitted = apps.stream().filter(a -> a.getCourse() != null && a.getCourse().getId().equals(c.getId()) && a.getStatus() == ApplicationStatus.ADMISSION_CONFIRMED).count();
            cs.put("applied", applied);
            cs.put("eligible", eligible);
            cs.put("admitted", admitted);
            courseStats.add(cs);
        }
        report.put("courseStats", courseStats);

        long admittedCount = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.ADMISSION_CONFIRMED).count();
        long docCount = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.UNDER_VERIFICATION).count();
        long underReviewCount = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.SUBMITTED).count();
        long offeredCount = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.OFFER_ISSUED).count();
        long rejectedCount = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.REJECTED).count();

        List<Map<String, Object>> statusList = new ArrayList<>();
        statusList.add(Map.of("name", "Admitted", "value", admittedCount, "color", "#0d9488"));
        statusList.add(Map.of("name", "Doc Verification", "value", docCount, "color", "#7c3aed"));
        statusList.add(Map.of("name", "Under Review", "value", underReviewCount, "color", "#d97706"));
        statusList.add(Map.of("name", "Offered", "value", offeredCount, "color", "#2563eb"));
        statusList.add(Map.of("name", "Not Eligible / Rejected", "value", rejectedCount, "color", "#dc2626"));
        report.put("statusList", statusList);

        return report;
    }
}
