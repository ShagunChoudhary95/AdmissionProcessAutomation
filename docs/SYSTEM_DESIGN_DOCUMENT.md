# FSD PROJECT — SYSTEM DESIGN DOCUMENT

**Admission Automation and Tracking System**

**Institution:** ABES Engineering College (College Code - 032)

| Field | Details |
|---|---|
| **Submitted by** | Shagun, Shivam Tomar |
| **Roll number(s)** | 2400320101017, 2400320101049 |
| **Branch and semester** | CSE / 5th |
| **Faculty guide** | Mr. Ashish Bajpai |
| **Date of submission** | 27/11/2026 |

---

## 1. Project Overview

### 1.1 Introduction

The **Admission Automation and Tracking System** is a full-stack web application that moves the complete admission process of a college or university online, from the first registration of an applicant to the final confirmation of admission. It replaces paper forms, manual document checking, spreadsheet-based merit lists and counter-based fee collection with one secure platform in which every user sees only what their role permits.

The system is built with React, Vite and Tailwind CSS on the frontend, Node.js and Express.js on the backend, and MongoDB with Mongoose as the database. Security is handled through JWT authentication and bcrypt password hashing. Applicant documents are uploaded using Multer, admission fees are collected through Razorpay, and status updates are sent to applicants by email using Nodemailer.

Three types of users work on the platform: the **Student** (applicant), the **Admission Admin** and the **Document Verification Officer**. Each has a separate dashboard and a clearly limited set of permissions.

### 1.2 Background and Purpose

During an admission cycle, an institution receives a large number of applications within a short period. Every application has to pass several checks: eligibility against the published criteria, merit ranking, verification of certificates, availability of a seat and finally payment of fees. These steps involve different people and different records.

When this work is done manually, it depends on paperwork, repeated data entry and personal follow-up by applicants. Errors, delays and disputes become common, and it is hard to know at any moment where a particular application stands.

The purpose of this project is to automate the repeatable steps (eligibility checking, merit calculation, seat counting, notifications and receipt generation) and to make the human steps (document verification and admission decisions) structured, recorded and traceable.

### 1.3 Problems in the Traditional Admission Process

- **Paper-based applications:** hand-filled forms are often incomplete or unclear and can be lost or damaged.
- **Manual eligibility checking:** staff compare each application with the criteria by hand, which is slow and may be inconsistent.
- **Error-prone merit lists:** merit is calculated in separate spreadsheets, so formula mistakes and ranking disputes are likely.
- **Slow document verification:** certificates are checked in queues, and there is no record of who verified which document and when.
- **No visibility for applicants:** students must visit the office or call repeatedly to learn the status of their application.
- **Seat mismanagement:** there is no live count of available seats, so over-allotment or under-use can occur.
- **Counter-based fee payment:** fee collection creates queues, manual receipts and reconciliation errors.
- **Delayed communication:** selection, rejection and missing-document messages reach applicants late.
- **Weak accountability:** decisions and changes are not recorded in a way that can be reviewed later.
- **Limited reporting:** management cannot see applications, seat usage and fee collection in real time.
- **Poor access control:** sensitive personal data is shared with more staff than necessary.

### 1.4 Proposed Automated Solution

The proposed system provides a single web platform that follows the admission workflow step by step and automates each stage where possible. The main elements of the solution are:

- Online registration, profile creation and application submission by the student.
- Upload of required documents and a dedicated verification workflow for the Document Verification Officer, including rejection and re-upload requests.
- Rule-based eligibility checking and merit calculation, using criteria that the Admission Admin configures.
- Admission decisions taken only by the Admission Admin, with seat availability checked and recorded.
- Online fee payment through Razorpay with server-side payment verification and downloadable receipts.
- Automatic in-app and email notifications at every important step.
- Reports, admission tracking and an audit log of important actions.

### 1.5 Objectives

- To digitise the end-to-end admission process, from student registration to final admission confirmation.
- To provide secure, role-based access for Students, Admission Admins and Document Verification Officers.
- To automate eligibility checking and merit calculation using configurable rules.
- To make document verification systematic, with a complete verification history.
- To manage seats accurately and prevent allotment beyond the available intake.
- To collect admission fees online and issue receipts automatically.
- To keep applicants informed through timely notifications.
- To give the Admission Admin clear reports and an audit trail for decision-making and accountability.
- To protect personal data and uploaded documents through authentication, authorisation and password hashing.

### 1.6 Scope of the Project

The system covers the following activities:

- User registration, login and role-based access for the three user roles.
- Student profile and application management, including course and branch preferences.
- Course, branch, eligibility rule, merit rule and seat management by the Admission Admin.
- Document upload, preview, verification, rejection and re-upload.
- Admission decisions, fee payment, receipt generation and final admission confirmation.
- Notifications, reports, admission tracking and audit logging.

Functionality that is not described in the modules of Section 3 is outside the scope of this document. Course and branch names are entered by the Admission Admin as data; no particular branch is assumed to be offered by this design.

### 1.7 Target Audience and Stakeholders

#### A. Student (Applicant)
A student who wishes to take admission to a course of the institution. Students may not be technically experienced, so the student dashboard must be simple and show clearly what has to be done next.
- Registers, completes a personal and academic profile and applies to a course with branch preferences.
- Uploads documents and re-uploads them when asked to.
- Tracks the application status, receives notifications, pays the fee and downloads the receipt.

