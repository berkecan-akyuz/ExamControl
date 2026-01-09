USE ExamSecurityDB;
GO

-- =============================================
-- 1. Seed Users
-- =============================================
IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'admin')
INSERT INTO Users (Username, PasswordHash, Role, FullName) VALUES ('admin', '$2b$10$YourHashedPasswordHere', 'Admin', 'System Administrator');

IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'proctor1')
INSERT INTO Users (Username, PasswordHash, Role, FullName) VALUES ('proctor1', '$2b$10$YourHashedPasswordHere', 'Proctor', 'Jane Doe Proctor');


-- =============================================
-- 2. Seed Rooms
-- =============================================
DECLARE @Rooms TABLE (Name NVARCHAR(50), Cap INT, Cfg NVARCHAR(MAX));
INSERT INTO @Rooms VALUES 
('Hall A', 30, '{"rows":5,"cols":6}'),
('Hall B', 64, '{"rows":8,"cols":8}'),
('Auditorium', 150, '{"rows":10,"cols":15}'),
('Lab 1', 20, '{"rows":4,"cols":5}'),
('Lab 2', 20, '{"rows":4,"cols":5}'),
('Lecture Hall 101', 60, '{"rows":6,"cols":10}'),
('Seminar Room A', 24, '{"rows":3,"cols":8}');

MERGE INTO Rooms AS Target
USING @Rooms AS Source
ON Target.RoomName = Source.Name
WHEN NOT MATCHED BY TARGET THEN
    INSERT (RoomName, Capacity, LayoutConfig) VALUES (Source.Name, Source.Cap, Source.Cfg);


-- =============================================
-- 3. Seed Students (50 Manual Inserts) - Idempotent
-- =============================================
DECLARE @ManualStudents TABLE (
    UniversityID NVARCHAR(50), 
    FullName NVARCHAR(100), 
    Email NVARCHAR(100), 
    ReferencePhotoUrl NVARCHAR(MAX)
);

