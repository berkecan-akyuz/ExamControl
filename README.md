# Exam Security System

**Identity Verification + Seating Plan + Violation Logging**

## Project Overview
This system provides an end-to-end solution for exam security, featuring:
- **Authentication**: Role-based access for Admins and Proctors.
- **Check-in Workflow**: Real-time face verification using `face-api.js` and webcam.
- **Seating Management**: Compliance checks against assigned seats.
- **Digital Logging**: Automatic recording of check-ins and violations in MS SQL Server.

## Directory Structure
- `analysis/` : Requirements & Business Rules
- `diagrams/` : System Design (Mermaid)
- `jira/` : Planning & Sprint info
- `database/` : T-SQL Schema & Data
- `src/client` : React Frontend
- `src/server` : Node.js Backend
- `tests/` : Backend Unit Tests
- `test-docs/` : Functional Test Cases

## How to Run
### Prerequisites
- Node.js (v18+)
- MS SQL Server (Local or Remote)

### 1. Database Setup
Run `database/schema.sql` and `database/dummy_data.sql` in SSMS to create `ExamSecurityDB`.

### 2. Backend Setup
```bash
cd src/server
npm install
# Configure .env if needed (default: user=sa, pass=yourStrong(!)Password)
npm start
```
Server runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd src/client
npm install
# Download ML models (Run PowerShell script)
../../download-models.ps1
npm run dev
```
Client runs on `http://localhost:3000`.

## Testing
To run backend unit tests:
```bash
cd src/server
npm test
```

## Demo Scenario
1. Login as **proctor1** / **password123**.
2. Go to **Start Check-in**.
3. Select "Intro to CS Final".
4. Search for "Alice".
5. Capture photo -> Verify. (Ensure models are loaded).