#### B. Admission Admin
An authorised member of the admission office who manages the admission cycle and holds the final decision-making authority.
- Configures courses, branches, eligibility criteria, merit rules and seat intake.
- Reviews applications along with eligibility result, merit rank and document verification status.
- Takes admission decisions, monitors seats and payments, and views reports and audit logs.
- Creates accounts for Document Verification Officers and other Admission Admins.

#### C. Document Verification Officer
A staff member responsible only for checking the authenticity and completeness of uploaded documents. The officer has no administrative permissions and no authority over final admission decisions.
- Previews documents submitted by applicants.
- Verifies or rejects each document and records the reason.
- Requests re-upload when a document is unclear or incorrect and can view the verification history.

#### D. Other Stakeholders
The institution’s management benefits indirectly through the reports prepared by the Admission Admin, and the project evaluators review this system as a software engineering project.

### 1.8 Major Features and Functionalities

- **Authentication and authorisation:** login/logout, JWT-based sessions, bcrypt password hashing and role-based access control.
- **Student profile and application:** profile management, draft and submitted applications, course and branch preferences.
- **Course and branch management:** creation, update and deactivation of courses and branches by the Admission Admin.
- **Eligibility checking:** automatic comparison of the applicant’s details with the course criteria, with reasons for ineligibility.
- **Merit calculation:** weighted merit score and rank based on rules set by the Admission Admin.
- **Document management:** upload, preview, verification, rejection, re-upload requests and verification history.
- **Admission review:** a consolidated view of each application for the Admission Admin and recorded decisions.
- **Seat management:** branch-wise intake, reservation on selection, confirmation on payment and release when required.
- **Online payment:** Razorpay order creation, payment verification and recording of every transaction.
- **Receipts:** automatic receipt generation and download after successful payment.
- **Notifications:** in-app messages and email through Nodemailer for important events.
- **Reports and tracking:** status-wise, course-wise and seat-wise reports, payment reports and an audit log.
- **Role-based dashboards:** three separate dashboards that show only the functions allowed for each role.

### 1.9 Admission Process and Workflow

The complete admission journey, from registration to final confirmation, follows these steps:

1. **Registration:** the student registers with name, email and password. The account is created with the Student role and the password is stored as a bcrypt hash.
2. **Login:** the student logs in and receives a JWT. The Student dashboard opens.
3. **Profile:** the student completes the personal, academic and entrance-exam details.
4. **Application:** the student selects a course and branch preferences. The application is saved as a draft.
5. **Documents:** the student uploads the required documents. Files are received by Multer and stored.
6. **Submission and eligibility check:** on submission the system checks the application against the eligibility rules of the course. Ineligible applications are flagged with reasons.
7. **Merit calculation:** the merit score is calculated using the merit rules, and the Admission Admin generates the merit ranking for the course.
8. **Document verification:** the Document Verification Officer previews each document and verifies it, rejects it, or requests re-upload. The student re-uploads where required and the cycle repeats until all mandatory documents are verified.
9. **Admission review and decision:** the Admission Admin reviews eligibility, merit rank and verification status, and then selects (with a branch allotment) or rejects the application. Selection is allowed only for eligible applications whose documents are verified.
10. **Seat reservation:** on selection, a seat in the allotted branch is reserved and the student is notified.
11. **Fee payment:** the student pays the admission fee through Razorpay. The backend creates the order and verifies the payment signature.
12. **Final confirmation:** after verified payment, the seat is confirmed, the application becomes “Admission Confirmed”, and a receipt is generated for download.
13. **Monitoring:** throughout the process the student tracks the status, and the Admission Admin follows reports and audit logs.

#### Application Status Lifecycle

The status of an application moves through the stages shown below. Eligibility result, document status and payment status are stored separately so that each can be tracked on its own.

| Status | Meaning |
|---|---|
| **Draft** | Application created and being edited by the student. |
| **Submitted** | Application submitted; eligibility check and merit score calculated. |
| **Under Verification** | Documents are being verified by the Document Verification Officer. |
| **Verified** | All mandatory documents have been verified. |
| **Selected** | Admission Admin has approved admission and a seat is reserved; fee payment pending. |
| **Rejected** | Application rejected by the Admission Admin. |
| **Admission Confirmed** | Fee payment verified, seat confirmed and receipt generated. |

### 1.10 Key Business Rules

The following rules govern how the system behaves. They keep the automated workflow consistent and prevent decisions that the admission policy does not allow.

- A student can register only with the Student role. Admission Admin and Document Verification Officer accounts are created by an Admission Admin.
- A student can have one profile and can view or change only their own data.
- An application can be edited only while it is in the Draft status. After submission it is locked for the student.
- The eligibility check is run against the active eligibility rule of the selected course and academic year.
- An application that is not eligible cannot be selected; the reasons are stored and shown to the Admission Admin.
- The merit score is calculated only from the active merit rule of the course, so all applicants of a course are ranked by the same formula.
- A document can be verified or rejected only by a Document Verification Officer, and every action is added to the verification history.
- A student can replace a document only after a re-upload has been requested; each replacement is stored as a new version.
- Only the Admission Admin can select or reject an application, and selection requires that all mandatory documents are verified.
- A seat is reserved on selection and confirmed only after the payment is verified by the backend; the number of reserved and confirmed seats can never exceed the branch intake.
- The payment amount is taken from the course record on the server and is never accepted from the browser.
- Admission is confirmed only after successful, verified payment; a receipt number is generated at that time.
- Important actions are written to the audit log together with the user who performed them.

### 1.11 Typical User Scenarios

