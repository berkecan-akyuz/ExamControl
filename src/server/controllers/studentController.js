const { sql } = require('../db');

exports.getStudents = async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM Students`;
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createStudent = async (req, res) => {
    const { fullName, universityId, email, referencePhotos } = req.body; // Expecting array of URLs

    const transaction = new sql.Transaction();
    try {
        await transaction.begin();

        // 1. Insert Student
        const studentResult = await transaction.request()
            .input('fullName', sql.NVarChar, fullName)
            .input('universityId', sql.NVarChar, universityId)
            .input('email', sql.NVarChar, email)
            .query(`
                INSERT INTO Students (FullName, UniversityID, Email)
                OUTPUT INSERTED.StudentID
                VALUES (@fullName, @universityId, @email)
            `);

        const studentId = studentResult.recordset[0].StudentID;

        // 2. Insert Photos
        // Note: mssql doesn't support bulk insert easily with variables in one go in the way we want without TableValuedParams or loops
        // For simplicity/demo scale, we loop. In extensive prod, use TVP.
        // 2. Insert Photos
        // Handle Multer Files (Secure)
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const photoUrl = `/uploads/${file.filename}`;
                await transaction.request()
                    .input('sid', sql.Int, studentId)
                    .input('url', sql.NVarChar, photoUrl)
                    .query(`INSERT INTO StudentPhotos (StudentID, PhotoUrl) VALUES (@sid, @url)`);
            }
        }

        // Handle Legacy Base64/URLs (if any)
        if (referencePhotos && referencePhotos.length > 0) {
            // ... existing logic if needed, or deprecate
        }

        await transaction.commit();
        res.json({ success: true, message: 'Student created with photos' });
    } catch (err) {
        if (transaction._aborted === false) await transaction.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

exports.getStudentPhotos = async (req, res) => {
    const { studentId } = req.params;
    try {
        const result = await sql.query`SELECT PhotoUrl FROM StudentPhotos WHERE StudentID = ${studentId}`;
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getStudentAndSeat = async (req, res) => {
    const { examId, studentIdentifier } = req.query; // Identifier can be ID or Name

    // Safety check - Exam ID is mandatory
    if (!examId) {
        return res.status(400).json({ message: 'Exam ID is required' });
    }

    try {
        let result;

        if (studentIdentifier && studentIdentifier.trim() !== '') {
            // Search by UniversityID (exact) or FullName (contains)
            result = await sql.query`
                SELECT s.StudentID, s.UniversityID, s.FullName, s.ReferencePhotoUrl, 
                       er.AssignedSeat, er.Status, er.RosterID
                FROM ExamRoster er
                JOIN Students s ON er.StudentID = s.StudentID
                WHERE er.ExamID = ${examId}
                AND (s.UniversityID = ${studentIdentifier} OR s.FullName LIKE '%' + ${studentIdentifier} + '%')
            `;
        } else {
            // Return ALL students for the exam if no search term
            result = await sql.query`
                SELECT s.StudentID, s.UniversityID, s.FullName, s.ReferencePhotoUrl, 
                       er.AssignedSeat, er.Status, er.RosterID
                FROM ExamRoster er
                JOIN Students s ON er.StudentID = s.StudentID
                WHERE er.ExamID = ${examId}
            `;
        }

        // If multiple found, front-end should handle asking for more specific, but here we return list
        const students = result.recordset;

        // Populate photos for each student
        for (const s of students) {
            const photoRes = await sql.query`SELECT PhotoUrl FROM StudentPhotos WHERE StudentID = ${s.StudentID}`;
            s.Photos = photoRes.recordset.map(r => r.PhotoUrl);

            // Fallback for legacy data
            if (s.ReferencePhotoUrl && !s.Photos.includes(s.ReferencePhotoUrl)) {
                s.Photos.push(s.ReferencePhotoUrl);
            }
        }

        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.submitCheckIn = async (req, res) => {
    const { rosterId, isMatch, confidenceScore, isSeatCorrect } = req.body;
    try {
        // update roster status
        if (isMatch) {
            await sql.query`
                UPDATE ExamRoster 
                SET Status = 'Present', CheckInTime = GETDATE()
                WHERE RosterID = ${rosterId}
            `;
        }

        // log entry
        await sql.query`
            INSERT INTO CheckInLogs (RosterID, MLConfidenceScore, IsMatch, IsSeatCorrect, CapturedImagePath)
            VALUES (${rosterId}, ${confidenceScore}, ${isMatch}, ${isSeatCorrect}, 'TODO_IMAGE_PATH')
        `;

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        // Delete dependencies first (Cascading delete manual approach)
        await sql.query`DELETE FROM ExamRoster WHERE StudentID = ${id}`;
        await sql.query`DELETE FROM StudentPhotos WHERE StudentID = ${id}`;
        await sql.query`DELETE FROM Students WHERE StudentID = ${id}`;

        res.json({ success: true, message: 'Student deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
