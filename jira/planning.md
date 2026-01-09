# JIRA Planning - Exam Security System

> [!WARNING]
> **Academic Integrity**: You MUST rename these Epics, Stories, and Tasks to your own custom wording before putting them into your actual JIRA project. Do not copy-paste directly.

## Epic 1: Access Control & Security
**Goal**: Secure the application and ensure correct role permissions.

- **Story 1.1**: User Login
    - *As a User, I want to log in with my credentials so that I can access the system.*
    - **Tasks**:
        - Create Login UI (Form).
        - Implement Backend Auth API / JWT issuance.
        - Integrate Login Page with Auth API.
- **Story 1.2**: Role-Based Routing
    - *As an Admin, I want to access different pages than a Proctor.*
    - **Tasks**:
        - Create Protected Route component.
        - Redirect users based on role (Admin -> Dashboard, Proctor -> Exam Selection).

## Epic 2: Exam Administration
**Goal**: Allow Admins to set up the exam environment.

- **Story 2.1**: Exam Creation
    - *As an Admin, I want to create a new exam with date/time and room.*
    - **Tasks**:
        - Design Exam Form.
        - Implement Create Exam API.
- **Story 2.2**: Roster Management
    - *As an Admin, I want to import a list of students for an exam.*
    - **Tasks**:
        - Create CSV Import Utility or Bulk Entry Form.
        - Database insert logic for ExamRoster.

## Epic 3: Verification Workflow (The Core)
**Goal**: The main check-in process.

- **Story 3.1**: Student Selection
    - *As a Proctor, I want to search/select a student to check them in.*
    - **Tasks**:
        - Build Student Search/Autocomplete component.
        - Fetch Student Details API.
- **Story 3.2**: Face Verification
    - *As a Proctor, I want the system to compare the student's live face with their file photo.*
    - **Tasks**:
        - Integrate `face-api.js` into React.
        - Create Webcam Capture component.
        - Implement Logic: `match(live, reference)`.
- **Story 3.3**: Seat Compliance
    - *As a Proctor, I want to know if the student is in the right seat.*
    - **Tasks**:
        - Display "Assigned Seat" vs "Actual Seat" (if tracked) or just show Assigned Seat.

## Epic 4: Incident Logging & Reporting
**Goal**: Track issues and generate summary data.

- **Story 4.1**: Violation Recording
    - *As a Proctor, I want to log a violation if a student cheats or fails verification.*
    - **Tasks**:
        - Create Violation Modal/Form.
        - API to save Violation entry.
- **Story 4.2**: Dashboards
    - *As an Admin, I want to see how many students have checked in.*
    - **Tasks**:
        - Create Stats Widgets (Counter).
        - Query Stats API.
