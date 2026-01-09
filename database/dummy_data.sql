-- Dummy Data for Exam Security System
USE ExamSecurityDB;
GO

-- Insert Users (Password: 'password123' - in real app, hash this!)
INSERT INTO Users (Username, PasswordHash, Role, FullName) VALUES 
('admin', 'password123', 'Admin', 'Chief Coordinator'),
('proctor1', 'password123', 'Proctor', 'John Doe');

-- Insert Rooms
INSERT INTO Rooms (RoomName, Capacity, LayoutConfig) VALUES 
('Hall A', 50, '{"rows": 5, "cols": 10}'),
('Lab 101', 20, '{"rows": 4, "cols": 5}');

-- Insert Students
INSERT INTO Students (UniversityID, FullName, Email, ReferencePhotoUrl) VALUES 
('S1001', 'Alice Smith', 'alice@uni.edu', '/uploads/students/s1001.jpg'),
('S1002', 'Bob Jones', 'bob@uni.edu', '/uploads/students/s1002.jpg'),
('S1003', 'Charlie Brown', 'charlie@uni.edu', '/uploads/students/s1003.jpg');

-- Insert Exams
INSERT INTO Exams (CourseCode, ExamName, StartTime, DurationMinutes, RoomID, CreatedBy) VALUES 
('CS101', 'Intro to CS Final', DATEADD(hour, 2, GETDATE()), 120, 1, 1);

-- Insert Roster
DECLARE @ExamID INT = (SELECT TOP 1 ExamID FROM Exams WHERE CourseCode = 'CS101');
DECLARE @S1 INT = (SELECT StudentID FROM Students WHERE UniversityID = 'S1001');
DECLARE @S2 INT = (SELECT StudentID FROM Students WHERE UniversityID = 'S1002');

INSERT INTO ExamRoster (ExamID, StudentID, AssignedSeat, Status) VALUES 
(@ExamID, @S1, 'A1', 'Scheduled'),
(@ExamID, @S2, 'A2', 'Scheduled');
GO
