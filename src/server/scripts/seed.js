require('dotenv').config({ path: '../.env' });
const { sql, connectDB } = require('../db');

const seed = async () => {
    try {
        await connectDB();
        console.log("Starting seed process...");

        // 1. Create Rooms
        console.log("Creating Rooms...");
        const rooms = [
            { name: 'Hall A', rows: 5, cols: 6 },
            { name: 'Hall B', rows: 8, cols: 8 },
            { name: 'Auditorium', rows: 10, cols: 15 },
            { name: 'Lab 1', rows: 4, cols: 5 },
            { name: 'Lab 2', rows: 4, cols: 5 },
            { name: 'Lecture Hall 101', rows: 6, cols: 10 },
            { name: 'Seminar Room A', rows: 3, cols: 8 }
        ];

        for (const r of rooms) {
            const layout = JSON.stringify({ rows: r.rows, cols: r.cols });
            const capacity = r.rows * r.cols;
            await sql.query`
                IF NOT EXISTS (SELECT * FROM Rooms WHERE RoomName = ${r.name})
                INSERT INTO Rooms (RoomName, Capacity, LayoutConfig)
                VALUES (${r.name}, ${capacity}, ${layout})
            `;
        }

        // 2. Create Students (200 students)
        console.log("Creating Students...");
        const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Lisa', 'Daniel', 'Nancy', 'Paul', 'Betty', 'Mark', 'Margaret', 'Donald', 'Sandra'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

        const students = [];
        for (let i = 0; i < 200; i++) {
            const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
            const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
            const fullName = `${fn} ${ln}`;
            const uid = `U2024${(1000 + i).toString()}`;

            // random placeholder photo
            const photoUrl = `https://ui-avatars.com/api/?name=${fn}+${ln}&background=random`;

            try {
                // Insert Check
                const check = await sql.query`SELECT StudentID FROM Students WHERE UniversityID = ${uid}`;
                let studentId;

                if (check.recordset.length === 0) {
                    const res = await sql.query`
                        INSERT INTO Students (UniversityID, FullName, Email, ReferencePhotoUrl)
                        OUTPUT INSERTED.StudentID
                        VALUES (${uid}, ${fullName}, ${uid.toLowerCase() + '@university.edu'}, ${photoUrl})
                    `;
                    studentId = res.recordset[0].StudentID;
                } else {
                    studentId = check.recordset[0].StudentID;
                }
                students.push(studentId);

                // Add to StudentPhotos
                await sql.query`
                    IF NOT EXISTS (SELECT * FROM StudentPhotos WHERE StudentID = ${studentId})
                    INSERT INTO StudentPhotos (StudentID, PhotoUrl) VALUES (${studentId}, ${photoUrl})
                `;

            } catch (e) {
                // console.error(`Failed to add student ${uid}`, e.message);
            }
        }

        // 3. Create Exams
        console.log("Creating Exams...");
        const roomRes = await sql.query`SELECT RoomID, LayoutConfig FROM Rooms`;
        const roomData = roomRes.recordset;

        const courses = ['CS101', 'MATH202', 'PHYS101', 'ENG101', 'CHEM101', 'HIST101', 'BIO101', 'ECON101', 'PSY101', 'ART101'];
        const examNames = ['Midterm Exam', 'Final Exam', 'Quiz 1', 'Quiz 2', 'Lab Exam'];

        const exams = [];
        for (let i = 0; i < 20; i++) {
            const course = courses[i % courses.length];
            const name = examNames[i % examNames.length];
            const room = roomData[i % roomData.length];

            // Random dates: some past, some future
            const date = new Date();
            date.setDate(date.getDate() + (i - 5)); // -5 days to +15 days range
            date.setHours(9 + (i % 5), 0, 0);

            try {
                const res = await sql.query`
                    INSERT INTO Exams (CourseCode, ExamName, StartTime, DurationMinutes, RoomID, CreatedBy)
                    OUTPUT INSERTED.ExamID
                    VALUES (${course}, ${name}, ${date}, 90, ${room.RoomID}, 1)
                `;
                exams.push({ id: res.recordset[0].ExamID, roomConfig: JSON.parse(room.LayoutConfig) });
            } catch (e) {
                // console.log("Exam creation error (might be duplicate logic)", e.message);
            }
        }

        // 4. Create Roster (Assign students)
        console.log("Populating Rosters...");
        for (const exam of exams) {
            // Assign 60% of capacity or max available students
            const capacity = exam.roomConfig.rows * exam.roomConfig.cols;
            const targetCount = Math.floor(capacity * 0.7);

            const shuffled = students.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, targetCount);

            let seatIndex = 0;

            for (const studId of selected) {
                if (seatIndex >= capacity) break;

                const r = Math.floor(seatIndex / exam.roomConfig.cols) + 1;
                const c = (seatIndex % exam.roomConfig.cols) + 1;
                // Simple A1, B1 mapping
                const rowChar = String.fromCharCode(64 + r);
                const seat = `${rowChar}${c}`;

                seatIndex++;

                try {
                    await sql.query`
                        INSERT INTO ExamRoster (ExamID, StudentID, AssignedSeat, Status)
                        VALUES (${exam.id}, ${studId}, ${seat}, 'Scheduled')
                    `;
                } catch (e) {
                    // Ignore dupes
                }
            }
        }

        console.log("Seed complete!");
        process.exit(0);

    } catch (err) {
        console.error("Seed Error:", err);
        process.exit(1);
    }
};

seed();
