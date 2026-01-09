import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ArrowLeft, Users, Search, Plus, UserPlus, Camera, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';

export default function ManageRoster() {
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [useWebcam, setUseWebcam] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        universityId: '',
        email: '',
        referencePhotos: [] // Changed from single string to array
    });

    const capture = React.useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setFormData(prev => ({
            ...prev,
            referencePhotos: [...prev.referencePhotos, imageSrc]
        }));
    }, [webcamRef]);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        const res = await axios.get('/api/students');
        setStudents(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.referencePhotos.length === 0) {
                alert("Please capture at least one photo.");
                return;
            }

            const data = new FormData();
            data.append('fullName', formData.fullName);
            data.append('universityId', formData.universityId);
            data.append('email', formData.email);

            // Convert Base64 images to Blobs
            for (let i = 0; i < formData.referencePhotos.length; i++) {
                const base64Data = formData.referencePhotos[i];
                const res = await fetch(base64Data);
                const blob = await res.blob();
                data.append('photos', blob, `photo_${i}.jpg`);
            }

            await axios.post('/api/students', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShowForm(false);
            setFormData({ fullName: '', universityId: '', email: '', referencePhotos: [] });
            fetchStudents();
        } catch (err) {
            console.error(err);
            alert("Failed to create student");
        }
    };

    const removePhoto = (index) => {
        setFormData(prev => ({
            ...prev,
            referencePhotos: prev.referencePhotos.filter((_, i) => i !== index)
        }));
    };

    const filteredStudents = students.filter(s =>
        s.FullName.toLowerCase().includes(search.toLowerCase()) ||
        s.UniversityID.includes(search)
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6">
                <ArrowLeft size={18} /> Back to Dashboard
            </button>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Users className="text-purple-500" /> Student Roster
                </h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={18} /> Add Student
                </button>
            </div>

            {showForm && (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-8 animate-in slide-in-from-top-4">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <UserPlus size={20} className="text-purple-400" /> Register New Student
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            placeholder="Full Name"
                            className="bg-slate-800 p-2 rounded"
                            value={formData.fullName}
                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            required
                        />
                        <input
                            placeholder="University ID"
                            className="bg-slate-800 p-2 rounded"
                            value={formData.universityId}
                            onChange={e => setFormData({ ...formData, universityId: e.target.value })}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="bg-slate-800 p-2 rounded"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />

                        <div className="md:col-span-2 bg-slate-800 p-4 rounded-lg border border-slate-700">
                            <label className="block text-sm text-slate-400 mb-2">Reference Photos (Capture 3-5 angles)</label>
                            <div className="flex gap-4 mb-4">
                                <button type="button" onClick={() => setUseWebcam(true)} className={`px-4 py-2 rounded ${useWebcam ? 'bg-blue-600 text-white' : 'bg-slate-700'}`}>Use Webcam</button>
                            </div>

                            {useWebcam && (
                                <div className="flex flex-col items-center gap-4 mb-6">
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        className="w-64 h-48 object-cover rounded border border-slate-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={capture}
                                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2"
                                    >
                                        <Camera size={18} /> Capture Photo
                                    </button>
                                </div>
                            )}

                            {/* Gallery */}
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {formData.referencePhotos.length === 0 && <span className="text-slate-500 italic">No photos captured yet.</span>}
                                {formData.referencePhotos.map((photo, i) => (
                                    <div key={i} className="relative shrink-0">
                                        <img src={photo} className="w-24 h-24 object-cover rounded border border-slate-600" />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(i)}
                                            className="absolute -top-1 -right-1 bg-red-600 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <button type="submit" className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded w-full font-bold">
                                Save Student
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 text-slate-500" size={18} />
                    <input
                        className="bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 w-full text-white"
                        placeholder="Search by Name or ID..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredStudents.map(student => (
                    <div key={student.StudentID} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:border-purple-500/30 transition-all group">
                        <div className="flex items-center gap-4">
                            <img
                                src={student.ReferencePhotoUrl || 'https://via.placeholder.com/150'}
                                className="w-16 h-16 rounded-full object-cover border-2 border-slate-700"
                                onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                            />
                            <div>
                                <h3 className="font-bold">{student.FullName}</h3>
                                <p className="text-sm text-slate-400">{student.UniversityID}</p>
                                <span className="text-xs text-slate-500">{student.Email}</span>
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                if (confirm(`Delete student ${student.FullName}? This will remove them from all exams.`)) {
                                    try {
                                        await axios.delete(`/api/students/${student.StudentID}`);
                                        fetchStudents();
                                    } catch (e) {
                                        alert("Failed to delete student.");
                                    }
                                }
                            }}
                            className="bg-slate-800 p-2 rounded text-slate-500 hover:text-red-500 hover:bg-slate-700 transition-colors"
                            title="Delete Student"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