INSERT INTO @ManualStudents (UniversityID, FullName, Email, ReferencePhotoUrl) VALUES 
('U2024001', 'James Smith', 'u2024001@university.edu', 'https://ui-avatars.com/api/?name=James+Smith&background=0D8ABC&color=fff'),
('U2024002', 'Mary Johnson', 'u2024002@university.edu', 'https://ui-avatars.com/api/?name=Mary+Johnson&background=1D9ABC&color=fff'),
('U2024003', 'John Williams', 'u2024003@university.edu', 'https://ui-avatars.com/api/?name=John+Williams&background=2DABC0&color=fff'),
('U2024004', 'Patricia Brown', 'u2024004@university.edu', 'https://ui-avatars.com/api/?name=Patricia+Brown&background=3DBCC4&color=fff'),
('U2024005', 'Robert Jones', 'u2024005@university.edu', 'https://ui-avatars.com/api/?name=Robert+Jones&background=4DCDD8&color=fff'),
('U2024006', 'Jennifer Garcia', 'u2024006@university.edu', 'https://ui-avatars.com/api/?name=Jennifer+Garcia&background=5DDDE0&color=fff'),
('U2024007', 'Michael Miller', 'u2024007@university.edu', 'https://ui-avatars.com/api/?name=Michael+Miller&background=6DEEF4&color=fff'),
('U2024008', 'Linda Davis', 'u2024008@university.edu', 'https://ui-avatars.com/api/?name=Linda+Davis&background=7DFF08&color=fff'),
('U2024009', 'William Rodriguez', 'u2024009@university.edu', 'https://ui-avatars.com/api/?name=William+Rodriguez&background=8E001C&color=fff'),
('U2024010', 'Elizabeth Martinez', 'u2024010@university.edu', 'https://ui-avatars.com/api/?name=Elizabeth+Martinez&background=9F1120&color=fff'),
('U2024011', 'David Hernandez', 'u2024011@university.edu', 'https://ui-avatars.com/api/?name=David+Hernandez&background=A02234&color=fff'),
('U2024012', 'Barbara Lopez', 'u2024012@university.edu', 'https://ui-avatars.com/api/?name=Barbara+Lopez&background=B13348&color=fff'),
('U2024013', 'Richard Gonzalez', 'u2024013@university.edu', 'https://ui-avatars.com/api/?name=Richard+Gonzalez&background=C2445C&color=fff'),
('U2024014', 'Susan Wilson', 'u2024014@university.edu', 'https://ui-avatars.com/api/?name=Susan+Wilson&background=D35570&color=fff'),
('U2024015', 'Joseph Anderson', 'u2024015@university.edu', 'https://ui-avatars.com/api/?name=Joseph+Anderson&background=E46684&color=fff'),
('U2024016', 'Jessica Thomas', 'u2024016@university.edu', 'https://ui-avatars.com/api/?name=Jessica+Thomas&background=F57798&color=fff'),
('U2024017', 'Thomas Taylor', 'u2024017@university.edu', 'https://ui-avatars.com/api/?name=Thomas+Taylor&background=0688AC&color=fff'),
('U2024018', 'Sarah Moore', 'u2024018@university.edu', 'https://ui-avatars.com/api/?name=Sarah+Moore&background=1799C0&color=fff'),
('U2024019', 'Charles Jackson', 'u2024019@university.edu', 'https://ui-avatars.com/api/?name=Charles+Jackson&background=28AAD4&color=fff'),
('U2024020', 'Karen Martin', 'u2024020@university.edu', 'https://ui-avatars.com/api/?name=Karen+Martin&background=39BBE8&color=fff'),
('U2024021', 'Christopher Lee', 'u2024021@university.edu', 'https://ui-avatars.com/api/?name=Christopher+Lee&background=4ACCF0&color=fff'),
('U2024022', 'Lisa Perez', 'u2024022@university.edu', 'https://ui-avatars.com/api/?name=Lisa+Perez&background=5BDD04&color=fff'),
('U2024023', 'Daniel Thompson', 'u2024023@university.edu', 'https://ui-avatars.com/api/?name=Daniel+Thompson&background=6CEE18&color=fff'),
('U2024024', 'Nancy White', 'u2024024@university.edu', 'https://ui-avatars.com/api/?name=Nancy+White&background=7DFF2C&color=fff'),
('U2024025', 'Paul Harris', 'u2024025@university.edu', 'https://ui-avatars.com/api/?name=Paul+Harris&background=8E0040&color=fff'),
('U2024026', 'Betty Sanchez', 'u2024026@university.edu', 'https://ui-avatars.com/api/?name=Betty+Sanchez&background=9F1154&color=fff'),
('U2024027', 'Mark Clark', 'u2024027@university.edu', 'https://ui-avatars.com/api/?name=Mark+Clark&background=A02268&color=fff'),
('U2024028', 'Margaret Ramirez', 'u2024028@university.edu', 'https://ui-avatars.com/api/?name=Margaret+Ramirez&background=B1337C&color=fff'),
('U2024029', 'Donald Lewis', 'u2024029@university.edu', 'https://ui-avatars.com/api/?name=Donald+Lewis&background=C24490&color=fff'),
('U2024030', 'Sandra Robinson', 'u2024030@university.edu', 'https://ui-avatars.com/api/?name=Sandra+Robinson&background=D355A4&color=fff'),
('U2024031', 'George Walker', 'u2024031@university.edu', 'https://ui-avatars.com/api/?name=George+Walker&background=E466B8&color=fff'),
('U2024032', 'Ashley Young', 'u2024032@university.edu', 'https://ui-avatars.com/api/?name=Ashley+Young&background=F577CC&color=fff'),
('U2024033', 'Kenneth Allen', 'u2024033@university.edu', 'https://ui-avatars.com/api/?name=Kenneth+Allen&background=0688E0&color=fff'),
('U2024034', 'Kimberly King', 'u2024034@university.edu', 'https://ui-avatars.com/api/?name=Kimberly+King&background=1799F4&color=fff'),
('U2024035', 'Steven Wright', 'u2024035@university.edu', 'https://ui-avatars.com/api/?name=Steven+Wright&background=28AA08&color=fff'),
('U2024036', 'Donna Scott', 'u2024036@university.edu', 'https://ui-avatars.com/api/?name=Donna+Scott&background=39BB1C&color=fff'),
('U2024037', 'Edward Torres', 'u2024037@university.edu', 'https://ui-avatars.com/api/?name=Edward+Torres&background=4ACC30&color=fff'),
('U2024038', 'Michelle Nguyen', 'u2024038@university.edu', 'https://ui-avatars.com/api/?name=Michelle+Nguyen&background=5BDD44&color=fff'),
('U2024039', 'Brian Hill', 'u2024039@university.edu', 'https://ui-avatars.com/api/?name=Brian+Hill&background=6CEE58&color=fff'),
('U2024040', 'Emily Flores', 'u2024040@university.edu', 'https://ui-avatars.com/api/?name=Emily+Flores&background=7DFF6C&color=fff'),
('U2024041', 'Ronald Green', 'u2024041@university.edu', 'https://ui-avatars.com/api/?name=Ronald+Green&background=8E0080&color=fff'),
('U2024042', 'Dorothy Adams', 'u2024042@university.edu', 'https://ui-avatars.com/api/?name=Dorothy+Adams&background=9F1194&color=fff'),
('U2024043', 'Anthony Nelson', 'u2024043@university.edu', 'https://ui-avatars.com/api/?name=Anthony+Nelson&background=A022A8&color=fff'),
('U2024044', 'Melissa Baker', 'u2024044@university.edu', 'https://ui-avatars.com/api/?name=Melissa+Baker&background=B133BC&color=fff'),
('U2024045', 'Kevin Hall', 'u2024045@university.edu', 'https://ui-avatars.com/api/?name=Kevin+Hall&background=C244D0&color=fff'),
('U2024046', 'Deborah Rivera', 'u2024046@university.edu', 'https://ui-avatars.com/api/?name=Deborah+Rivera&background=D355E4&color=fff'),
('U2024047', 'Jason Campbell', 'u2024047@university.edu', 'https://ui-avatars.com/api/?name=Jason+Campbell&background=E466F8&color=fff'),
('U2024048', 'Stephanie Mitchell', 'u2024048@university.edu', 'https://ui-avatars.com/api/?name=Stephanie+Mitchell&background=F5770C&color=fff'),
('U2024049', 'Matthew Carter', 'u2024049@university.edu', 'https://ui-avatars.com/api/?name=Matthew+Carter&background=068820&color=fff'),
('U2024050', 'Rebecca Roberts', 'u2024050@university.edu', 'https://ui-avatars.com/api/?name=Rebecca+Roberts&background=179934&color=fff');