- **Student scenario:** A student registers, completes the profile and applies to a course with three branch preferences. After uploading the documents, the student submits the application and sees that the eligibility result is “Eligible”. A few days later the student receives an email that one certificate is unclear and must be uploaded again. After the new file is uploaded and verified, the student is notified of selection, pays the fee through Razorpay and downloads the receipt. The status then shows “Admission Confirmed”.
- **Admission Admin scenario:** The Admission Admin creates the course and its branches, sets the seat intake, and defines the eligibility and merit rules for the academic year. When applications arrive, the admin generates the merit ranking, opens each application with its eligibility result, merit rank and document status, and records the decision. The admin then monitors seat usage and payments through reports.
- **Document Verification Officer scenario:** The officer opens the list of applications awaiting verification, previews each document, and verifies it or rejects it with a reason. If a document is unclear, the officer requests a re-upload, and the student is notified. The officer can open the verification history of any document but cannot change the application status or take an admission decision.

### 1.12 Technology Stack and Its Purpose

| Technology | Purpose in this project |
|---|---|
| **React** | Builds the user interface as reusable components for the three role-based dashboards. |
| **Vite** | Development server and build tool for the React application. |
| **Tailwind CSS** | Utility-first styling for a consistent and responsive interface. |
| **Node.js** | JavaScript runtime on which the backend runs. |
| **Express.js** | Web framework used to build the REST API, routing and middleware. |
| **MongoDB** | Document database that stores all application data in collections. |
| **Mongoose** | Object-document mapper that defines schemas, validations and queries for MongoDB. |
| **JWT** | Signed tokens that identify the logged-in user and role on every API request. |
| **bcrypt** | Hashes passwords so that plain-text passwords are never stored. |
| **Multer** | Middleware that handles multipart file uploads of applicant documents. |
| **Razorpay** | Payment gateway used to create fee payment orders and verify payments. |
| **Nodemailer** | Sends email notifications to users from the backend. |

### 1.13 Security and Data Protection

Admission data includes personal details, academic records and identity documents, so security is part of the design from the beginning.

- Passwords are hashed with bcrypt and are never stored or returned in plain text.
- Each API request carries a JWT, which the backend verifies before processing the request.
- Role-based authorisation checks the user’s role on every protected endpoint, so a Document Verification Officer cannot reach administrative functions.
- Students can access only their own profile, applications, documents, payments and notifications.
- Uploaded files are accepted through Multer with limits on file type and size, and are not served to unauthorised users.
- Payments are confirmed only after the backend verifies the Razorpay signature.
- Requests are validated on the server, and error messages do not reveal internal details.
- The audit log records who did what and when, which supports later review.

### 1.14 Non-Functional Goals

- **Usability:** simple, responsive screens that work on desktop and mobile browsers, with clear status messages.
- **Reliability:** consistent data through validation, unique indexes and checks on seat counts and payments.
- **Performance:** common list pages use filters and pagination so that large numbers of applications remain manageable.
- **Maintainability:** separate layers and modules so that a change in one area has limited effect on others.
- **Scalability:** a stateless JWT-based API that can later run on more than one server.
- **Traceability:** every important decision and verification step can be traced through status history and audit logs.

### 1.15 Benefits of the System

- **For students:** apply from anywhere, avoid office queues, see live status, receive timely messages, pay online and download receipts.
- **For the Admission Admin:** consistent eligibility and merit results, live seat information, less manual work and ready reports.
- **For the Document Verification Officer:** a focused work queue, easy document preview and a recorded verification history.
- **For the institution:** transparent decisions, fewer errors and disputes, secure data handling and a reviewable audit trail.
- **Technical:** a modular design that keeps frontend, backend and database responsibilities separate and can be extended later.

### 1.16 Expected Outcomes

- A working web application that supports the complete admission workflow for the three user roles.
- Reduced processing time for eligibility checking, merit calculation and fee collection.
- Fewer errors in merit lists and seat allotment because both are rule-driven and system-checked.
- Better communication with applicants through automatic notifications.
- A secure and well-documented system that can be demonstrated and evaluated as a B.Tech project.

### 1.17 Assumptions and Constraints

The design makes the following assumptions where the project requirements leave a detail open. They can be changed without affecting the overall structure of the system.

- The first Admission Admin account is created directly in the database (seeded); later staff accounts are created from the application.
- The admission fee is a single amount stored with each course.
- The list of mandatory documents, the allowed file types and the maximum file size are configured during development.
- Eligibility criteria and merit weightages are defined by the Admission Admin, not fixed in the code.
- The storage location of uploaded files (server file system or a cloud storage service) is decided during implementation.
- Course and branch names are examples of data entered by the Admission Admin; none is assumed to be a confirmed offering.
- The system handles one admission cycle (academic year) at a time for rules and seats.

---

## 2. System Architecture

The system follows a layered, client–server architecture. The React frontend and the Express backend are separate applications that communicate through a REST API using JSON. Inside the backend, responsibilities are divided into logical layers so that each part can be developed and tested independently.

### 2.1 Architecture Layers

| Layer | Technology | Responsibilities |
|---|---|---|
| **Presentation Layer** | React + Vite + Tailwind CSS | • Shows the role-based dashboards, forms, tables and document preview.<br>• Sends API requests with the JWT and displays responses and errors.<br>• Opens the Razorpay checkout for fee payment. |
| **Application / API Layer** | Node.js + Express.js | • Exposes the REST endpoints and routes requests to controllers.<br>• Runs middleware: CORS, request validation, Multer file handling, JWT verification, role authorisation and error handling. |
| **Business Logic Layer** | Service modules (JavaScript) | • Contains the admission rules: eligibility check, merit calculation, status transitions, seat availability and payment confirmation.<br>• Triggers notifications and writes audit logs. |
| **Data Access Layer** | Mongoose | • Defines schemas and models, validates data and performs all database queries.<br>• Keeps database details away from the business logic. |
| **Database Layer** | MongoDB | • Stores the twelve collections of the system (Section 4).<br>• Maintains indexes and unique constraints. |
| **External Services Layer** | Razorpay, Nodemailer, document storage | • Razorpay: payment order creation and payment verification.<br>• Nodemailer: sends email notifications through an SMTP service.<br>• Document storage: holds the files received by Multer. |

