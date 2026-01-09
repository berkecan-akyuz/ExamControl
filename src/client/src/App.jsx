import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProctorHome from './pages/ProctorHome';
import CheckIn from './pages/CheckIn';
import ActivityLog from './pages/ActivityLog';
import ManageExams from './pages/ManageExams';
import ManageRoster from './pages/ManageRoster';
import ManageRooms from './pages/ManageRooms';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    {/* Admin Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                        <Route path="/admin" element={<Dashboard />} />
                        <Route path="/admin/exams" element={<ManageExams />} />
                        <Route path="/admin/roster" element={<ManageRoster />} />
                        <Route path="/admin/rooms" element={<ManageRooms />} />
                    </Route>

                    {/* Proctor Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['Proctor', 'Admin']} />}>
                        <Route path="/proctor" element={<ProctorHome />} />
                        <Route path="/checkin" element={<CheckIn />} />
                        <Route path="/proctor/activity" element={<ActivityLog />} />
                    </Route>

                    {/* Default Redirect */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
