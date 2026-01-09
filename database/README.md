# Database Documentation (MS SQL)

## Overview
This directory contains SQL scripts for setting up and managing the `ExamSecurityDB`.

## Files

### Schema & Setup
*   **`schema.sql`**: The master schema definition. Creates tables: `Users`, `Rooms`, `Seats`, `Exams`, `Students`, `ExamRoster`, `StudentPhotos`, `CheckInLogs`, `Violations`.
*   **`dummy_data.sql`**: The **recommended** seed script. Idempotent. Populates 50 students, exams, and deterministic roster data.

## How to Reset DB
1. Run `schema.sql` to (re)create tables.
2. Run `dummy_data.sql` to populate data.
FaceService: Creating MOCK verification result.