const express = require('express');
const router = express.Router();
const { getExams, getExamDetails, createExam, addToRoster, getExamRoster, removeFromRoster } = require('../controllers/examController');
const { getStudentAndSeat, submitCheckIn, getStudents, createStudent, deleteStudent, getStudentPhotos } = require('../controllers/studentController');
const { getLogs, createViolation } = require('../controllers/logController');
const { getRooms, createRoom, deleteRoom, getRoomSeats } = require('../controllers/roomController');

// Exam Routes
router.get('/exams', getExams);
router.post('/exams', createExam);
router.get('/exams/:id', getExamDetails);

// Room Routes
router.get('/rooms', getRooms);
router.post('/rooms', createRoom);
router.get('/rooms/:id/seats', getRoomSeats);
router.delete('/rooms/:id', deleteRoom);

// Student/Check-in Routes
const upload = require('../middleware/upload');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Check-in Routes
const { verifyCheckIn } = require('../controllers/checkInController');

router.get('/students', getStudents);
router.post('/students', upload.array('photos', 5), createStudent);
router.delete('/students/:id', deleteStudent);
router.get('/students/:studentId/photos', getStudentPhotos);
router.get('/roster/search', getStudentAndSeat);

// Old client-side check-in (deprecate?)
router.post('/checkin', submitCheckIn);
// New Secure Server-Side Check-int
router.post('/checkin/verify', upload.single('image'), verifyCheckIn);

// Log Routes
router.get('/logs', getLogs);
router.post('/violations', createViolation);

// Exam Roster
router.get('/exams/:examId/roster', getExamRoster);
router.post('/exams/:examId/roster', addToRoster);
router.delete('/exams/:examId/roster/:studentId', removeFromRoster);

module.exports = router;
