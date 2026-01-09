function validateSeat(currentSeat, assignedSeat) {
    if (!currentSeat || !assignedSeat) return false;
    return currentSeat.trim().toUpperCase() === assignedSeat.trim().toUpperCase();
}

function validateExamTime(examStartTime, currentTime) {
    // Allow check-in 30 mins before start up to 30 mins after start
    const start = new Date(examStartTime);
    const current = new Date(currentTime);

    // Check if within window
    const diffMinutes = (current - start) / 1000 / 60;

    // e.g. -30 (30 min before) to +30 (30 min after)
    return diffMinutes >= -30 && diffMinutes <= 30;
}

function validateCheckInStatus(existingLogs) {
    // If there are existing logs for this student in this exam, warn or block
    // Return true if duplicate (already checked in)
    return existingLogs && existingLogs.length > 0;
}

function validateMLData(confidenceScore, threshold = 0.6) {
    // Ensure confidence is number and above threshold
    if (typeof confidenceScore !== 'number') return false;
    return confidenceScore >= threshold;
}

module.exports = {
    validateSeat,
    validateExamTime,
    validateCheckInStatus,
    validateMLData
};
