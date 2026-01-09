import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Plus, Calendar, Trash2, Users, Map, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ManageExams() {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        courseCode: '',
        examName: '',
        startTime: '',
        durationMinutes: 60,
        roomId: 1 // hardcoded for demo as we don't have room fetch logic yet
    });

    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        fetchExams();
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await axios.get('/api/rooms');
            setRooms(res.data);
            if (res.data.length > 0) {
                setFormData(prev => ({ ...prev, roomId: res.data[0].RoomID }));
            }
        } catch (err) {
            console.error("Failed to fetch rooms");
        }
    };

    const fetchExams = async () => {
        const res = await axios.get('/api/exams');
        setExams(res.data);
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                roomId: formData.roomId || (rooms.length > 0 ? rooms[0].RoomID : 1)
            };
            await axios.post('/api/exams', payload);
            setShowForm(false);
            fetchExams();
            setFormData({
                courseCode: '',
                examName: '',
                startTime: '',
                durationMinutes: 60,
                roomId: rooms.length > 0 ? rooms[0].RoomID : 1
            });
        } catch (err) {
            alert('Error creating exam');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Roster Management Modal State
    const [selectedExam, setSelectedExam] = useState(null);
    const [rosterModalOpen, setRosterModalOpen] = useState(false);
    const [allStudents, setAllStudents] = useState([]);
    const [rosterForm, setRosterForm] = useState({ studentId: '', seat: '' });
    const [isRosterSubmitting, setIsRosterSubmitting] = useState(false);

    // New Roster State
    const [rosterList, setRosterList] = useState([]);
    const [rosterView, setRosterView] = useState('list'); // 'list', 'chart', 'add'

    // Fetch all students when checking roster
    const openRosterModal = (exam) => {
        setSelectedExam(exam);
        setRosterModalOpen(true);
        setRosterView('list');
        fetchRoster(exam.ExamID);
        axios.get('/api/students').then(res => setAllStudents(res.data));
    };

    const fetchRoster = async (examId) => {
        try {
            const res = await axios.get(`/api/exams/${examId}/roster`);
            setRosterList(res.data);
        } catch (err) {
            console.error("Failed to fetch roster");
        }
    };

    const handleRemoveFromRoster = async (studentId) => {
        if (!confirm("Are you sure you want to remove this student from the exam?")) return;
        try {
            await axios.delete(`/api/exams/${selectedExam.ExamID}/roster/${studentId}`);
            fetchRoster(selectedExam.ExamID); // Refresh list
        } catch (err) {
            alert("Failed to remove student");
        }
    };

    const handleAddToRoster = async (e) => {
        e.preventDefault();
        if (isRosterSubmitting) return;

        setIsRosterSubmitting(true);
        try {
            await axios.post(`/api/exams/${selectedExam.ExamID}/roster`, rosterForm);
            alert("Student added to exam roster!");
            setRosterForm({ studentId: '', seat: '' });
            fetchRoster(selectedExam.ExamID); // Refresh list
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add student");
        } finally {
            setIsRosterSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6">
                <ArrowLeft size={18} /> Back to Dashboard
            </button>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Calendar className="text-blue-500" /> Manage Exams
                </h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={18} /> Create Exam
                </button>
            </div>

            {/* Create Exam Form (Existing) */}
            {showForm && (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-8 animate-in slide-in-from-top-4">
                    <h2 className="text-xl font-bold mb-4">Create New Exam</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            placeholder="Course Code (e.g., CS101)"
                            className="bg-slate-800 p-2 rounded border border-slate-700"
                            value={formData.courseCode}
                            onChange={e => setFormData({ ...formData, courseCode: e.target.value })}
                            required
                        />
                        <input
                            placeholder="Exam Name"
                            className="bg-slate-800 p-2 rounded border border-slate-700"
                            value={formData.examName}
                            onChange={e => setFormData({ ...formData, examName: e.target.value })}
                            required
                        />
                        <input
                            type="datetime-local"
                            className="bg-slate-800 p-2 rounded text-slate-400 border border-slate-700"
                            value={formData.startTime}
                            onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Duration (Minutes)"
                            className="bg-slate-800 p-2 rounded border border-slate-700"
                            value={formData.durationMinutes}
                            onChange={e => setFormData({ ...formData, durationMinutes: e.target.value })}
                            required
                        />
                        <div className="col-span-2 md:col-span-1">
                            <select
                                className="w-full bg-slate-800 p-2 rounded border border-slate-700 text-slate-300"
                                value={formData.roomId}
                                onChange={e => setFormData({ ...formData, roomId: e.target.value })}
                                required
                            >
                                {rooms.map(room => (
                                    <option key={room.RoomID} value={room.RoomID}>
                                        {room.RoomName} (Cap: {room.Capacity})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <button type="submit" disabled={isSubmitting} className={`bg-green-600 text-white px-6 py-2 rounded font-bold w-full ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-500'}`}>
                                {isSubmitting ? 'Saving...' : 'Save Exam'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {rosterModalOpen && selectedExam && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold">Manage Roster: <span className="text-blue-400">{selectedExam.CourseCode}</span></h2>
                                <p className="text-sm text-slate-500">Room: {selectedExam.RoomName} | Capacity: {selectedExam.Capacity}</p>
                            </div>
                            <button onClick={() => setRosterModalOpen(false)} className="text-slate-400 hover:text-white">Close</button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-800">
                            {[
                                { id: 'list', label: 'Student List', icon: Users },
                                { id: 'chart', label: 'Seat Map', icon: Map },
                                { id: 'add', label: 'Add Student', icon: UserPlus }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setRosterView(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${rosterView === tab.id ? 'border-blue-500 text-blue-400 bg-slate-800/50' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                                >
                                    <tab.icon size={16} /> {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {/* LIST VIEW */}
                            {rosterView === 'list' && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-lg">Enrolled Students ({rosterList.length})</h3>
                                    </div>
                                    <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                                                <tr>
                                                    <th className="p-3">Seat</th>
                                                    <th className="p-3">University ID</th>
                                                    <th className="p-3">Name</th>
                                                    <th className="p-3">Status</th>
                                                    <th className="p-3 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-700">
                                                {rosterList.length === 0 ? (
                                                    <tr><td colSpan="5" className="p-8 text-center text-slate-500">No students enrolled yet.</td></tr>
                                                ) : rosterList.map(student => (
                                                    <tr key={student.RosterID} className="hover:bg-slate-700/50">
                                                        <td className="p-3 font-mono text-blue-300 font-bold">{student.AssignedSeat}</td>
                                                        <td className="p-3 text-slate-300">{student.UniversityID}</td>
                                                        <td className="p-3 font-medium">{student.FullName}</td>
                                                        <td className="p-3">
                                                            <span className={`px-2 py-1 rounded text-xs ${student.Status === 'Present' ? 'bg-green-900 text-green-300' :
                                                                    student.Status === 'Scheduled' ? 'bg-blue-900 text-blue-300' : 'bg-red-900 text-red-300'
                                                                }`}>
                                                                {student.Status}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-right">
                                                            <button
                                                                onClick={() => handleRemoveFromRoster(student.StudentID)}
                                                                className="text-red-400 hover:text-red-300 p-1 hover:bg-red-900/30 rounded"
                                                                title="Remove from Roster"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* CHART VIEW */}
                            {rosterView === 'chart' && (
                                <div className="flex flex-col items-center">
                                    <div className="mb-4 flex gap-4 text-sm">
                                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-700 border border-slate-600"></div> Empty</div>
                                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-900 border border-blue-500"></div> Scheduled</div>
                                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-900 border border-green-500"></div> Present</div>
                                    </div>

                                    <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 shadow-inner overflow-auto max-w-full">
                                        <div className="w-full h-8 bg-slate-800 mb-8 rounded text-center text-slate-500 text-xs flex items-center justify-center tracking-widest uppercase border border-slate-700">
                                            Chalkboard / Screen
                                        </div>

                                        {(() => {
                                            try {
                                                const layout = JSON.parse(selectedExam.LayoutConfig);
                                                const rows = layout.rows;
                                                const cols = layout.cols;

                                                // Create Map for instant lookup
                                                const seatMap = {};
                                                rosterList.forEach(s => seatMap[s.AssignedSeat] = s);

                                                return (
                                                    <div
                                                        className="grid gap-3"
                                                        style={{
                                                            gridTemplateColumns: `repeat(${cols}, minmax(40px, 1fr))`
                                                        }}
                                                    >
                                                        {Array.from({ length: rows * cols }).map((_, i) => {
                                                            const r = Math.floor(i / cols) + 1;
                                                            const c = (i % cols) + 1;
                                                            const seatLabel = `${String.fromCharCode(64 + r)}${c}`;
                                                            const student = seatMap[seatLabel];

                                                            return (
                                                                <div
                                                                    key={seatLabel}
                                                                    className={`
                                                                        aspect-square rounded flex flex-col items-center justify-center text-xs relative group border
                                                                        ${student
                                                                            ? (student.Status === 'Present' ? 'bg-green-900/50 border-green-500/50 text-green-100' : 'bg-blue-900/50 border-blue-500/50 text-blue-100')
                                                                            : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:border-slate-500'
                                                                        }
                                                                    `}
                                                                    title={student ? `${student.FullName} (${student.UniversityID})` : `Seat ${seatLabel} - Empty`}
                                                                >
                                                                    <span className="font-bold opacity-50">{seatLabel}</span>
                                                                    {student && <Users size={12} className="mt-1" />}

                                                                    {/* Tooltip */}
                                                                    {student && (
                                                                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-950 text-white text-xs p-2 rounded border border-slate-700 whitespace-nowrap z-10 shadow-xl">
                                                                            <p className="font-bold">{student.FullName}</p>
                                                                            <p className="text-slate-400">{student.UniversityID}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            } catch (e) {
                                                return <div className="text-red-500">Error parsing room layout configuration.</div>;
                                            }
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* ADD VIEW */}
                            {rosterView === 'add' && (
                                <div className="max-w-md mx-auto py-8">
                                    <h3 className="text-lg font-bold mb-4">Add Student Manually</h3>
                                    <form onSubmit={handleAddToRoster} className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Select Student</label>
                                            <select
                                                className="w-full bg-slate-800 p-2 rounded border border-slate-600"
                                                value={rosterForm.studentId}
                                                onChange={e => setRosterForm({ ...rosterForm, studentId: e.target.value })}
                                                required
                                            >
                                                <option value="">Choose Student...</option>
                                                {allStudents.map(s => <option key={s.StudentID} value={s.StudentID}>{s.FullName} ({s.UniversityID})</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Assign Seat</label>
                                            <input
                                                placeholder="e.g. A1, B5"
                                                className="w-full bg-slate-800 p-2 rounded border border-slate-600"
                                                value={rosterForm.seat}
                                                onChange={e => setRosterForm({ ...rosterForm, seat: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <button type="submit" disabled={isRosterSubmitting} className={`w-full bg-purple-600 py-2 rounded font-bold mt-4 ${isRosterSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-500'}`}>
                                            {isRosterSubmitting ? 'Adding...' : 'Add to Roster'}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exams.map(exam => (
                    <div key={exam.ExamID} className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-blue-500/30 transition-all flex flex-col justify-between h-48">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-white">{exam.CourseCode}</h3>
                                <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">{exam.RoomName}</span>
                            </div>
                            <p className="font-medium text-slate-300 mb-1">{exam.ExamName}</p>
                            <p className="text-sm text-slate-500">{new Date(exam.StartTime).toLocaleString()}</p>
                        </div>
                        <button
                            onClick={() => openRosterModal(exam)}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-blue-400 py-2 rounded mt-4 text-sm font-semibold border border-slate-700"
                        >
                            Manage Roster
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
