const { validateSeat, validateExamTime, validateCheckInStatus, validateMLData } = require('../../src/server/src/utils/validation');

describe('Seating Compliance Validation', () => {
    test('Student in correct seat returns true', () => {
        expect(validateSeat('A1', 'A1')).toBe(true);
    });

    test('Student in wrong seat returns false', () => {
        expect(validateSeat('A2', 'A1')).toBe(false);
    });
});

describe('Exam Time Validation', () => {
    test('Check-in within window returns true', () => {
        const examStart = new Date();
        const now = new Date();
        expect(validateExamTime(examStart, now)).toBe(true);
    });

    test('Check-in too early returns false', () => {
        const examStart = new Date(Date.now() + 3600000); // 1 hour later
        const now = new Date();
        expect(validateExamTime(examStart, now)).toBe(false);
    });
});

describe('Business Rules Validation', () => {
    test('Detects Duplicate Check-in', () => {
        const existingLogs = [{ LogID: 1, Timestamp: new Date() }];
        expect(validateCheckInStatus(existingLogs)).toBe(true); // Is Duplicate
    });

    test('Allows First Check-in', () => {
        const existingLogs = [];
        expect(validateCheckInStatus(existingLogs)).toBe(false); // Not Duplicate
    });
});

describe('ML Service Wrapper Mock', () => {
    // Mocking the inputs expected from the ML service
    test('Valid confidence score passes', () => {
        const mockScore = 0.85; // High confidence
        expect(validateMLData(mockScore)).toBe(true);
    });

    test('Low confidence score fails', () => {
        const mockScore = 0.4; // Low confidence
        expect(validateMLData(mockScore)).toBe(false);
    });

    test('Invalid type fails', () => {
        expect(validateMLData("high")).toBe(false);
    });
});
