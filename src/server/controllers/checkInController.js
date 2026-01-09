const { sql } = require('../db');
const faceService = require('../services/faceService');

exports.verifyCheckIn = async (req, res) => {
    // Requires 'multer' middleware to populate req.file
    console.log("DEBUG: verifyCheckIn called");
    console.log("DEBUG: Body:", req.body);
    console.log("DEBUG: File:", req.file ? req.file.filename : 'MISSING');

    const { rosterId, seatCode } = req.body; // Added seatCode
    const file = req.file; // Captured image

    if (!file || !rosterId) {
        console.error("DEBUG: Missing valid input (file or rosterId)");
        return res.status(400).json({ message: 'Missing image or roster ID' });
    }

    try {
        // 1. Get Student References AND Assigned Seat
        console.log("DEBUG: Querying Roster...");
        const rosterRes = await sql.query`
            SELECT er.StudentID, er.AssignedSeat 
            FROM ExamRoster er
            WHERE er.RosterID = ${rosterId}
        `;

        if (rosterRes.recordset.length === 0) {
            console.error("DEBUG: Roster entry not found for ID:", rosterId);
            return res.status(404).json({ message: 'Roster entry not found' });
        }

        const studentData = rosterRes.recordset[0];
        const studentId = studentData.StudentID;
        const assignedSeat = studentData.AssignedSeat;
        console.log("DEBUG: Student found:", studentId, "Seat:", assignedSeat);

        // Verify Seat
        // If seatCode is provided, check it. If not, we might assume 0 or handle strictly.
        // Assuming strict:
        let isSeatCorrect = false;
        if (seatCode && assignedSeat) {
            isSeatCorrect = (seatCode.trim().toUpperCase() === assignedSeat.trim().toUpperCase());
        }

        console.log("DEBUG: Fetching Ref Photos...");
        const photoRes = await sql.query`
            SELECT PhotoUrl FROM StudentPhotos WHERE StudentID = ${studentId}
        `;
        const referencePhotos = photoRes.recordset.map(r => r.PhotoUrl);
        console.log("DEBUG: Ref Photos count:", referencePhotos.length);

        // 2. Perform Verification (Server-Side)
        const fs = require('fs');
        const imgBuffer = fs.readFileSync(file.path);

        console.log("DEBUG: Calling faceService...");
        const result = await faceService.verifyIdentity(imgBuffer, referencePhotos);
        console.log("DEBUG: FaceService Result:", result);

        // 3. Update Status only if BOTH match (or maybe just Identity match is enough for 'Present' but with warning?)
        // Requirement says: "display a specific warning if the identity matches but the seat is wrong"
        // Usually, we verify identity = Present. Seat issue is a warning/log.

        // IMPORTANT: Check if result has error
        if (result.error) {
            console.error("DEBUG: FaceService returned error:", result.error);
            // Decide: fail check-in or allow with warning? Let's fail secure.
            // But returning 200 with false is better for UI handling
        }

        if (result.isMatch) {
            await sql.query`
                UPDATE ExamRoster 
                SET Status = 'Present', CheckInTime = GETDATE()
                WHERE RosterID = ${rosterId}
            `;
        }

        // 4. Log Attempt with ACTUAL Seat Status
        console.log("DEBUG: Logging to CheckInLogs...");
        // Ensure inputs are safe numbers using helper or direct checks
        const score = result.score || 0;
        const isMatchBit = result.isMatch ? 1 : 0;
        const isSeatBit = isSeatCorrect ? 1 : 0;
        const filePath = '/uploads/' + file.filename;

        await sql.query`
            INSERT INTO CheckInLogs (RosterID, MLConfidenceScore, IsMatch, IsSeatCorrect, CapturedImagePath)
            VALUES (${rosterId}, ${score}, ${isMatchBit}, ${isSeatBit}, ${filePath})
        `;

        // 5. Return Result to Client
        console.log("DEBUG: Success, sending response.");
        res.json({
            success: true,
            isMatch: result.isMatch,
            isSeatCorrect: isSeatCorrect, // Return verification to frontend
            assignedSeat: assignedSeat,   // Helpful for frontend to show "You should be in X"
            score: result.score,          // Pass score to frontend
            message: result.isMatch
                ? (isSeatCorrect ? 'Identity Verified' : `Identity Verified, but wrong seat! Go to ${assignedSeat}`)
                : 'Verification Failed'
        });

    } catch (err) {
        console.error("CheckIn Error Details:", err); // Log full object

        try {
            const fs = require('fs');
            const path = require('path');
            const logPath = path.join(__dirname, '../../debug_errors.log');
            const msg = `${new Date().toISOString()} - ERROR in verifyCheckIn: ${err.message}\nSTACK: ${err.stack}\n`;
            fs.appendFileSync(logPath, msg);
        } catch (logErr) {
            console.error("Failed to write to log file", logErr);
        }

        res.status(500).json({ message: 'Server verification failed', error: err.message });
    }
};
