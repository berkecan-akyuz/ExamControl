# Backend Documentation (Node.js + Express)

## Overview
This directory contains the REST API server for the Exam Security System. It handles data persistence (MS SQL), business logic, and secure Face Verification.

## Setup
1. `npm install` - Install dependencies.
2. Setup `.env`:    ```
    DB_USER=...
    DB_PASS=...
    DB_SERVER=...
    DB_NAME=ExamSecurityDB
    JWT_SECRET=...
    ```
3. `npm run dev` - Start server with Nodemon (Port 5000).

## Architecture

### `/controllers`
Handles request logic.
*   `authController.js`: Login/Register logic.
*   `checkInController.js`: **Secure ML Verification**. Receives image -> Calls `faceService` -> Updates DB.
*   `roomController.js`: Manages Rooms and normalised `Seats` data.
*   `studentController.js`: CRUD for students.

### `/services`
### `/services`
*   `faceService.js`: Wraps `face-api.js` and **`@tensorflow/tfjs` (Pure JS v1.7.4)**.
    > **Note**: Native C++ bindings (`tfjs-node`) are incompatible with Node v24. This system is locked to Pure JS v1.7.4 for stability.

### `/middleware`
*   `authMiddleware.js`: JWT verification.
*   `upload.js`: **Multer** config for secure file uploads to `/uploads`.

### `/tests`
*   `validation.test.js`: Unit tests for input validation.
*   `faceService.test.js`: Unit tests for ML resilience.

## API Endpoints (Key)
*   **POST** `/api/checkin/verify`: Verify identity (FormData: `image`, `rosterId`).
*   **GET** `/api/rooms/:id/seats`: Fetches seat layout.
*   **POST** `/api/students`: Create student with photo uploads.