**How the layers communicate:** The frontend calls the API layer over HTTP with JSON data. The API layer passes every request through authentication and authorisation, then hands it to the controller and business logic. The business logic reads or writes data only through the Mongoose models of the data access layer, which communicate with MongoDB. When required, the business logic also calls the external services (Razorpay, Nodemailer and document storage). The result returns along the same path as a JSON response to the frontend.

### 2.2 Architecture Flow

1. The Student, Admission Admin or Document Verification Officer opens the React frontend through a browser.
2. The frontend sends an HTTP/JSON request to the Express backend and attaches the JWT in the request header.
3. Express middleware validates the request and handles file uploads where needed.
4. The authentication and authorisation step verifies the JWT and checks that the user’s role may access the requested endpoint.
5. The authorised request reaches the route and controller.
6. The controller calls the relevant business logic module, for example eligibility, verification, seats or payments.
7. The business logic reads or writes data through the Mongoose models in MongoDB.
8. Where needed, the business logic calls Razorpay (payments), Nodemailer (email) or document storage (files).
9. The backend returns a JSON response and the frontend updates the screen for the user.

---

## 3. Main Modules

The system consists of ten modules. Each module is described by its purpose, main functionalities, users and permissions.

### Module 1: User and Role Management

| Attribute | Details |
|---|---|
| **Purpose** | Registers users, authenticates them and controls what each role may do. |
| **Main functionalities** | • Student registration and login/logout<br>• JWT authentication and bcrypt password hashing<br>• Role-based authorisation on every protected endpoint<br>• Profile management of basic account details<br>• Creation of Admission Admin and Document Verification Officer accounts by an Admission Admin |
| **Users** | Student, Admission Admin, Document Verification Officer |
| **Permissions and responsibilities** | Anyone can register only as a Student. Staff accounts are created by an Admission Admin. Each user can access only the endpoints allowed for their role. |

#### Three Primary Roles

| Role | Permissions |
|---|---|
| **Student** | Student profile, application submission, document upload, admission tracking, fee payment, receipt download |
| **Admission Admin** | Application review, course management, eligibility criteria, merit rules, seat management, admission decisions, reports |
| **Document Verification Officer** | Document preview, document verification, rejection, re-upload requests, verification history |

The Document Verification Officer has no administrative permissions and no authority to take final admission decisions.

**Authentication features:** Login/logout, JWT authentication, bcrypt password hashing, Role-based authorisation, Profile management.

### Module 2: Student Profile and Application Management

| Attribute | Details |
|---|---|
| **Purpose** | Stores the applicant’s details and manages the application from draft to submission and tracking. |
| **Main functionalities** | • Create and update the student profile (personal, address, academic and entrance-exam details)<br>• Create a draft application with course and branch preferences<br>• Edit a draft and submit the application<br>• View own applications and track status with history |
| **Users** | Student (own data); Admission Admin (view); Document Verification Officer (view the application being verified) |
| **Permissions and responsibilities** | The student can read and change only their own profile and applications, and cannot change an application after submission. The Admission Admin can view all applications. |

### Module 3: Course and Branch Management

| Attribute | Details |
|---|---|
| **Purpose** | Maintains the courses and branches for which admission is offered. |
| **Main functionalities** | • Create, update and deactivate courses<br>• Create, update and deactivate branches under a course<br>• Set the admission fee of a course<br>• List active courses and branches for applicants |
| **Users** | Admission Admin (manage); Student (view active courses and branches) |
| **Permissions and responsibilities** | Only the Admission Admin can change course and branch data. Course and branch names are entered as data and are not fixed by this design. |

### Module 4: Eligibility and Merit Calculation

| Attribute | Details |
|---|---|
| **Purpose** | Applies the admission criteria to each application and ranks eligible applicants. |
| **Main functionalities** | • Define eligibility rules per course and academic year (minimum percentage, required subjects, entrance-exam requirement)<br>• Run the eligibility check and record reasons for ineligibility<br>• Define merit rules (weightage of academic percentage and entrance score, tie-breakers)<br>• Calculate the merit score and generate the merit ranking of a course |
| **Users** | Admission Admin (configure, generate ranking); Student (preview own eligibility); the system executes the calculations |
| **Permissions and responsibilities** | Only the Admission Admin can create or change rules. Results are produced by the system, not typed in manually. |

### Module 5: Admission Admin Management

| Attribute | Details |
|---|---|
| **Purpose** | Gives the Admission Admin one place to review applications and take admission decisions. |
| **Main functionalities** | • List applications with filters (status, course, branch)<br>• View the profile, eligibility result, merit rank and document status of an application<br>• Record a decision: select with branch allotment, or reject, with remarks<br>• Admin dashboard with summary counts |
| **Users** | Admission Admin |
| **Permissions and responsibilities** | The Admission Admin holds the final admission decision authority. A candidate can be selected only if eligible and all mandatory documents are verified. |

### Module 6: Document Verification Management

