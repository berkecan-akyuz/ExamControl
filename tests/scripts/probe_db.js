const { sql, connectDB } = require('../../src/server/db');

async function test() {
    console.log("Starting DB Connection Test...");
    await connectDB();
    try {
        console.log("Querying...");
        const res = await sql.query`SELECT 'DB IS WORKING' as msg`;
        console.log("Result:", res.recordset[0]);
        console.log("SUCCESS: Database is accessible.");
    } catch (err) {
        console.error("FAILURE: Query Failed.", err);
    }
    process.exit();
}

test();
