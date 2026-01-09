const { sql, connectDB } = require('../../src/server/db');

async function test() {
    await connectDB();
    try {
        console.log("Listing Tables...");
        const res = await sql.query`SELECT Name FROM sysobjects WHERE xtype='U'`;
        console.log("Tables found:", res.recordset.map(r => r.Name));

        console.log("Checking Exams columns...");
        const cols = await sql.query`SELECT Name FROM sys.columns WHERE object_id = OBJECT_ID('Exams')`;
        console.log("Exams Columns:", cols.recordset.map(c => c.Name));

        console.log("Checking Rooms columns...");
        const colsRooms = await sql.query`SELECT Name FROM sys.columns WHERE object_id = OBJECT_ID('Rooms')`;
        console.log("Rooms Columns:", colsRooms.recordset.map(c => c.Name));

        console.log("Checking CheckInLogs columns...");
        const colsLogs = await sql.query`SELECT Name FROM sys.columns WHERE object_id = OBJECT_ID('CheckInLogs')`;
        console.log("CheckInLogs Columns:", colsLogs.recordset.map(c => c.Name));

        console.log("Testing Exams Query...");
        const exams = await sql.query`SELECT TOP 1 * FROM Exams`;
        console.log("Exams Data:", exams.recordset);

    } catch (err) {
        console.error("FAILURE:", err);
    }
    process.exit();
}

test();
