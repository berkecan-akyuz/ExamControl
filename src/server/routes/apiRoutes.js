const express = require('express');
const router = express.Router();
const { getExams, getExamDetails, createExam, addToRoster, getExamRoster, removeFromRoster } = require('../controllers/examController');
const { getStudentAndSeat, submitCheckIn, getStudents, createStudent, deleteStudent, getStudentPhotos } = require('../controllers/studentController');
const { getLogs, createViolation } = require('../controllers/logController');
const { getRooms, createRoom, deleteRoom } = require('../controllers/roomController');

// Exam Routes
router.get('/exams', getExams);
router.post('/exams', createExam);
router.get('/exams/:id', getExamDetails);

// Room Routes
router.get('/rooms', getRooms);
router.post('/rooms', createRoom);
router.delete('/rooms/:id', deleteRoom);

// Student/Check-in Routes
router.get('/students', getStudents);
router.post('/students', createStudent);
router.delete('/students/:id', deleteStudent);
router.get('/students/:studentId/photos', getStudentPhotos);
router.get('/roster/search', getStudentAndSeat);
router.post('/checkin', submitCheckIn);

// Log Routes
router.get('/logs', getLogs);
router.post('/violations', createViolation);

// Exam Roster
router.get('/exams/:examId/roster', getExamRoster);
router.post('/exams/:examId/roster', addToRoster);
router.delete('/exams/:examId/roster/:studentId', removeFromRoster);

module.exports = router;
