const { sql, connectDB } = require('./src/server/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        await connectDB();
        console.log("Connected to DB.");

        const migrationPath = path.join(__dirname, 'database', 'migration_v2_photos.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');

        // Split by GO if needed, or run as separate batches. 
        // mssql driver doesn't support 'GO' statements usually. 
        // We'll split by 'GO' manually.
        const batches = migrationSql.split('GO');

        for (const batch of batches) {
            const query = batch.trim();
            if (query) {
                await sql.query(query);
                console.log("Executed batch.");
            }
        }

        console.log("Migration V2 completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

runMigration();
