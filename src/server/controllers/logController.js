const { sql } = require('../db');

exports.getLogs = async (req, res) => {
    try {
        const checkIns = await sql.query`
            SELECT 
                cl.LogID, 
                cl.Timestamp, 
                cl.IsMatch, 
                cl.MLConfidenceScore, 
                s.FullName as StudentName, 
                e.ExamName,
                'Check-in' as Type
            FROM CheckInLogs cl
            JOIN ExamRoster er ON cl.RosterID = er.RosterID
            JOIN Students s ON er.StudentID = s.StudentID
            JOIN Exams e ON er.ExamID = e.ExamID
            ORDER BY cl.Timestamp DESC
        `;

        const violations = await sql.query`
             SELECT 
                v.ViolationID as LogID, 
                v.ReportedAt as Timestamp, 
                0 as IsMatch, 
                0 as MLConfidenceScore,
                s.FullName as StudentName, 
                e.ExamName,
                'Violation' as Type,
                v.Reason,
                v.Notes
            FROM Violations v
            JOIN Students s ON v.StudentID = s.StudentID
            JOIN Exams e ON v.ExamID = e.ExamID
            ORDER BY v.ReportedAt DESC
        `;

        // Combine and sort
        const combined = [...checkIns.recordset, ...violations.recordset].sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));

        res.json(combined);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createViolation = async (req, res) => {
    const { examId, studentId, reason, notes } = req.body;
    try {
        await sql.query`
            INSERT INTO Violations (ExamID, StudentID, Reason, Notes, ReportedBy)
            VALUES (${examId}, ${studentId}, ${reason}, ${notes}, 1)
        `;
        // Note: ReportedBy hardcoded to 1 for demo (Admin/Proctor)
        res.json({ success: true, message: 'Violation reported' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
