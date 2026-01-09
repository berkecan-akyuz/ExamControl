# Frontend Documentation (React + Vite)

## Overview
The client-side application built with React, Vite, and TailwindCSS. It provides the UI for Admin management and Proctor workflows.

## Setup
1. `npm install` - Install dependencies.
2. `npm run dev` - Start dev server (Port 3000). Proxies `/api` to localhost:5000.

## Project Structure

### `/src/components`
Reusable UI elements.
*   `Layout.jsx`: Application wrapper with Sidebar navigation.

### `/src/pages`
*   **Login.jsx**: Entry point.
*   **CheckIn.jsx**: Proctor interface. Uses `Webcam` to capture images and sends them to Backend for verification. **No client-side ML**.
*   **ManageExams.jsx**: Create exams, view Rosters, and visual seating charts.
*   **ManageRooms.jsx**: Create room layouts. Renders grids based on `Seats` data.
*   **ActivityLog.jsx**: View Check-in history and violations.

## Key Features
*   **Secure Check-in**: Verification happens on server. Frontend only displays result.
*   **Live Seating Chart**: Visualizes student seat assignments.
*   **Tailwind Styling**: Dark-mode themed UI.
