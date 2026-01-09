const { sql, connectDB } = require('./src/server/db');

async function repair() {
    console.log("Starting DB Repair...");
    await connectDB();

    try {
        // 1. Check & Fix CheckInLogs.IsSeatCorrect
        {
            const res = await sql.query`SELECT COUNT(*) as count FROM sys.columns WHERE object_id = OBJECT_ID('CheckInLogs') AND name = 'IsSeatCorrect'`;
            if (res.recordset[0].count === 0) {
                console.log("ADDING IsSeatCorrect to CheckInLogs...");
                await sql.query`ALTER TABLE CheckInLogs ADD IsSeatCorrect BIT DEFAULT 0`;
                console.log("FIXED: IsSeatCorrect added.");
            } else {
                console.log("OK: IsSeatCorrect exists.");
            }
        }

        // 2. Check & Fix Rooms.LayoutConfig
        {
            const res = await sql.query`SELECT COUNT(*) as count FROM sys.columns WHERE object_id = OBJECT_ID('Rooms') AND name = 'LayoutConfig'`;
            if (res.recordset[0].count === 0) {
                console.log("ADDING LayoutConfig to Rooms...");
                await sql.query`ALTER TABLE Rooms ADD LayoutConfig NVARCHAR(MAX)`;
                console.log("FIXED: LayoutConfig added.");
            } else {
                console.log("OK: LayoutConfig exists.");
            }
        }

        // 3. Check & Fix CheckInLogs.MLConfidenceScore
        {
            const res = await sql.query`SELECT COUNT(*) as count FROM sys.columns WHERE object_id = OBJECT_ID('CheckInLogs') AND name = 'MLConfidenceScore'`;
            if (res.recordset[0].count === 0) {
                console.log("ADDING MLConfidenceScore to CheckInLogs...");
                await sql.query`ALTER TABLE CheckInLogs ADD MLConfidenceScore FLOAT`;
                console.log("FIXED: MLConfidenceScore added.");
            } else {
                console.log("OK: MLConfidenceScore exists.");
            }
        }

        console.log("DB REPAIR COMPLETE.");

    } catch (err) {
        console.error("REPAIR FAILED:", err);
    }
    process.exit();
}

repair();
