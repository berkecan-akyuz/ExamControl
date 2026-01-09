const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const config = {
    // Connection string is often more reliable for msnodesqlv8 on some systems
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost;Database=ExamSecurityDB;Trusted_Connection=yes;',
    options: {
        useUTC: false // Treat DB dates as local time to prevent double-timezone shifting
    }
};

async function connectDB() {
    try {
        await sql.connect(config);
        console.log('Connected to MS SQL Server');
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

module.exports = {
    connectDB,
    sql
};
