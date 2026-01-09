const { sql } = require('../db');

exports.getRooms = async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM Rooms`;
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createRoom = async (req, res) => {
    const { roomName, rows, cols } = req.body;
    try {
        const capacity = rows * cols;
        const layoutConfig = JSON.stringify({ rows: parseInt(rows), cols: parseInt(cols) });

        await sql.query`
            INSERT INTO Rooms (RoomName, Capacity, LayoutConfig)
            VALUES (${roomName}, ${capacity}, ${layoutConfig})
        `;
        res.json({ success: true, message: 'Room created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteRoom = async (req, res) => {
    const { id } = req.params;
    try {
        await sql.query`DELETE FROM Rooms WHERE RoomID = ${id}`;
        res.json({ success: true, message: 'Room deleted' });
    } catch (err) {
        if (err.number === 547) { // Foreign key constraint violation
            return res.status(400).json({ message: 'Cannot delete room involved in exams.' });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