| Attribute | Details |
|---|---|
| **Purpose** | Handles document upload and the verification workflow. |
| **Main functionalities** | • Upload documents against an application (Multer)<br>• Preview documents<br>• Verify or reject a document with remarks<br>• Request re-upload and accept a new version from the student<br>• Maintain the verification history of each document |
| **Users** | Student (upload, re-upload); Document Verification Officer (verify, reject, request re-upload); Admission Admin (view) |
| **Permissions and responsibilities** | Only the Document Verification Officer can change the verification status of a document. The officer cannot approve or reject an admission. A student can re-upload only when a re-upload is requested. |

### Module 7: Seat Management

| Attribute | Details |
|---|---|
| **Purpose** | Tracks seat intake and prevents allotment beyond the available seats. |
| **Main functionalities** | • Set branch-wise intake<br>• Reserve a seat when an applicant is selected<br>• Confirm the seat after payment verification<br>• Release a reserved seat when required<br>• Show seat availability (intake minus reserved and confirmed seats) |
| **Users** | Admission Admin; the system updates reservations automatically |
| **Permissions and responsibilities** | Only the Admission Admin can set intake or release a seat. The system blocks a selection when no seat is available. |

### Module 8: Payment and Receipt Management

| Attribute | Details |
|---|---|
| **Purpose** | Collects the admission fee online and issues receipts. |
| **Main functionalities** | • Create a Razorpay order for a selected application<br>• Verify the payment signature on the backend<br>• Record payment details and status<br>• Confirm the admission and seat after successful payment<br>• Generate and download a receipt |
| **Users** | Student (pay, download receipt); Admission Admin (view payments) |
| **Permissions and responsibilities** | A student can pay only for their own selected application. Payment is treated as successful only after the backend verifies it. |

### Module 9: Notification Management

| Attribute | Details |
|---|---|
| **Purpose** | Keeps users informed through in-app notifications and email. |
| **Main functionalities** | • Create notifications for events such as submission, document verified/rejected, re-upload request, decision, payment success and confirmation<br>• Send email through Nodemailer and record the email status<br>• List notifications and mark them as read |
| **Users** | All three roles (own notifications only); the system creates notifications |
| **Permissions and responsibilities** | Users can read only their own notifications. Notifications are created by the system and not typed by users. |

### Module 10: Reports and Admission Tracking

| Attribute | Details |
|---|---|
| **Purpose** | Provides tracking for students and reports and audit information for the Admission Admin. |
| **Main functionalities** | • Student view of application status and history<br>• Summary counts by status, course and branch<br>• Seat utilisation and payment reports<br>• Audit logs of important actions such as login, decisions, verification actions, rule changes and payments |
| **Users** | Student (own tracking); Admission Admin (reports and audit logs) |
| **Permissions and responsibilities** | Reports and audit logs are available only to the Admission Admin. Audit log entries cannot be edited from the application. |

---

## 4. Database Design

### 4.1 Database Overview

| Attribute | Details |
|---|---|
| **Database name** | `admission_tracking_db` (proposed name) |
| **Database technology** | MongoDB (NoSQL document database) accessed through Mongoose |
| **Primary identifier** | Every document has an auto-generated `_id` of type `ObjectId`. |
| **References** | Relationships are stored as `ObjectId` references (for example, `applications.courseId` refers to `courses._id`). MongoDB does not enforce foreign keys, so Mongoose and the service layer maintain them. |
| **Embedded data** | Data that always belongs to one parent is embedded: status history in applications, verification history in documents, and academic details in student profiles. |
| **Common fields** | `createdAt` and `updatedAt` are added to every collection by Mongoose timestamps. |

### 4.2 Collections and Their Purpose

| Collection | Purpose |
|---|---|
| `users` | Login accounts of all roles with hashed passwords and role. |
| `studentProfiles` | Personal, academic and entrance-exam details of a student. |
| `applications` | Admission applications with preferences, status, eligibility, merit and decision. |
| `courses` | Courses offered for admission, with admission fee. |
| `branches` | Branches under a course, with seat intake. |
| `eligibilityRules` | Eligibility criteria per course and academic year. |
| `meritRules` | Merit calculation weightages and tie-breakers per course and academic year. |
| `documents` | Uploaded documents with verification status and history. |
| `payments` | Razorpay order and payment records, and receipt numbers. |
| `seatReservations` | Seat reservations linking an application to a branch. |
| `notifications` | In-app and email notifications for users. |
| `auditLogs` | Record of important actions performed by users. |

### 4.3 Database Schema

Field names and types below are the proposed Mongoose schema. Fields marked “FK” hold an `ObjectId` reference to another collection.

#### `users`
| Field | Type | Description / Constraints |
|---|---|---|
| `_id` | ObjectId | Primary key. |
| `name` | String | Required. |
| `email` | String | Required, unique, lowercase. |
| `passwordHash` | String | Required. bcrypt hash; excluded from query results by default. |
| `role` | String (enum) | `student`, `admission_admin` or `verification_officer`. Required. |
| `phone` | String | Optional contact number. |
| `isActive` | Boolean | Default `true`. Inactive users cannot log in. |
| `lastLoginAt` | Date | Time of last login. |

