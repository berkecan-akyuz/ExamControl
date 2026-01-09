const { sql, connectDB } = require('../../src/server/db');

async function checkData() {
    await connectDB();
    try {
        // 1. Check Time
        console.log("--- TIME CHECK ---");
        const timeRes = await sql.query`SELECT GETDATE() as DBTime, SYSDATETIMEOFFSET() as DBTimeOffset`;
        console.log("DB GETDATE():", timeRes.recordset[0].DBTime);
        console.log("DB Offset:", timeRes.recordset[0].DBTimeOffset);
        console.log("Node System Time:", new Date().toString());

        // 2. Check Exam Duplicates
        console.log("--- EXAM CHECK ---");
        const exams = await sql.query`
            SELECT ExamName, StartTime, COUNT(*) as Count 
            FROM Exams 
            GROUP BY ExamName, StartTime 
            HAVING COUNT(*) > 1
        `;

        if (exams.recordset.length > 0) {
            console.log("DUPLICATE EXAMS FOUND:", exams.recordset);
        } else {
            console.log("No exact duplicates (Name + StartTime) in DB.");
            // Show sample to see if names repeat on different days
            const sample = await sql.query`SELECT TOP 10 ExamName, StartTime, ExamID FROM Exams ORDER BY ExamName`;
            console.log("Sample Exams:", sample.recordset);
        }

    } catch (err) {
        console.error("FAILURE:", err);
    }
    process.exit();
}

checkData();
