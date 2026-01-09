const express = require('express');
const cors = require('cors');
const { connectDB, sql } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/apiRoutes'));

// Basic Route
app.get('/', (req, res) => {
    res.send('Exam Security System API is running');
});

// Test DB Route
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await sql.query`SELECT 'Success' as message`;
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
async function startServer() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();
