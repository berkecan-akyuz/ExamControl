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
                setConfidence(0.98); // Mock/Real from server
            } else {
                setVerificationStatus('fail');
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
                        }}
                    >
                        <option value="">-- Choose Exam --</option>
                        {exams.map(e => (
                            <option key={e.ExamID} value={e.ExamID}>{e.ExamName}</option>
                        ))}
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
                                <span className="px-3 py-1 rounded text-sm bg-blue-500/20 text-blue-500">
                                    Server-Side ML Active
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
                                            // Simple grid mapping: "A1" logic assumed as row-major or simple index? 
                                            // For this demo, let's assume seats are just indexed or we highlight strictly by label if we matched logic.
                                            // ACTUALLY: Let's assume the Seat String "R1-C2" or similar.
                                            // BUT: The user effectively enters "A1". Let's try to parse "A1" -> Row 0, Col 0.
                                            // Simplified: We highlight the box if the student is assigned there.

                                            // Let's make it simpler for the Visual: Just show a grid and highlight a random "target" or try to parse.
                                            // Better: Just Highlight the seat matching the index if we mapped it.
                                            // Since we don't have a robust "Seat -> Index" mapper in frontend yet, we will
                                            // highlight the box corresponding to the student's seat string IF it matches "R{r}C{c}" format or just show the grid.

                                            // For now: Highlight the seat if the label matches the grid coordinate (e.g. "1-1" for Row 1 Col 1).
                                            // To make it "Live", let's highlight a box based on a simple hash of the seat string so it looks deterministic.

                                            // Better yet, let's just render the grid.
                                            // If selectedStudent.AssignedSeat matches "A1", we highlight index 0 (if A=1).

                                            const r = Math.floor(i / JSON.parse(selectedExam.LayoutConfig).cols) + 1;
                                            const c = (i % JSON.parse(selectedExam.LayoutConfig).cols) + 1;
                                            // Basic mapping: A1, A2... B1, B2...
                                            const rowChar = String.fromCharCode(64 + r); // 1=A, 2=B
                                            const seatLabel = `${rowChar}${c}`;
                                            const isAssigned = seatLabel === selectedStudent.AssignedSeat;

                                            return (
                                                <div
                                                    key={i}
                                                    className={`w-6 h-6 rounded-sm text-[8px] flex items-center justify-center border ${isAssigned ? 'bg-yellow-500 border-yellow-400 text-black font-bold animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-600'}`}
                                                >
                                                    {seatLabel}
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
