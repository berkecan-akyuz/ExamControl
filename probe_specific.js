const { sql, connectDB } = require('./src/server/db');

async function check() {
    await connectDB();
    try {
        console.log("--- SCHEMA CHECK ---");

        // 1. Check Rooms.LayoutConfig
        const q1 = await sql.query`
            SELECT COUNT(*) as count 
            FROM sys.columns 
            WHERE object_id = OBJECT_ID('Rooms') AND name = 'LayoutConfig'
        `;
        console.log(`Rooms.LayoutConfig: ${q1.recordset[0].count === 1 ? 'FOUND' : 'MISSING'}`);

        // 2. Check CheckInLogs.IsSeatCorrect
        const q2 = await sql.query`
            SELECT COUNT(*) as count 
            FROM sys.columns 
            WHERE object_id = OBJECT_ID('CheckInLogs') AND name = 'IsSeatCorrect'
        `;
        console.log(`CheckInLogs.IsSeatCorrect: ${q2.recordset[0].count === 1 ? 'FOUND' : 'MISSING'}`);

        console.log("--- QUERY CHECK ---");
        // 3. Test Select Students
        console.log("Querying Students...");
        const q3 = await sql.query`SELECT TOP 1 StudentID, FullName FROM Students`;
        console.log("Students Result:", q3.recordset);

        // 4. Test Exams Join
        console.log("Querying Exams Join...");
        const q4 = await sql.query`
            SELECT TOP 1 e.ExamID, r.RoomName 
            FROM Exams e 
            JOIN Rooms r ON e.RoomID = r.RoomID
        `;
        console.log("Exams Join Result:", q4.recordset);

    } catch (err) {
        console.error("PROBE FAILURE:", err);
    }
    process.exit();
}

check();
