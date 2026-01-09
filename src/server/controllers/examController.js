const { sql } = require('../db');

exports.getExams = async (req, res) => {
    console.log("DEBUG: getExams called");
    console.log("DEBUG: SQL Object defined?", !!sql);
    console.log("DEBUG: SQL Connected?", sql && sql.connected); // Check connection state

    try {
        // Fetch exams that are scheduled for today or active
        // For prototype, just fetch all
        console.log("DEBUG: Running Query...");
        const result = await sql.query`
            SELECT e.ExamID, e.ExamName, e.CourseCode, e.StartTime, r.RoomName, r.LayoutConfig, r.Capacity
            FROM Exams e
            JOIN Rooms r ON e.RoomID = r.RoomID
        `;
        console.log("DEBUG: Query Success, rows:", result.recordset.length);
        res.json(result.recordset);
    } catch (err) {
        console.error("DEBUG: getExams FAILED:", err); // Critical Log
        res.status(500).json({ message: 'Server error', error: err.toString() });
    }
};

exports.getExamDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`
            SELECT e.*, r.RoomName, r.LayoutConfig 
            FROM Exams e
            JOIN Rooms r ON e.RoomID = r.RoomID
            WHERE e.ExamID = ${id}
        `;
        if (result.recordset.length === 0) return res.status(404).json({ message: 'Exam not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createExam = async (req, res) => {
    const { courseCode, examName, startTime, durationMinutes, roomId } = req.body;
    console.log('Creating Exam:', { courseCode, examName, startTime, durationMinutes, roomId });

    try {
        const start = new Date(startTime);
        if (isNaN(start.getTime())) {
            return res.status(400).json({ message: 'Invalid start time format' });
        }

        await sql.query`
            INSERT INTO Exams (CourseCode, ExamName, StartTime, DurationMinutes, RoomID, CreatedBy)
            VALUES (${courseCode}, ${examName}, ${start}, ${durationMinutes}, ${roomId}, 1) 
        `;
        // Hardcoded creator ID for now
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addToRoster = async (req, res) => {
    const { examId } = req.params;
    const { studentId, seat } = req.body;
    try {
        // Validation: Seat Usage
        const existing = await sql.query`SELECT * FROM ExamRoster WHERE ExamID = ${examId} AND AssignedSeat = ${seat}`;
        if (existing.recordset.length > 0) {
            return res.status(400).json({ message: 'Seat already assigned' });
        }

        await sql.query`
            INSERT INTO ExamRoster (ExamID, StudentID, AssignedSeat, Status)
            VALUES (${examId}, ${studentId}, ${seat}, 'Scheduled')
        `;
        res.json({ success: true, message: 'Student added to roster' });
    } catch (err) {
        if (err.number === 2627) { // duplicate key error
            return res.status(400).json({ message: 'Student already in exam' });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getExamRoster = async (req, res) => {
    const { examId } = req.params;
    try {
        // 1. Check if exam is over and update 'Scheduled' to 'Absent'
        // We get the exam start time and duration
        const examCheck = await sql.query`
            SELECT StartTime, DurationMinutes 
            FROM Exams 
            WHERE ExamID = ${examId}
        `;

        if (examCheck.recordset.length > 0) {
            const { StartTime, DurationMinutes } = examCheck.recordset[0];
            const endTime = new Date(new Date(StartTime).getTime() + DurationMinutes * 60000);
            const now = new Date();

            if (now > endTime) {
                // Exam is over. Mark anyone still 'Scheduled' as 'Absent'
                await sql.query`
                    UPDATE ExamRoster
                    SET Status = 'Absent'
                    WHERE ExamID = ${examId} AND Status = 'Scheduled'
                `;
            }
        }

        // 2. Fetch Roster
        const result = await sql.query`
            SELECT er.RosterID, er.AssignedSeat, er.Status, s.StudentID, s.FullName, s.UniversityID, s.ReferencePhotoUrl
            FROM ExamRoster er
            JOIN Students s ON er.StudentID = s.StudentID
            WHERE er.ExamID = ${examId}
            ORDER BY er.AssignedSeat
        `;
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.removeFromRoster = async (req, res) => {
    const { examId, studentId } = req.params;
    try {
        await sql.query`
            DELETE FROM ExamRoster WHERE ExamID = ${examId} AND StudentID = ${studentId}
        `;
        res.json({ success: true, message: 'Student removed from roster' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
