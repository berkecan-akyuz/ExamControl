import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Layout, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ManageRooms() {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        const res = await axios.get('/api/rooms');
        setRooms(res.data);
    };

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ roomName: '', rows: 5, cols: 6 });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingRoomId, setDeletingRoomId] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            await axios.post('/api/rooms', formData);
            setShowForm(false);
            setFormData({ roomName: '', rows: 5, cols: 6 });
            fetchRooms();
        } catch (err) {
            alert("Failed to create room");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6">
                <ArrowLeft size={18} /> Back to Dashboard
            </button>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Layout className="text-green-500" /> Room Layouts
                </h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Layout size={18} /> Add Room
                </button>
            </div>

            {showForm && (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-8 animate-in slide-in-from-top-4">
                    <h2 className="text-xl font-bold mb-4">Create New Room</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-2">
                            <label className="block text-sm text-slate-400 mb-1">Room Name</label>
                            <input
                                className="bg-slate-800 p-2 rounded w-full border border-slate-700"
                                value={formData.roomName}
                                onChange={e => setFormData({ ...formData, roomName: e.target.value })}
                                required
                                placeholder="e.g. Exam Hall A"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Rows</label>
                            <input
                                type="number"
                                className="bg-slate-800 p-2 rounded w-full border border-slate-700"
                                value={formData.rows}
                                onChange={e => setFormData({ ...formData, rows: e.target.value })}
                                required
                                min="1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Columns</label>
                            <input
                                type="number"
                                className="bg-slate-800 p-2 rounded w-full border border-slate-700"
                                value={formData.cols}
                                onChange={e => setFormData({ ...formData, cols: e.target.value })}
                                required
                                min="1"
                            />
                        </div>
                        <div className="md:col-span-4 flex justify-between items-center bg-slate-950 p-3 rounded border border-slate-800 mt-2">
                            <span className="text-slate-400">Total Capacity: <strong className="text-white">{formData.rows * formData.cols} Seats</strong></span>
                            <button type="submit" disabled={isSubmitting} className={`bg-green-600 text-white px-6 py-2 rounded font-bold flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-500'}`}>
                                {isSubmitting ? 'Saving...' : 'Save Room'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map(room => {
                    let layout = { rows: 0, cols: 0 };
                    try { layout = JSON.parse(room.LayoutConfig); } catch (e) { }

                    return (
                        <div key={room.RoomID} className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative group">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold">{room.RoomName}</h3>
                                <button
                                    onClick={async () => {
                                        if (!window.confirm(`Are you sure you want to delete room "${room.RoomName}"? This action cannot be undone.`)) return;
                                        setDeletingRoomId(room.RoomID);
                                        try {
                                            await axios.delete(`/api/rooms/${room.RoomID}`);
                                            fetchRooms();
                                        } catch (e) {
                                            alert(e.response?.data?.message || 'Failed to delete room');
                                        } finally {
                                            setDeletingRoomId(null);
                                        }
                                    }}
                                    className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Delete Room"
                                    disabled={deletingRoomId === room.RoomID}
                                >
                                    {deletingRoomId === room.RoomID ? (
                                        <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                    )}
                                </button>
                            </div>
                            <p className="text-slate-400 mb-4">Capacity: {room.Capacity}</p>

                            <div className="bg-slate-950 p-4 rounded border border-slate-800 flex flex-col gap-2 items-center">
                                <span className="text-xs text-slate-500 mb-1">Layout Preview ({layout.rows}x{layout.cols})</span>
                                <div className="w-full overflow-x-auto">
                                    <div className="grid gap-1" style={{
                                        gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
                                        minWidth: `${layout.cols * 16}px`
                                    }}>
                                        {[...Array(layout.rows * layout.cols)].map((_, i) => (
                                            <div key={i} className="aspect-square bg-slate-700 rounded-sm hover:bg-slate-600 transition-colors" title={`Seat ${Math.floor(i / layout.cols) + 1}-${(i % layout.cols) + 1}`}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
