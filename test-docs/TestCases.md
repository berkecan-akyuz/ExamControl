# Test Cases - Exam Security System

| Test ID | Scenario | Precondition | Input steps | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC_AUTH_01** | Admin Login | System Online | 1. Navigate to Login<br>2. Enter 'admin', 'password' | Redirect to Dashboard |
| **TC_AUTH_02** | Invalid Login | System Online | 1. Enter 'wrong', 'user' | Show error "Invalid credentials" |
| **TC_CHK_01** | Successful Check-in | Exam Created, Student Roster loaded, Models loaded | 1. Select Exam X<br>2. Search 'Student A'<br>3. Capture Photo (Match)<br>4. Click Verify | Status 'Success', Roster updated to Present |
| **TC_CHK_02** | Face Mismatch (Security) | Same as above | 1. Select 'Student A'<br>2. Capture Photo (Person B)<br>3. Click Verify | Status 'Fail', Mismatch Alert |
| **TC_CHK_03** | Missing Model | Models not downloaded | 1. Open Check-in Page | Show "Loading Models..." indefinitely or Error message |
| **TC_SEAT_01** | Correct Seat | Student assigned A1 | 1. Check Seating Display | Show confirmation "Seat A1" |
| **TC_DB_01** | Data Persistence | Check-in completed | 1. Restart Server<br>2. Query CheckInLogs | Log entry still exists |
| **TC_CHK_04** | Duplicate Check-in | Student A already checked in | 1. Attempt to check in Student A again | System warns "Already Checked In" or updates log with new timestamp |
| **TC_CHK_05** | Multiple Faces Detected | Two people in camera view | 1. Position two faces in frame<br>2. Click Verify | Error: "Multiple faces detected" |
| **TC_CHK_06** | Missing Reference Photo | Student has no ref photo in DB | 1. Search 'Student B' (no photo)<br>2. Attempt Verify | Error: "No reference photo available" |
| **TC_VAL_01** | Empty Credentials | Login Page | 1. Leave fields empty<br>2. Click Login | Error: "Username and password required" |
| **TC_SEC_01** | **Secure ML Verification** | Student Selected | 1. Capture Photo<br>2. Click Verify | Backend processes image<br>Returns valid Match/NoMatch<br>Frontend shows "Server-Side ML Active" |
| **TC_SEC_02** | **Seat Code Verification** | Student at Wrong Seat | 1. Capture Photo (Match)<br>2. Seat Code != Assigned | Status 'Present' but Warning: "Wrong Seat!"<br>Log includes `IsSeatCorrect=0` |
| **TC_SEC_03** | **Secure File Upload** | Manage Roster | 1. Create Student<br>2. Upload via Webcam/File | File saved to `src/server/uploads/{uuid}`<br>DB stores relative path |
| **TC_UNIT_01** | **ML Service Resilience** | Backend | 1. Run `npm test` | All tests pass (Mock Mode active if binaries missing) |
