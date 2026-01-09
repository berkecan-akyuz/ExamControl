const { sql, connectDB } = require('../../src/server/db');

async function checkUsers() {
    await connectDB();
    try {
        console.log("Checking Users Table...");
        const res = await sql.query`SELECT * FROM Users`;
        console.log("Users Found:", res.recordset.length);
        if (res.recordset.length > 0) {
            console.log("User 1:", res.recordset[0].Username, res.recordset[0].Role);
        } else {
            console.log("TABLE IS EMPTY!");
        }
    } catch (err) {
        console.error("Query Failed", err);
    }
    process.exit();
}

checkUsers();
