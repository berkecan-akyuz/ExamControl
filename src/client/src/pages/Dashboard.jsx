import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Users, BookOpen, Layout } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-slate-400">Welcome, {user?.fullName}</p>
                </div>
                <button onClick={logout} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <LogOut size={18} /> Logout
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div onClick={() => navigate('/admin/exams')} className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                        <BookOpen className="text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Manage Exams</h3>
                    <p className="text-slate-400">Create exams, set timing, and assign rooms.</p>
                </div>

                <div onClick={() => navigate('/admin/roster')} className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                        <Users className="text-purple-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Student Rosters</h3>
                    <p className="text-slate-400">Import students and assign seats.</p>
                </div>

                <div onClick={() => navigate('/admin/rooms')} className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-green-500/50 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                        <Layout className="text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Room Layouts</h3>
                    <p className="text-slate-400">Configure seating plans for rooms.</p>
                </div>
            </div>
        </div>
    );
}
