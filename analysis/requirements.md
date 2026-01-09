# Requirements Analysis - Exam Security System

## 1. Project Overview
**Title**: Exam Security System
**Goal**: Develop a web-based system for exam-day identity verification, seating compliance, and incident recording.
**Core Components**: Web Application (React/Node), Database (MS SQL Server), ML Component (face-api.js).

## 2. Actors & Roles
| Actor | Role | Responsibilities |
| :--- | :--- | :--- |
| **Exam Coordinator** | Admin | Manage exams, rooms, rosters, and view full reports. |
| **Proctor** | Staff | Conduct exam check-ins, verify identities, log violations. |
| **Student** | User | (Passive) Subject of verification. May view their own status (optional). |

## 3. Functional Requirements

### 3.1. Authentication & Authorization
- **FR_AUTH_01**: System must allow users (Admins, Proctors) to login.
- **FR_AUTH_02**: System must enforce role-based access control (RBAC).
    - *Admin*: Full access.
    - *Proctor*: Read-only access to rosters, Write access to check-ins/violations.

### 3.2. Exam & Seating Management
- **FR_EXAM_01**: Admin can create/edit Exams (Name, Date, Time, Room).
- **FR_EXAM_02**: Admin can configure Rooms (Rows/Cols or specific Seat Codes).
- **FR_EXAM_03**: Admin can import or manually enter a Student Roster for an exam.
- **FR_EXAM_04**: System must automatically or manually assign seats to students.

### 3.3. Check-In Workflow (Core)
- **FR_CHK_01**: Proctor can select an active Exam to begin check-in.
- **FR_CHK_02**: System must capture a live photo of the student via webcam.
- **FR_CHK_03**: System must compare live photo with registered student photo using ML (face-api.js).
    - *Output*: Match / No Match / Low Confidence.
- **FR_CHK_04**: System must verify if the student is in the correct seat (if seat is part of input, or tell proctor the correct seat).
- **FR_CHK_05**: System logs the check-in attempt (Timestamp, ML Result, Seat Status).

### 3.4. Violation Logging
- **FR_VIO_01**: Proctor can manually log a violation.
- **FR_VIO_02**: Violation record must include: Student, Reason, Notes, Timestamp, (Optional) Evidence Image.

### 3.5. Reporting
- **FR_RPT_01**: Dashboard showing real-time stats (Total Checked-in, Pending, Violations).
- **FR_RPT_02**: List of mismatches or seating errors.

## 4. Non-Functional Requirements
- **NFR_PERF_01**: ML Verification should take less than 3 seconds.
- **NFR_UX_01**: UI must be "Premium" (Modern, Responsive, Good Feedback).
- **NFR_SEC_01**: Password hashing for users.
- **NFR_COMP_01**: Web-based (Browser accessibility).

## 5. Business Rules (Validation)
1.  **Duplicate Check-in**: A student cannot appear as "Present" twice for the same exam. If attempted, flag as warning.
2.  **Seat Conflict**: Two students cannot be assigned the same seat in the same exam.
3.  **Unofficial Student**: A student not on the roster cannot check in (must be added by Admin first).
4.  **Time Window**: Check-ins are only allowed within X minutes of Exam Start Time (configurable, e.g., -30min to +30min).
