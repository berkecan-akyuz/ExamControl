-- Database Schema for Exam Security System
-- Run this in MS SQL Server Management Studio (SSMS)

-- Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ExamSecurityDB')
BEGIN
    CREATE DATABASE ExamSecurityDB;
END
GO

USE ExamSecurityDB;
GO

-- Users Table (Admins and Proctors)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) NOT NULL CHECK (Role IN ('Admin', 'Proctor')),
    FullName NVARCHAR(100)
);

-- Students Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Students' AND xtype='U')
CREATE TABLE Students (
    StudentID INT IDENTITY(1,1) PRIMARY KEY,
    UniversityID NVARCHAR(50) NOT NULL UNIQUE,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100),
    ReferencePhotoUrl NVARCHAR(MAX), -- Path or URL to stored image
    FaceEmbedding NVARCHAR(MAX) -- Stored as JSON string if needed, or rely on client-side matching
);


-- StudentPhotos Table (Multiple Reference Images)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='StudentPhotos' AND xtype='U')
CREATE TABLE StudentPhotos (
    PhotoID INT IDENTITY(1,1) PRIMARY KEY,
    StudentID INT FOREIGN KEY REFERENCES Students(StudentID),
    PhotoUrl NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Rooms Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Rooms' AND xtype='U')
CREATE TABLE Rooms (
    RoomID INT IDENTITY(1,1) PRIMARY KEY,
    RoomName NVARCHAR(50) NOT NULL,
    Capacity INT,
    LayoutConfig NVARCHAR(MAX) -- JSON string describing rows/cols (Legacy/Cache)
);

-- Seats Table (Normalized Layout)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Seats' AND xtype='U')
CREATE TABLE Seats (
    SeatID INT IDENTITY(1,1) PRIMARY KEY,
    RoomID INT FOREIGN KEY REFERENCES Rooms(RoomID) ON DELETE CASCADE,
    RowLabel NVARCHAR(10), -- e.g., 'A', '1'
    ColLabel NVARCHAR(10), -- e.g., '1', '2'
    IsAccessible BIT DEFAULT 1, -- 1=Normal, 0=Broken/Gap
    Status NVARCHAR(20) DEFAULT 'Active' -- Active, Maintenance
);

-- Exams Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Exams' AND xtype='U')
CREATE TABLE Exams (
    ExamID INT IDENTITY(1,1) PRIMARY KEY,
    CourseCode NVARCHAR(20) NOT NULL,
    ExamName NVARCHAR(100) NOT NULL,
    StartTime DATETIME NOT NULL,
    DurationMinutes INT NOT NULL,
    RoomID INT FOREIGN KEY REFERENCES Rooms(RoomID),
    CreatedBy INT FOREIGN KEY REFERENCES Users(UserID)
);

-- ExamRoster Table (Students assigned to Exams)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ExamRoster' AND xtype='U')
CREATE TABLE ExamRoster (
    RosterID INT IDENTITY(1,1) PRIMARY KEY,
    ExamID INT FOREIGN KEY REFERENCES Exams(ExamID),
    StudentID INT FOREIGN KEY REFERENCES Students(StudentID),
    AssignedSeat NVARCHAR(20),
    Status NVARCHAR(20) DEFAULT 'Scheduled' CHECK (Status IN ('Scheduled', 'Present', 'Absent')),
    CheckInTime DATETIME,
    UNIQUE(ExamID, StudentID)
);

-- CheckInLogs Table (History of check-in attempts)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CheckInLogs' AND xtype='U')
CREATE TABLE CheckInLogs (
    LogID INT IDENTITY(1,1) PRIMARY KEY,
    RosterID INT FOREIGN KEY REFERENCES ExamRoster(RosterID),
    Timestamp DATETIME DEFAULT GETDATE(),
    MLConfidenceScore FLOAT,
    IsMatch BIT,
    IsSeatCorrect BIT,
    CapturedImagePath NVARCHAR(MAX)
);

-- Violations Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Violations' AND xtype='U')
CREATE TABLE Violations (
    ViolationID INT IDENTITY(1,1) PRIMARY KEY,
    ExamID INT FOREIGN KEY REFERENCES Exams(ExamID),
    StudentID INT FOREIGN KEY REFERENCES Students(StudentID),
    Reason NVARCHAR(100),
    Notes NVARCHAR(MAX),
    EvidenceImagePath NVARCHAR(MAX),
    ReportedAt DATETIME DEFAULT GETDATE(),
    ReportedBy INT FOREIGN KEY REFERENCES Users(UserID)
);
GO
