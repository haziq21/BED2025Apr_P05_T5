IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'KampungConnect')
CREATE DATABASE KampungConnect;
GO

USE KampungConnect;
GO

IF OBJECT_ID('Friends', 'U') IS NOT NULL DROP TABLE Friends;
IF OBJECT_ID('CCAdmins', 'U') IS NOT NULL DROP TABLE CCAdmins;
IF OBJECT_ID('CCEventRegistrations', 'U') IS NOT NULL DROP TABLE CCEventRegistrations;
IF OBJECT_ID('InterestGroupProposals', 'U') IS NOT NULL DROP TABLE InterestGroupProposals;
IF OBJECT_ID('MedicalRecordDocuments', 'U') IS NOT NULL DROP TABLE MedicalRecordDocuments;
IF OBJECT_ID('MedicalRecordNotes', 'U') IS NOT NULL DROP TABLE MedicalRecordNotes;
IF OBJECT_ID('MedicalRecord', 'U') IS NOT NULL DROP TABLE MedicalRecord;
IF OBJECT_ID('MedicationScheduleTimes', 'U') IS NOT NULL DROP TABLE MedicationScheduleTimes;
IF OBJECT_ID('MedicationSchedules', 'U') IS NOT NULL DROP TABLE MedicationSchedules;
IF OBJECT_ID('LocalServices', 'U') IS NOT NULL DROP TABLE LocalServices;
IF OBJECT_ID('UserLocations', 'U') IS NOT NULL DROP TABLE UserLocations;
IF OBJECT_ID('SharedLocations', 'U') IS NOT NULL DROP TABLE SharedLocations;
IF OBJECT_ID('CCEvents', 'U') IS NOT NULL DROP TABLE CCEvents;
IF OBJECT_ID('CCs', 'U') IS NOT NULL DROP TABLE CCs;
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;
IF OBJECT_ID('Comment', 'U') IS NOT NULL DROP TABLE Comment;


CREATE TABLE Users (
  UserId INT IDENTITY PRIMARY KEY,
  Name NVARCHAR(255) NOT NULL,
  PhoneNumber VARCHAR(20) NOT NULL,
  Bio NVARCHAR(MAX),
  ProfilePhotoURL NVARCHAR(MAX)
);

CREATE TABLE Friends (
  UserId1 INT NOT NULL REFERENCES Users,
  UserId2 INT NOT NULL REFERENCES Users,
  Accepted BIT NOT NULL,
  PRIMARY KEY (UserId1, UserId2)
);

CREATE TABLE CCs (
  CCId INT IDENTITY PRIMARY KEY,
  Name NVARCHAR(255) NOT NULL,
  Location GEOGRAPHY
);

CREATE TABLE CCAdmins (
  CCId INT NOT NULL REFERENCES CCs,
  UserId INT NOT NULL REFERENCES Users,
  PRIMARY KEY (UserId, CCId)
);

CREATE TABLE CCEvents (
  EventId INT IDENTITY PRIMARY KEY,
  CCId INT NOT NULL REFERENCES CCs,
  Name NVARCHAR(255) NOT NULL,
  Description NVARCHAR(MAX),
  Location NVARCHAR(100) NOT NULL,
  StartDateTime DATETIME NOT NULL,
  EndDateTime DATETIME NOT NULL
);

CREATE TABLE CCEventRegistrations (
  EventId INT NOT NULL REFERENCES CCEvents,
  UserId INT NOT NULL REFERENCES Users,
  PRIMARY KEY (EventId, UserId)
);

CREATE TABLE InterestGroupProposals (
  ProposalId INT IDENTITY PRIMARY KEY,
  UserId INT NOT NULL REFERENCES Users,
  CCId INT NOT NULL REFERENCES CCs,
  Title NVARCHAR(255) NOT NULL,
  Description NVARCHAR(MAX),
  Accepted BIT
);

CREATE TABLE MedicalRecord (
    MedicalRecordId INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    originalName NVARCHAR(255) NOT NULL,
    fileName NVARCHAR(255) NULL,
    mimeType NVARCHAR(100),
    filePath NVARCHAR(255),
    uploadedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

CREATE TABLE MedicationSchedules (
  MedicationScheduleId INT IDENTITY PRIMARY KEY,
  DrugName NVARCHAR(255) NOT NULL,
  UserId INT NOT NULL,
  StartDateXTime DATETIME NOT NULL,
  EndDate DATE,
  RepeatRequest INT NOT NULL CHECK (RepeatRequest IN (0, 1, 2)), -- 0:no repeat, 1:repeat by day, 2: repeat by week
  RepeatEveryXDays INT,
  RepeatEveryXWeeks INT,
  RepeatWeekDate CHAR(7), -- 0000011 meaning Occurs on SAT&SUN, repeats every () weeks
  FOREIGN KEY (UserId) REFERENCES Users(UserId)
);
  

CREATE TABLE LocalServices (
  LocalServiceId INT IDENTITY PRIMARY KEY,
  Name NVARCHAR(255) NOT NULL,
  Type NVARCHAR(255) NOT NULL,
  Location GEOGRAPHY
);

CREATE TABLE UserLocations (
  UserId INT NOT NULL REFERENCES Users,
  Time DATETIME NOT NULL,
  Location GEOGRAPHY,
  PRIMARY KEY (UserId, Time)
);

CREATE TABLE SharedLocations (
  ViewingUserId INT NOT NULL REFERENCES Users,
  LocatedUserId INT NOT NULL REFERENCES Users,
  RequestAccepted BIT NOT NULL,
  PRIMARY KEY (ViewingUserId, LocatedUserId)
);


CREATE TABLE Comment (
  UserId INT NOT NULL,
  PostId INT IDENTITY PRIMARY KEY,
  Comment VARCHAR(500) NOT NULL,
  FOREIGN KEY (UserId) REFERENCES Users(UserId)
);