-- Merge into Students (Idempotent Insert)
MERGE INTO Students AS Target
USING @ManualStudents AS Source
ON Target.UniversityID = Source.UniversityID
WHEN NOT MATCHED BY TARGET THEN
    INSERT (UniversityID, FullName, Email, ReferencePhotoUrl) 
    VALUES (Source.UniversityID, Source.FullName, Source.Email, Source.ReferencePhotoUrl);

-- Populate Photos Table (Idempotent)
INSERT INTO StudentPhotos (StudentID, PhotoUrl)
SELECT s.StudentID, s.ReferencePhotoUrl 
FROM Students s
WHERE s.ReferencePhotoUrl IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM StudentPhotos WHERE StudentID = s.StudentID);


-- =============================================
-- 4. Seed Exams
-- =============================================
DECLARE @AdminID INT = (SELECT TOP 1 UserID FROM Users WHERE Role = 'Admin');
-- Rooms
DECLARE @HallA INT = (SELECT RoomID FROM Rooms WHERE RoomName = 'Hall A');
DECLARE @HallB INT = (SELECT RoomID FROM Rooms WHERE RoomName = 'Hall B');
DECLARE @Audit INT = (SELECT RoomID FROM Rooms WHERE RoomName = 'Auditorium');

IF NOT EXISTS (SELECT 1 FROM Exams WHERE CourseCode = 'CS101' AND ExamName = 'Midterm Exam')
   INSERT INTO Exams (CourseCode, ExamName, StartTime, DurationMinutes, RoomID, CreatedBy) VALUES
   ('CS101', 'Midterm Exam', DATEADD(DAY, 2, GETDATE()), 90, @HallA, @AdminID);

IF NOT EXISTS (SELECT 1 FROM Exams WHERE CourseCode = 'MATH202' AND ExamName = 'Calculus Final')
   INSERT INTO Exams (CourseCode, ExamName, StartTime, DurationMinutes, RoomID, CreatedBy) VALUES
   ('MATH202', 'Calculus Final', DATEADD(DAY, 4, GETDATE()), 120, @HallB, @AdminID);

IF NOT EXISTS (SELECT 1 FROM Exams WHERE CourseCode = 'ENG101' AND ExamName = 'Literature Quiz')
   INSERT INTO Exams (CourseCode, ExamName, StartTime, DurationMinutes, RoomID, CreatedBy) VALUES
   ('ENG101', 'Literature Quiz', GETDATE(), 60, @Audit, @AdminID);


-- =============================================
-- 5. Seed Roster (Distribute 50 students)
-- =============================================
-- CS101 (Hall A, Cap 30) - Add 25 students
DECLARE @Exam1 INT = (SELECT TOP 1 ExamID FROM Exams WHERE CourseCode = 'CS101' ORDER BY ExamID DESC);

INSERT INTO ExamRoster (ExamID, StudentID, AssignedSeat, Status)
SELECT TOP 25 
    @Exam1, StudentID, 
    CONCAT(CHAR(65 + (ROW_NUMBER() OVER(ORDER BY StudentID)-1)/6), (ROW_NUMBER() OVER(ORDER BY StudentID)-1)%6 + 1),
    'Scheduled'
FROM Students
WHERE StudentID BETWEEN (SELECT MIN(StudentID) FROM Students) AND (SELECT MIN(StudentID) + 24 FROM Students)
AND NOT EXISTS (SELECT 1 FROM ExamRoster WHERE ExamID = @Exam1 AND StudentID = Students.StudentID);

-- MATH202 (Hall B, Cap 64) - Add next 25 students
DECLARE @Exam2 INT = (SELECT TOP 1 ExamID FROM Exams WHERE CourseCode = 'MATH202' ORDER BY ExamID DESC);

INSERT INTO ExamRoster (ExamID, StudentID, AssignedSeat, Status)
SELECT TOP 25 
    @Exam2, StudentID, 
    CONCAT(CHAR(65 + (ROW_NUMBER() OVER(ORDER BY StudentID)-1)/8), (ROW_NUMBER() OVER(ORDER BY StudentID)-1)%8 + 1),
    'Scheduled'
FROM Students
WHERE StudentID >= (SELECT MIN(StudentID) + 25 FROM Students)
AND NOT EXISTS (SELECT 1 FROM ExamRoster WHERE ExamID = @Exam2 AND StudentID = Students.StudentID);
GO
