const { sql } = require('../db');
const faceService = require('../services/faceService');

exports.verifyCheckIn = async (req, res) => {
    // Requires 'multer' middleware to populate req.file
    const { rosterId } = req.body;
    const file = req.file; // Captured image

    if (!file || !rosterId) {
        return res.status(400).json({ message: 'Missing image or roster ID' });
    }

    try {
        // 1. Get Student References
        const rosterRes = await sql.query`
            SELECT er.StudentID 
            FROM ExamRoster er
            WHERE er.RosterID = ${rosterId}
        `;

        if (rosterRes.recordset.length === 0) {
            return res.status(404).json({ message: 'Roster entry not found' });
        }

        const studentId = rosterRes.recordset[0].StudentID;

        const photoRes = await sql.query`
            SELECT PhotoUrl FROM StudentPhotos WHERE StudentID = ${studentId}
        `;
        const referencePhotos = photoRes.recordset.map(r => r.PhotoUrl);

        // 2. Perform Verification (Server-Side)
        // Read file buffer for passing to service (or pass path)
        // Here we just pass path logic or buffer logic. FaceService Mock handles basic true/false.
        const fs = require('fs');
        const imgBuffer = fs.readFileSync(file.path);

        const result = await faceService.verifyIdentity(imgBuffer, referencePhotos);

        // 3. Update Database if match
        if (result.isMatch) {
            await sql.query`
                UPDATE ExamRoster 
                SET Status = 'Present', CheckInTime = GETDATE()
                WHERE RosterID = ${rosterId}
            `;
        }

        // 4. Log Attempt
        await sql.query`
            INSERT INTO CheckInLogs (RosterID, MLConfidenceScore, IsMatch, IsSeatCorrect, CapturedImagePath)
            VALUES (${rosterId}, ${result.score || 0.95}, ${result.isMatch ? 1 : 0}, 1, ${'/uploads/' + file.filename})
        `;

        // 5. Return Result to Client
        // Client just displays yes/no, cannot override logic
        res.json({
            success: true,
            isMatch: result.isMatch,
            message: result.isMatch ? 'Identity Verified' : 'Verification Failed'
        });

    } catch (err) {
        console.error("CheckIn Error:", err);
        res.status(500).json({ message: 'Server verification failed' });
    }
};
