# Extended Sequence Diagrams

## SQ-01: Multi-Photo Student Registration
```mermaid
sequenceDiagram
    participant Admin
    participant UI as Roster UI
    participant Webcam
    participant API as StudentController
    participant DB as SQL Database

    Admin->>UI: Click "Add Student"
    UI->>Admin: Show Form
    Admin->>UI: Enter Details
    loop For 3-5 Angles
        Admin->>Webcam: Position Student
        UI->>Webcam: Capture Frame
        Webcam-->>UI: Return Base64 Image
        UI->>UI: Add to Gallery
    end
    Admin->>UI: Click Save
    UI->>API: POST /api/students (Data + Photos[])
    API->>DB: INSERT Student
    loop For each Photo
        API->>DB: INSERT StudentPhotos
    end
    DB-->>API: Success
    API-->>UI: 200 OK
    UI-->>Admin: Show "Student Created"
```

## SQ-02: AI-Powered Check-in Verification
```mermaid
sequenceDiagram
    participant Proctor
    participant UI as CheckIn UI
    participant ML as FaceAPI.js
    participant API as CheckInController
    participant DB as SQL Database

    Proctor->>UI: Select Exam & Search Student
    UI->>API: GET /roster/search
    API->>DB: Fetch Student + Photos
    DB-->>API: Return Data
    API-->>UI: Student Data (Photos[])
    
    Proctor->>UI: Align Student in Camera
    loop Every 100ms
        UI->>ML: Detect Face (Video Feed)
        ML-->>UI: Draw Bounding Box
    end

    Proctor->>UI: Click "Verify"
    UI->>UI: Capture Current Frame
    loop For each Reference Photo
        UI->>ML: Compare(Live, Ref Check)
        ML-->>UI: Return Distance Score
    end
    UI->>UI: Find Best Match (Lowest Distance)

    alt Distance < 0.6
        UI->>API: POST /api/checkin (Success)
        API->>DB: UPDATE Roster (Present)
        API->>DB: INSERT CheckInLog
        UI-->>Proctor: Show Green "MATCH"
    else Distance >= 0.6
        UI-->>Proctor: Show Red "FAIL"
    end
```

## SQ-03: Real-time Seat Compliance Check
```mermaid
sequenceDiagram
    participant Student
    participant API as LogController
    participant DB as SQL Database

    Note over Student, DB: Conceptual flow for automated checks
    loop Every 5 Minutes
        API->>DB: Get Active Check-ins
        DB-->>API: List of Present Students
        
        par Verify Seats
            API->>API: Check Assigned vs Actual (Manual/Sensor)
        and Verify Status
            API->>API: Confirm Student hasn't left
        end

        alt Violation Detected
            API->>DB: INSERT Violation (Wrong Seat)
        end
    end
```

## SQ-04: Violation Logging Workflow
```mermaid
sequenceDiagram
    participant Proctor
    participant UI as ActivityLog UI
    participant API as LogController
    participant DB as SQL Database

    Proctor->>UI: Click "Report Violation"
    UI->>Proctor: Show Violation Form
    Proctor->>UI: Select Student, Reason, Notes
    Proctor->>UI: Click "Submit"
    UI->>API: POST /api/violations
    API->>DB: INSERT Violation
    DB-->>API: Success
    API-->>UI: 200 OK
    UI->>Proctor: Show "Report Filed"
    UI->>UI: Refresh Log List
```

## SQ-05: Room Creation Flow
```mermaid
sequenceDiagram
    participant Admin
    participant UI as ManageRooms UI
    participant API as RoomController
    participant DB as SQL Database

    Admin->>UI: Open "Manage Rooms"
    UI->>API: GET /api/rooms
    API->>DB: SELECT * FROM Rooms
    DB-->>API: Return Rooms
    API-->>UI: Display Room List

    Admin->>UI: Click "Add Room"
    Admin->>UI: Input Name, Rows, Cols
    UI->>UI: Calculate Capacity
    Admin->>UI: Click "Save"
    UI->>API: POST /api/rooms
    API->>DB: INSERT Rooms (LayoutConfig JSON)
    DB-->>API: Success
    API-->>UI: 200 OK
    UI->>Admin: Update Grid view
```