#### `studentProfiles`
| Field | Type | Description / Constraints |
|---|---|---|
| `_id` | ObjectId | Primary key. |
| `userId` | ObjectId (FK → `users`) | Required, unique. One profile per student user. |
| `fullName`, `gender`, `guardianName` | String | Personal details. |
| `dateOfBirth` | Date | Date of birth. |
| `category` | String | Admission category, if the criteria use it (to be confirmed). |
| `phone` | String | Contact number. |
| `address` | Object | `line1`, `city`, `state`, `pincode`. |
| `academicDetails` | Object | `boardName`, `passingYear`, `aggregatePercentage`, `subjectMarks[ {subject, marks, maxMarks} ]`. |
| `entranceExam` | Object | `examName`, `rollNumber`, `score`, `rank`. |
| `profileCompleted` | Boolean | Default `false`. |

#### `applications`
| Field | Type | Description / Constraints |
|---|---|---|
| `_id` | ObjectId | Primary key. |
| `applicationNumber` | String | Required, unique. Generated on creation. |
| `studentId` | ObjectId (FK → `studentProfiles`) | Required. |
| `courseId` | ObjectId (FK → `courses`) | Required. |
| `academicYear` | String | Admission cycle, for example `2026-27`. |
| `preferences` | Array | `[ { branchId (FK → branches), order (Number) } ]`. Student’s branch preferences. |
| `allottedBranchId` | ObjectId (FK → `branches`) | Set when the Admission Admin selects the applicant. |
| `status` | String (enum) | `draft`, `submitted`, `under_verification`, `verified`, `selected`, `rejected`, `admission_confirmed`. Default `draft`. |
| `eligibilityStatus` | String (enum) | `pending`, `eligible` or `not_eligible`. |
| `eligibilityRemarks` | Array of String | Reasons when not eligible. |
| `meritScore`, `meritRank` | Number | Calculated from the merit rule. |
| `decision` | Object | `decidedBy (FK → users)`, `decidedAt`, `remarks`. |
| `statusHistory` | Array | `[ { status, changedBy (FK → users), changedAt, remarks } ]`. |
| `submittedAt` | Date | Time of submission. |

#### `courses`
| Field | Type | Description / Constraints |
|---|---|---|
| `_id` | ObjectId | Primary key. |
| `name` | String | Required. |
| `code` | String | Required, unique. |
| `level` | String | Programme level. |
| `durationYears` | Number | Course duration. |
| `admissionFee` | Number | Fee amount in INR used for payment. |
| `description` | String | Optional. |
| `isActive` | Boolean | Default `true`. |

#### `branches`
| Field | Type | Description / Constraints |
|---|---|---|
| `_id` | ObjectId | Primary key. |
| `courseId` | ObjectId (FK → `courses`) | Required. |
| `name` | String | Required. |
| `code` | String | Required, unique. |
| `intake` | Number | Total seats available in the branch. |
| `isActive` | Boolean | Default `true`. |

#### `eligibilityRules`
| Field | Type | Description / Constraints |
|---|---|---|
| `_id` | ObjectId | Primary key. |
| `courseId` | ObjectId (FK → `courses`) | Required. Unique together with `academicYear`. |
| `academicYear` | String | Required. |
| `minAggregatePercentage` | Number | Minimum qualifying percentage. |
| `requiredSubjects` | Array | `[ { subject, minPercentage } ]`. |
| `entranceRequired` | Boolean | Whether an entrance score is needed. |
| `minEntranceScore` | Number | Minimum entrance score, if required. |
| `isActive` | Boolean | Default `true`. |

#### `meritRules`
| Field | Type | Description / Constraints |
|---|---|---|
| `_id` | ObjectId | Primary key. |
| `courseId` | ObjectId (FK → `courses`) | Required. Unique together with `academicYear`. |
| `academicYear` | String | Required. |
| `weightages` | Object | `academicPercentage` and `entranceScore` weights; total 100. |
| `tieBreakers` | Array of String | Ordered fields used to break equal scores. |
| `isActive` | Boolean | Default `true`. |

#### `documents`
| Field | Type | Description / Constraints |
|---|---|---|
| `_id` | ObjectId | Primary key. |
| `applicationId` | ObjectId (FK → `applications`) | Required. |
| `documentType` | String | Type of document (list of required types to be confirmed). |
| `fileName` | String | Original file name. |
| `filePath` | String | Location of the stored file. |
| `mimeType`, `fileSize` | String, Number | File type and size. |
| `version` | Number | Increases with every re-upload. |
| `status` | String (enum) | `pending`, `verified`, `rejected` or `reupload_requested`. |
| `remarks` | String | Reason entered by the officer. |
| `verifiedBy` | ObjectId (FK → `users`) | Officer who verified or rejected. |
| `verifiedAt` | Date | Time of verification. |
| `history` | Array | `[ { action, performedBy (FK → users), remarks, at } ]`. Verification history. |

#### `payments`
| Field | Type | Description / Constraints |
|---|---|---|
| `_id` | ObjectId | Primary key. |
| `applicationId` | ObjectId (FK → `applications`) | Required. |
| `razorpayOrderId` | String | Required, unique. |
| `razorpayPaymentId` | String | Set after payment. |
| `razorpaySignature` | String | Used for server-side verification. |
| `amount` | Number | Amount in INR. |
| `currency` | String | Default `INR`. |
| `status` | String (enum) | `created`, `paid` or `failed`. |
| `receiptNumber` | String | Unique (sparse). Generated after successful payment. |
| `paidAt` | Date | Time of payment. |

#### `seatReservations`
| Field | Type | Description / Constraints |
|---|---|---|
| `_id` | ObjectId | Primary key. |
| `applicationId` | ObjectId (FK → `applications`) | Required. |
| `branchId` | ObjectId (FK → `branches`) | Required. |
| `academicYear` | String | Admission cycle. |
| `status` | String (enum) | `reserved`, `confirmed` or `released`. |
| `reservedAt`, `confirmedAt`, `releasedAt` | Date | Time of each change. |

