USE ExamSecurityDB;
GO

-- 1. Create Seats Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Seats' AND xtype='U')
CREATE TABLE Seats (
    SeatID INT IDENTITY(1,1) PRIMARY KEY,
    RoomID INT FOREIGN KEY REFERENCES Rooms(RoomID) ON DELETE CASCADE,
    RowLabel NVARCHAR(10), -- e.g., 'A', '1'
    ColLabel NVARCHAR(10), -- e.g., '1', '2'
    IsAccessible BIT DEFAULT 1, -- 1=Normal, 0=Broken/Gap
    Status NVARCHAR(20) DEFAULT 'Active' -- Active, Maintenance
);
GO

-- 2. (Optional) We keep LayoutConfig in Rooms for legacy support or easy grid caching, 
-- but ideally we should migrate data. For this refactor, we will focus on new rooms using Seats.
