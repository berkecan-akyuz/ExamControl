import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Scan, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProctorHome() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Proctor Console</h1>
                    <p className="text-slate-400">Welcome, {user?.fullName}</p>
                </div>
                <button onClick={logout} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <LogOut size={18} /> Logout
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div onClick={() => navigate('/checkin')} className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
                        <Scan className="text-indigo-500 w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Start Check-in</h3>
                    <p className="text-slate-400">Verify student identities and seating compliance.</p>
                </div>

                <div onClick={() => navigate('/proctor/activity')} className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-orange-500/50 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                        <History className="text-orange-500 w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">View Activity Log</h3>
                    <p className="text-slate-400">Review recent check-ins and reported violations.</p>
                </div>
            </div>
        </div>
    );
}