#### `notifications`
| Field | Type | Description / Constraints |
|---|---|---|
| `_id` | ObjectId | Primary key. |
| `userId` | ObjectId (FK → `users`) | Required. Recipient. |
| `applicationId` | ObjectId (FK → `applications`) | Optional. Related application. |
| `type` | String | Event type. |
| `title`, `message` | String | Notification text. |
| `channel` | String (enum) | `in_app` or `email`. |
| `isRead` | Boolean | Default `false`. |
| `emailStatus` | String (enum) | `not_applicable`, `sent` or `failed`. |

#### `auditLogs`
| Field | Type | Description / Constraints |
|---|---|---|
| `_id` | ObjectId | Primary key. |
| `actorId` | ObjectId (FK → `users`) | User who performed the action. |
| `action` | String | For example `LOGIN`, `DOCUMENT_VERIFIED`, `DECISION_RECORDED`. |
| `entityType` | String | Collection affected. |
| `entityId` | ObjectId | Document affected. |
| `details` | Mixed | Extra information about the action. |
| `ipAddress` | String | Request origin. |

### 4.4 Relationships Between Collections

| Child collection | Reference field | Parent collection | Relationship |
|---|---|---|---|
| `studentProfiles` | `userId` | `users` | One-to-one |
| `applications` | `studentId` | `studentProfiles` | Many-to-one |
| `applications` | `courseId` | `courses` | Many-to-one |
| `applications` | `preferences[ ].branchId`, `allottedBranchId` | `branches` | Many-to-many (preferences), many-to-one (allotted) |
| `branches` | `courseId` | `courses` | Many-to-one |
| `eligibilityRules` | `courseId` | `courses` | Many-to-one |
| `meritRules` | `courseId` | `courses` | Many-to-one |
| `documents` | `applicationId` | `applications` | Many-to-one |
| `documents` | `verifiedBy` | `users` | Many-to-one |
| `payments` | `applicationId` | `applications` | Many-to-one |
| `seatReservations` | `applicationId` | `applications` | Many-to-one |
| `seatReservations` | `branchId` | `branches` | Many-to-one |
| `notifications` | `userId` | `users` | Many-to-one |
| `notifications` | `applicationId` (optional) | `applications` | Many-to-one |
| `auditLogs` | `actorId` | `users` | Many-to-one |

Seat availability of a branch is calculated as: `intake` of the branch minus the number of `seatReservations` with status `reserved` or `confirmed`.

---

## 5. REST API Design

All endpoints are prefixed with `/api` and exchange JSON, except file upload (`multipart/form-data`) and receipt download (`PDF`). Every endpoint except registration and login requires the header `Authorization: Bearer <JWT>`. Roles: **ST** = Student, **AA** = Admission Admin, **DVO** = Document Verification Officer.

### 5.1 Authentication and Users

| HTTP Method | Endpoint | Purpose | Authorised Role |
|---|---|---|---|
| `POST` | `/auth/register` | Register a new student account | Public |
| `POST` | `/auth/login` | Login and receive a JWT | Public |
| `POST` | `/auth/logout` | Logout and record the event | All roles |
| `GET` | `/auth/me` | Get the logged-in user’s details | All roles |
| `PUT` | `/users/me` | Update own account details (profile management) | All roles |
| `POST` | `/users` | Create an Admission Admin or Verification Officer account | AA |

### 5.2 Student Profile

| HTTP Method | Endpoint | Purpose | Authorised Role |
|---|---|---|---|
| `POST` | `/students/profile` | Create own profile | ST |
| `GET` | `/students/profile` | View own profile | ST |
| `PUT` | `/students/profile` | Update own profile | ST |
| `GET` | `/students` | List student profiles | AA |
| `GET` | `/students/:id` | View one student profile | AA |

### 5.3 Course and Branch Management

| HTTP Method | Endpoint | Purpose | Authorised Role |
|---|---|---|---|
| `GET` | `/courses` | List active courses | All roles |
| `GET` | `/courses/:id` | Get course details | All roles |
| `POST` | `/courses` | Create a course | AA |
| `PUT` | `/courses/:id` | Update a course | AA |
| `DELETE` | `/courses/:id` | Deactivate a course (soft delete) | AA |
| `GET` | `/courses/:courseId/branches` | List branches of a course | All roles |
| `POST` | `/courses/:courseId/branches` | Create a branch under a course | AA |
| `PUT` | `/branches/:id` | Update a branch | AA |
| `DELETE` | `/branches/:id` | Deactivate a branch (soft delete) | AA |

### 5.4 Eligibility and Merit

| HTTP Method | Endpoint | Purpose | Authorised Role |
|---|---|---|---|
| `POST` | `/eligibility-rules` | Create an eligibility rule for a course | AA |
| `GET` | `/eligibility-rules` | List eligibility rules (filter by course and year) | AA |
| `PUT` | `/eligibility-rules/:id` | Update an eligibility rule | AA |
| `POST` | `/merit-rules` | Create a merit rule for a course | AA |
| `GET` | `/merit-rules` | List merit rules | AA |
| `PUT` | `/merit-rules/:id` | Update a merit rule | AA |
| `POST` | `/applications/:id/check-eligibility` | Run the eligibility check for an application | ST (own), AA |
| `POST` | `/applications/:id/calculate-merit` | Calculate the merit score of an application | AA |
| `POST` | `/courses/:courseId/merit-ranking` | Generate merit ranking of eligible applications of a course | AA |
| `GET` | `/courses/:courseId/merit-list` | View the merit list of a course | AA |

