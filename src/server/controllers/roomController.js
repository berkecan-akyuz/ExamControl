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
    const transaction = new sql.Transaction();

    try {
        await transaction.begin();
        const capacity = rows * cols;
        const layoutConfig = JSON.stringify({ rows: parseInt(rows), cols: parseInt(cols) });

        // 1. Insert Room
        const roomResult = await transaction.request()
            .input('name', sql.NVarChar, roomName)
            .input('cap', sql.Int, capacity)
            .input('layout', sql.NVarChar, layoutConfig)
            .query(`
                INSERT INTO Rooms (RoomName, Capacity, LayoutConfig)
                OUTPUT INSERTED.RoomID
                VALUES (@name, @cap, @layout)
            `);

        const roomId = roomResult.recordset[0].RoomID;

        // 2. Insert Seats (A1, A2... B1, B2...)
        // Using a transaction for bulk-like insertion loop
        for (let r = 0; r < rows; r++) {
            const rowLabel = String.fromCharCode(65 + r); // A, B, C...
            for (let c = 1; c <= cols; c++) {
                const colLabel = c.toString();
                await transaction.request()
                    .input('rid', sql.Int, roomId)
                    .input('row', sql.NVarChar, rowLabel)
                    .input('col', sql.NVarChar, colLabel)
                    .query(`
                        INSERT INTO Seats (RoomID, RowLabel, ColLabel, IsAccessible, Status)
                        VALUES (@rid, @row, @col, 1, 'Active')
                    `);
            }
        }

        await transaction.commit();
        res.json({ success: true, message: 'Room and seats created' });
    } catch (err) {
        if (transaction._aborted === false) await transaction.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getRoomSeats = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`SELECT * FROM Seats WHERE RoomID = ${id} ORDER BY RowLabel, ColLabel`;
        res.json(result.recordset);
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
