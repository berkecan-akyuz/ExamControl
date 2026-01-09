import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
// faceapi.nets.tinyFaceDetector.loadFromUri('/models'); // We need to load this specifically if using TinyFaceDetectorOptions
import axios from 'axios';
import { Camera, CheckCircle, XCircle, Search, UserCheck } from 'lucide-react';

export default function CheckIn() {
    const [exams, setExams] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState('');
    const [selectedExam, setSelectedExam] = useState(null); // Full object for layout
    const [searchQuery, setSearchQuery] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState('idle'); // idle, processing, success, fail
    const [confidence, setConfidence] = useState(0);

    const webcamRef = useRef(null);

    // Load Models
    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        const res = await axios.get('/api/exams');
        setExams(res.data);
    };

    const handleSearch = async () => {
        if (!selectedExamId) return alert("Select an exam first");
        const res = await axios.get(`/api/roster/search?examId=${selectedExamId}&studentIdentifier=${searchQuery}`);
        setStudents(res.data);
    };

    const verify = async () => {
        if (!selectedStudent || !webcamRef.current) return;
        setVerificationStatus('processing');

        try {
            const screenshot = webcamRef.current.getScreenshot();

            // Convert to Blob for upload
            const res = await fetch(screenshot);
            const blob = await res.blob();

            const formData = new FormData();
            formData.append('image', blob, 'capture.jpg');
            formData.append('rosterId', selectedStudent.RosterID);

            const apiRes = await axios.post('/api/checkin/verify', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (apiRes.data.success && apiRes.data.isMatch) {
                setVerificationStatus('success');
                setConfidence(apiRes.data.score || 0.99);
            } else {
                setVerificationStatus('fail');
                setConfidence(apiRes.data.score || 0);
            }

        } catch (err) {
            console.error(err);
            setVerificationStatus('fail');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 flex gap-4">
            {/* Left Panel: Selection */}
            <div className="w-1/3 bg-slate-900 p-4 rounded-xl border border-slate-800">
                <h2 className="text-xl font-bold mb-4">Check-in Control</h2>

                <div className="mb-4">
                    <label className="block text-sm text-slate-400 mb-2">Select Exam</label>
                    <select
                        className="w-full bg-slate-800 p-2 rounded"
                        value={selectedExamId}
                        onChange={(e) => {
                            const id = e.target.value;
                            setSelectedExamId(id);
                            setSelectedExam(exams.find(ex => ex.ExamID.toString() === id));
                            // Auto-fetch all students when exam is selected
                            if (id) {
                                axios.get(`/api/roster/search?examId=${id}`).then(res => setStudents(res.data));
                            } else {
                                setStudents([]);
                            }
                        }}
                    >
                        <option value="">-- Choose Exam --</option>
                        {/* Deduplicate and Sort */}
                        {(() => {
                            // 1. Deduplicate by unique Label
                            const uniqueMap = new Map();
                            exams.forEach(item => {
                                const d = new Date(item.StartTime);
                                const label = `[${item.CourseCode}] ${item.ExamName} (${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
                                uniqueMap.set(label, item);
                            });

                            // 2. Sort by Time
                            const sorted = Array.from(uniqueMap.values()).sort((a, b) => new Date(a.StartTime) - new Date(b.StartTime));

                            return sorted.map(e => {
                                const d = new Date(e.StartTime);
                                const label = `[${e.CourseCode}] ${e.ExamName} (${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
                                return <option key={e.ExamID} value={e.ExamID}>{label}</option>;
                            });
                        })()}
                    </select>
                </div>

                <div className="flex gap-2 mb-4">
                    <input
                        className="bg-slate-800 p-2 rounded flex-1"
                        placeholder="Student ID or Name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button onClick={handleSearch} className="bg-blue-600 p-2 rounded"><Search /></button>
                </div>

                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                    {students.map(s => (
                        <div
                            key={s.StudentID}
                            onClick={() => { setSelectedStudent(s); setVerificationStatus('idle'); }}
                            className={`p-3 rounded cursor-pointer border ${selectedStudent?.StudentID === s.StudentID ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-800'}`}
                        >
                            <div className="font-bold">{s.FullName}</div>
                            <div className="text-sm text-slate-400">ID: {s.UniversityID}</div>
                            <div className="text-xs mt-1">Seat: {s.AssignedSeat} | Status: {s.Status}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel: Verification */}
            <div className="w-2/3 bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col items-center">
                {!selectedStudent ? (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        Select a student to begin verification
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between w-full mb-4">
                            <div>
                                <h2 className="text-2xl font-bold">{selectedStudent.FullName}</h2>
                                <p className="text-xl text-yellow-400">Assigned Seat: {selectedStudent.AssignedSeat}</p>
                            </div>
                            <div className="text-right">
                                <span className={`px-3 py-1 rounded text-sm ${confidence === 0 ? 'bg-gray-500/20 text-gray-400' : (confidence > 0.8 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500')}`}>
                                    {/* Detect if result came from Mock or Real ML based on confidence precision or explicitly return flag */}
                                    {confidence > 0 ? `Confidence: ${(confidence * 100).toFixed(1)}%` : 'Ready'}
                                </span>
                            </div>
                        </div>

                        {/* Seat Map Visualization */}
                        {selectedExam?.LayoutConfig && (
                            <div className="mb-6 w-full bg-slate-950 p-4 rounded-xl border border-slate-800">
                                <h4 className="text-sm text-slate-400 mb-2 text-center">Seat Map Location</h4>
                                <div className="flex justify-center overflow-x-auto">
                                    <div className="grid gap-1" style={{
                                        gridTemplateColumns: `repeat(${JSON.parse(selectedExam.LayoutConfig).cols}, 24px)`
                                    }}>
                                        {[...Array(JSON.parse(selectedExam.LayoutConfig).rows * JSON.parse(selectedExam.LayoutConfig).cols)].map((_, i) => {
                                            const r = Math.floor(i / JSON.parse(selectedExam.LayoutConfig).cols);
                                            const c = (i % JSON.parse(selectedExam.LayoutConfig).cols) + 1;
                                            const rowChar = String.fromCharCode(65 + r); // 0=A, 1=B
                                            const seatLabel = `${rowChar}${c}`;

                                            // Find student in this seat
                                            const studentInSeat = students.find(s => s.AssignedSeat === seatLabel);
                                            const isSelected = selectedStudent && selectedStudent.AssignedSeat === seatLabel;

                                            return (
                                                <div
                                                    key={i}
                                                    onClick={() => {
                                                        if (studentInSeat) {
                                                            setSelectedStudent(studentInSeat);
                                                            setVerificationStatus('idle');
                                                        }
                                                    }}
                                                    title={studentInSeat ? `${seatLabel}: ${studentInSeat.FullName}` : seatLabel}
                                                    className={`
                                                        w-8 h-8 rounded-md text-[10px] flex items-center justify-center border transition-all relative
                                                        ${isSelected
                                                            ? 'bg-yellow-500 border-yellow-400 text-black font-bold ring-2 ring-yellow-500 ring-offset-2 ring-offset-slate-900 z-10 scale-110'
                                                            : (studentInSeat
                                                                ? 'bg-blue-900/40 border-blue-500/50 text-blue-200 cursor-pointer hover:bg-blue-800 hover:border-blue-400'
                                                                : 'bg-slate-800 border-slate-700 text-slate-600')
                                                        }
                                                    `}
                                                >
                                                    {seatLabel}
                                                    {/* Simple dot indicator for occupancy */}
                                                    {studentInSeat && !isSelected && (
                                                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="relative w-[300px] aspect-square rounded-lg overflow-hidden border-2 border-slate-700 mb-6">
                            <Webcam
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                className="w-full h-full object-cover"
                            // Removed onUserMedia prop and client-side face detection/drawing logic
                            />
                            {/* Removed overlay-canvas as client-side face-api is no longer used */}
                        </div>

                        <div className="flex gap-2 justify-center mb-6">
                            {(selectedStudent.Photos && selectedStudent.Photos.length > 0 ? selectedStudent.Photos : [selectedStudent.ReferencePhotoUrl]).map((url, i) => (
                                <div key={i} className="text-center group">
                                    <div className="relative">
                                        <img src={url} className="w-16 h-16 rounded object-cover border border-slate-600 group-hover:border-blue-400 transition-all" alt="ref" />
                                        <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-xs">Ref {i + 1}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={verify}
                            disabled={verificationStatus === 'processing'}
                            className={`bg-green-600 font-bold py-3 px-12 rounded-full shadow-lg shadow-green-600/20 transition-all transform mb-6 flex items-center gap-2 ${verificationStatus === 'processing' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-500 hover:scale-105 text-white'}`}
                        >
                            {verificationStatus === 'processing' ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <Camera /> Verify Identity
                                </>
                            )}
                        </button>

                        {verificationStatus === 'success' && (
                            <div className="animate-in fade-in zoom-in bg-green-500/20 border border-green-500 text-green-500 px-8 py-4 rounded-xl text-center w-full">
                                <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                                <h3 className="text-2xl font-bold">MATCH CONFIRMED</h3>
                                <p>Score: {(confidence * 100).toFixed(1)}%</p>
                            </div>
                        )}

                        {verificationStatus === 'fail' && (
                            <div className="animate-in fade-in zoom-in bg-red-500/20 border border-red-500 text-red-500 px-8 py-4 rounded-xl text-center w-full">
                                <XCircle className="w-12 h-12 mx-auto mb-2" />
                                <h3 className="text-2xl font-bold">VERIFICATION FAILED</h3>
                                <p>Please check manually.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div >
    );
}