### 5.5 Application Submission and Tracking

| HTTP Method | Endpoint | Purpose | Authorised Role |
|---|---|---|---|
| `POST` | `/applications` | Create a draft application | ST |
| `GET` | `/applications/me` | List own applications | ST |
| `GET` | `/applications/:id` | Get application details | ST (own), AA, DVO |
| `PUT` | `/applications/:id` | Update a draft application | ST (own) |
| `POST` | `/applications/:id/submit` | Submit the application | ST (own) |
| `GET` | `/applications/:id/status` | Track status and status history | ST (own), AA |

### 5.6 Admin Application Review

| HTTP Method | Endpoint | Purpose | Authorised Role |
|---|---|---|---|
| `GET` | `/applications` | List all applications with filters (status, course, branch) | AA |
| `PATCH` | `/applications/:id/decision` | Record the admission decision (select with branch allotment, or reject) | AA |

### 5.7 Document Upload and Verification

| HTTP Method | Endpoint | Purpose | Authorised Role |
|---|---|---|---|
| `POST` | `/applications/:id/documents` | Upload a document (`multipart/form-data`) | ST (own) |
| `GET` | `/applications/:id/documents` | List documents of an application | ST (own), AA, DVO |
| `GET` | `/documents/:id/preview` | Preview a document file | ST (own), AA, DVO |
| `GET` | `/verification/applications` | List applications with documents awaiting verification | DVO |
| `PATCH` | `/documents/:id/verify` | Mark a document as verified | DVO |
| `PATCH` | `/documents/:id/reject` | Reject a document with a reason | DVO |
| `GET` | `/documents/:id/history` | View the verification history of a document | DVO, AA |

### 5.8 Document Re-upload Requests

| HTTP Method | Endpoint | Purpose | Authorised Role |
|---|---|---|---|
| `POST` | `/documents/:id/reupload-request` | Request the student to re-upload a document | DVO |
| `POST` | `/documents/:id/reupload` | Upload a replacement document (new version) | ST (own) |

### 5.9 Seat Management

| HTTP Method | Endpoint | Purpose | Authorised Role |
|---|---|---|---|
| `GET` | `/branches/:id/seats` | View seat intake and availability of a branch | AA |
| `PUT` | `/branches/:id/seats` | Set the seat intake of a branch | AA |
| `GET` | `/seat-reservations` | List seat reservations | AA |
| `POST` | `/seat-reservations/:id/release` | Release a reserved seat | AA |

### 5.10 Payment and Receipt

| HTTP Method | Endpoint | Purpose | Authorised Role |
|---|---|---|---|
| `POST` | `/payments/orders` | Create a Razorpay order for a selected application | ST (own) |
| `POST` | `/payments/verify` | Verify the Razorpay payment signature and confirm admission | ST (own) |
| `GET` | `/payments` | List all payments | AA |
| `GET` | `/payments/:id` | Get payment details | ST (own), AA |
| `GET` | `/payments/:id/receipt` | Generate and download the payment receipt (PDF) | ST (own), AA |

### 5.11 Notifications

| HTTP Method | Endpoint | Purpose | Authorised Role |
|---|---|---|---|
| `GET` | `/notifications` | List own notifications | All roles |
| `PATCH` | `/notifications/:id/read` | Mark a notification as read | All roles |

### 5.12 Reports and Audit Logs

| HTTP Method | Endpoint | Purpose | Authorised Role |
|---|---|---|---|
| `GET` | `/reports/summary` | Application counts by status | AA |
| `GET` | `/reports/applications` | Course-wise and branch-wise application report | AA |
| `GET` | `/reports/seats` | Seat utilisation report | AA |
| `GET` | `/reports/payments` | Payment collection report | AA |
| `GET` | `/audit-logs` | View audit logs (filter by user, action, date) | AA |

Notifications are created by the system when events occur, so there is no endpoint for creating them manually.

---

## 6. Recommended Development Phases

| Phase | Development Activity | Duration |
|---|---|---|
| 1 | **Requirements Analysis and UI Design.** Finalise requirements, workflows and roles; prepare wireframes for the three dashboards. | 1 week |
| 2 | **Frontend Development.** Set up React with Vite and Tailwind CSS; build layouts, routing, forms and dashboard pages with sample data. | 1.5 weeks |
| 3 | **Authentication and Role Management.** Registration, login/logout, JWT, bcrypt, role-based authorisation, profile management and staff account creation. | 1 week |
| 4 | **Student Application Workflow.** Student profile, course and branch listing, draft and submitted applications, eligibility check and status tracking. | 1.5 weeks |
| 5 | **Admin Dashboard Development.** Course, branch, eligibility rule, merit rule and seat management; application review, merit ranking, decisions and reports. | 1.5 weeks |
| 6 | **Document Verification Workflow.** Multer upload, document preview, verify/reject, re-upload requests, versions and verification history. | 1 week |
| 7 | **Database and Backend Integration.** Finalise Mongoose schemas and indexes, connect frontend to the REST API, add validation, error handling and audit logging. | 1 week |
| 8 | **Payment and Notification Integration.** Razorpay order and verification, seat confirmation, receipt generation, Nodemailer emails and in-app notifications. | 1 week |
| 9 | **Testing and Deployment.** Functional, role-permission and payment-flow testing; bug fixing; deployment and final documentation. | 1 week |

Total estimated duration is about 10 weeks. The durations are estimates for a small team; some phases (for example 2 and 3, or 5 and 6) can run in parallel.
