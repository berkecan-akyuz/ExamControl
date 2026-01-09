const { sql } = require('../db');

// Simple Login (No JWT for simplicity unless requested, keeping it session-less or client-side stored role)
// For a robust system, use JWT. I'll stick to returning user info and let client store it (Not Secure for production but okay for prototype)
// secure: "verify that a student matches...". ID photo vs live photo.
// Authentication is less critical than the ML part for this specific "Testing & Validation" project focus, 
// but I'll add a simple dummy token or just return success.

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await sql.query`SELECT * FROM Users WHERE Username = ${username}`;
        const user = result.recordset[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // In real app, use bcrypt.compare(password, user.PasswordHash)
        if (password !== user.PasswordHash) { // Simple string compare for now per dummy data
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Return user info (excluding password)
        res.json({
            id: user.UserID,
            username: user.Username,
            role: user.Role,
            fullName: user.FullName
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
