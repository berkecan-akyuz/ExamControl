const { sql, connectDB } = require('./src/server/db');

async function fixAuth() {
    console.log("Fixing Admin Password...");
    await connectDB();
    try {
        // Update Admin to plain text 'admin123'
        await sql.query`
            UPDATE Users 
            SET PasswordHash = 'admin123' 
            WHERE Username = 'admin'
        `;
        console.log("SUCCESS: Admin password set to 'admin123'");

        // Verify
        const res = await sql.query`SELECT Username, PasswordHash FROM Users WHERE Username = 'admin'`;
        console.log("Current Admin Data:", res.recordset[0]);

    } catch (err) {
        console.error("FAILURE:", err);
    }
    process.exit();
}

fixAuth();
