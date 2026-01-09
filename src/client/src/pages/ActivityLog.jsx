import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ActivityLog() {
    const [logs, setLogs] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await axios.get('/api/logs');
                setLogs(res.data);
            } catch (err) {
                console.error("Failed to fetch logs", err);
            }
        };
        fetchLogs();
    }, []);

    const [showReportForm, setShowReportForm] = useState(false);
    const [exams, setExams] = useState([]);
    const [roster, setRoster] = useState([]);
    const [reportData, setReportData] = useState({ examId: '', studentId: '', reason: '', notes: '' });

    // Fetch exams for dropdown
    useEffect(() => {
        axios.get('/api/exams').then(res => setExams(res.data));
    }, []);

    // Fetch all students for dropdown
    useEffect(() => {
        axios.get('/api/students').then(res => setRoster(res.data));
    }, []);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            await axios.post('/api/violations', reportData);
            setShowReportForm(false);
            setReportData({ examId: '', studentId: '', reason: '', notes: '' });
            // Refresh logs
            const res = await axios.get('/api/logs');
            setLogs(res.data);
            alert("Violation reported successfully");
        } catch (err) {
            alert("Failed to report violation");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString();
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <button onClick={() => navigate('/proctor')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6">
                <ArrowLeft size={18} /> Back to Dashboard
            </button>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Clock className="text-orange-500" /> Activity Log
                </h1>
                <button
                    onClick={() => setShowReportForm(true)}
                    className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <AlertTriangle size={18} /> Report Incident
                </button>
            </div>

            {showReportForm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4 text-orange-400">Report Violation</h2>
                        <form onSubmit={handleReportSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Exam Event</label>
                                <select
                                    className="w-full bg-slate-800 p-2 rounded border border-slate-600"
                                    value={reportData.examId}
                                    onChange={e => setReportData({ ...reportData, examId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Exam...</option>
                                    {exams.map(ex => <option key={ex.ExamID} value={ex.ExamID}>{ex.ExamName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Student</label>
                                <select
                                    className="w-full bg-slate-800 p-2 rounded border border-slate-600"
                                    value={reportData.studentId}
                                    onChange={e => setReportData({ ...reportData, studentId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Student...</option>
                                    {roster.map(s => <option key={s.StudentID} value={s.StudentID}>{s.FullName} ({s.UniversityID})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Violation Type / Reason</label>
                                <select
                                    className="w-full bg-slate-800 p-2 rounded border border-slate-600"
                                    value={reportData.reason}
                                    onChange={e => setReportData({ ...reportData, reason: e.target.value })}
                                    required
                                >
                                    <option value="">Select Reason...</option>
                                    <option value="Unauthorized Device">Unauthorized Device</option>
                                    <option value="Talking">Talking to others</option>
                                    <option value="Leaving Seat">Leaving Seat without permission</option>
                                    <option value="Cheat Sheet">Cheat Sheet found</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Notes</label>
                                <textarea
                                    className="w-full bg-slate-800 p-2 rounded border border-slate-600 h-24"
                                    value={reportData.notes}
                                    onChange={e => setReportData({ ...reportData, notes: e.target.value })}
                                    placeholder="Describe the incident..."
                                    required
                                />
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setShowReportForm(false)} className="flex-1 bg-slate-700 py-2 rounded hover:bg-slate-600">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className={`flex-1 bg-orange-600 py-2 rounded font-bold ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-500'}`}>
                                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-950 text-slate-400">
                        <tr>
                            <th className="p-4">Time</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Student</th>
                            <th className="p-4">Exam</th>
                            <th className="p-4">Details</th>
                            <th className="p-4">Result</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {logs.map(log => (
                            <tr key={`${log.Type}-${log.LogID}`} className="hover:bg-slate-800/50">
                                <td className="p-4 text-slate-300">{formatDate(log.Timestamp)}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${log.Type === 'Violation' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                        {log.Type.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4 font-semibold">{log.StudentName}</td>
                                <td className="p-4 text-slate-400">{log.ExamName}</td>
                                <td className="p-4">
                                    {log.Type === 'Violation' ? (
                                        <div className="text-sm">
                                            <span className="text-red-400 font-bold">{log.Reason}</span>
                                            <p className="text-slate-500">{log.Notes}</p>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-slate-500">
                                            Routine Check-in
                                        </div>
                                    )}
                                </td>
                                <td className="p-4">
                                    {log.Type === 'Check-in' && (
                                        log.IsMatch ?
                                            <div className="flex items-center gap-1 text-green-500"><CheckCircle size={16} /> Match ({(log.MLConfidenceScore * 100).toFixed(0)}%)</div> :
                                            <div className="flex items-center gap-1 text-red-500"><XCircle size={16} /> Mismatch</div>
                                    )}
                                    {log.Type === 'Violation' && (
                                        <div className="flex items-center gap-1 text-orange-500"><AlertTriangle size={16} /> Reported</div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && <div className="p-8 text-center text-slate-500">No activity recorded yet.</div>}
            </div>
        </div>
    );
}
