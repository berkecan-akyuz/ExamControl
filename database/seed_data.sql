USE ExamSecurityDB;
GO

-- 1. Seed Users (Admin and Proctor)
IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'admin')
BEGIN
    INSERT INTO Users (Username, PasswordHash, Role, FullName)
    VALUES ('admin', '$2b$10$YourHashedPasswordHere', 'Admin', 'System Administrator');
END

IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'proctor1')
BEGIN
    INSERT INTO Users (Username, PasswordHash, Role, FullName)
    VALUES ('proctor1', '$2b$10$YourHashedPasswordHere', 'Proctor', 'Jane Doe Proctor');
END

-- 2. Seed Rooms
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


-- 3. Seed Students (Loop for 500 students)
DECLARE @i INT = 1;
DECLARE @TotalStudents INT = 500;
-- ... (rest of variable decls safe)

-- ... inside loop ...
WHILE @i <= @TotalStudents
BEGIN
    -- ...
    SET @i = @i + 1;
END

-- ...

-- 5. Seed Rosters 
-- Assign roughly 50 students (or room capacity) to each exam
DECLARE @ExamCursor CURSOR;
DECLARE @CurrExamID INT;
DECLARE @CurrRoomLayout NVARCHAR(MAX);
DECLARE @RoomCols INT;
DECLARE @RoomRows INT;

SET @ExamCursor = CURSOR FOR SELECT ExamID FROM Exams;
OPEN @ExamCursor;
FETCH NEXT FROM @ExamCursor INTO @CurrExamID;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Get Room Dimensions
    SELECT 
        @RoomCols = JSON_VALUE(r.LayoutConfig, '$.cols'),
        @RoomRows = JSON_VALUE(r.LayoutConfig, '$.rows')
    FROM Exams e JOIN Rooms r ON e.RoomID = r.RoomID 
    WHERE e.ExamID = @CurrExamID;

    -- Calculate capacity and target 90%
    DECLARE @Capacity INT = @RoomCols * @RoomRows;
    DECLARE @Target INT = FLOOR(@Capacity * 0.9);
    
    -- Limit to 50 if room is huge, or just fill it up? User said "at least 50".
    -- Let's try to fill up to capacity or 60, whichever is smaller, but ensuring at least 50 if room holds it.
    -- Actually, simpler: Fill 90% of Room.
    
    INSERT INTO ExamRoster (ExamID, StudentID, AssignedSeat, Status)
    SELECT TOP (@Target)
        @CurrExamID, 
        StudentID, 
        -- Generate seat label: Row Char + Col Num (e.g. A1, A2...)
        CHAR(65 + ((ROW_NUMBER() OVER(ORDER BY NEWID()) - 1) / @RoomCols)) + 
        CAST(((ROW_NUMBER() OVER(ORDER BY NEWID()) - 1) % @RoomCols) + 1 AS NVARCHAR), 
        'Scheduled'
    FROM Students
    WHERE StudentID NOT IN (SELECT StudentID FROM ExamRoster WHERE ExamID = @CurrExamID) -- Avoid dups if re-running
    ORDER BY NEWID();

    FETCH NEXT FROM @ExamCursor INTO @CurrExamID;
END

CLOSE @ExamCursor;
DEALLOCATE @ExamCursor;
GO
