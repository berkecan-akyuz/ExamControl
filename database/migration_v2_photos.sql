-- Migration V2: Add StudentPhotos table for multiple reference images
USE ExamSecurityDB;
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='StudentPhotos' AND xtype='U')
CREATE TABLE StudentPhotos (
    PhotoID INT IDENTITY(1,1) PRIMARY KEY,
    StudentID INT FOREIGN KEY REFERENCES Students(StudentID),
    PhotoUrl NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- Optional: Migrate existing photos to the new table
INSERT INTO StudentPhotos (StudentID, PhotoUrl)
SELECT StudentID, ReferencePhotoUrl 
FROM Students 
WHERE ReferencePhotoUrl IS NOT NULL AND ReferencePhotoUrl <> '';
GO
