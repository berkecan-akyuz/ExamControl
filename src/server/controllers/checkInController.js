const { sql } = require('../db');
const faceService = require('../services/faceService');

exports.verifyCheckIn = async (req, res) => {
    // Requires 'multer' middleware to populate req.file
    const { rosterId, seatCode } = req.body; // Added seatCode
    const file = req.file; // Captured image

    if (!file || !rosterId) {
        return res.status(400).json({ message: 'Missing image or roster ID' });
    }

    try {
        // 1. Get Student References AND Assigned Seat
        const rosterRes = await sql.query`
            SELECT er.StudentID, er.AssignedSeat 
            FROM ExamRoster er
            WHERE er.RosterID = ${rosterId}
        `;

        if (rosterRes.recordset.length === 0) {
            return res.status(404).json({ message: 'Roster entry not found' });
        }

        const studentData = rosterRes.recordset[0];
        const studentId = studentData.StudentID;
        const assignedSeat = studentData.AssignedSeat;

        // Verify Seat
        // If seatCode is provided, check it. If not, we might assume 0 or handle strictly.
        // Assuming strict:
        let isSeatCorrect = false;
        if (seatCode && assignedSeat) {
            isSeatCorrect = (seatCode.trim().toUpperCase() === assignedSeat.trim().toUpperCase());
        }

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

        // 3. Update Status only if BOTH match (or maybe just Identity match is enough for 'Present' but with warning?)
        // Requirement says: "display a specific warning if the identity matches but the seat is wrong"
        // Usually, we verify identity = Present. Seat issue is a warning/log.
        if (result.isMatch) {
            await sql.query`
                UPDATE ExamRoster 
                SET Status = 'Present', CheckInTime = GETDATE()
                WHERE RosterID = ${rosterId}
            `;
        }

        // 4. Log Attempt with ACTUAL Seat Status
        await sql.query`
            INSERT INTO CheckInLogs (RosterID, MLConfidenceScore, IsMatch, IsSeatCorrect, CapturedImagePath)
            VALUES (${rosterId}, ${result.score || 0.95}, ${result.isMatch ? 1 : 0}, ${isSeatCorrect ? 1 : 0}, ${'/uploads/' + file.filename})
        `;

        // 5. Return Result to Client
        // Client just displays yes/no, cannot override logic
        res.json({
            success: true,
            isMatch: result.isMatch,
            isSeatCorrect: isSeatCorrect, // Return verification to frontend
            assignedSeat: assignedSeat,   // Helpful for frontend to show "You should be in X"
            message: result.isMatch
                ? (isSeatCorrect ? 'Identity Verified' : `Identity Verified, but wrong seat! Go to ${assignedSeat}`)
                : 'Verification Failed'
        });

    } catch (err) {
        console.error("CheckIn Error:", err);
        res.status(500).json({ message: 'Server verification failed' });
    }
};
