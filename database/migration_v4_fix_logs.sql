-- Migration V4: Fix CheckInLogs Schema
-- Run this if you get 500 Errors during check-in verify

USE ExamSecurityDB;
GO

-- Add IsSeatCorrect if it doesn't exist
IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'IsSeatCorrect' AND Object_ID = Object_ID(N'CheckInLogs'))
BEGIN
    ALTER TABLE CheckInLogs ADD IsSeatCorrect BIT DEFAULT 0;
    PRINT 'Added IsSeatCorrect column to CheckInLogs';
END
GO
