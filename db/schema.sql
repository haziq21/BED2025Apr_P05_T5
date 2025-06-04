IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
CREATE TABLE Users (
    UserId INT IDENTITY PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    PhoneNumber VARCHAR(20) NOT NULL,
    Bio NVARCHAR(MAX),
    ProfilePhotoURL NVARCHAR(MAX)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Friends')
CREATE TABLE Friends (
    UserId1 INT NOT NULL REFERENCES Users,
    UserId2 INT NOT NULL REFERENCES Users,
    PRIMARY KEY (UserId1, UserId2)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CCs')
CREATE TABLE CCs (
    CCId INT IDENTITY PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Location GEOGRAPHY
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CCAdmins')
CREATE TABLE CCAdmins (
    CCId INT NOT NULL REFERENCES CCs,
    UserId INT NOT NULL REFERENCES Users,
    PRIMARY KEY (UserId, CCId)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CCEvents')
CREATE TABLE CCEvents (
    EventId INT IDENTITY PRIMARY KEY,
    CCId INT NOT NULL REFERENCES CCs,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    StartDateTime DATETIME NOT NULL,
    EndDateTime DATETIME NOT NULL
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CCEventRegistrations')
CREATE TABLE CCEventRegistrations (
    EventId INT NOT NULL REFERENCES CCEvents,
    UserId INT NOT NULL REFERENCES Users,
    PRIMARY KEY (EventId, UserId)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InterestGroupProposals')
CREATE TABLE InterestGroupProposals (
    ProposalId INT IDENTITY PRIMARY KEY,
    UserId INT NOT NULL REFERENCES Users,
    CCId INT NOT NULL REFERENCES CCs,
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    Accepted BIT
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MedicalRecord')
CREATE TABLE MedicalRecord (
    MedicalRecordId INT IDENTITY PRIMARY KEY,
    UserId INT NOT NULL REFERENCES Users,
    Title NVARCHAR(255) NOT NULL
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MedicalRecordDocuments')
CREATE TABLE MedicalRecordDocuments (
    DocumentId INT IDENTITY PRIMARY KEY,
    MedicalRecordId INT NOT NULL REFERENCES MedicalRecord,
    FileURL NVARCHAR(MAX) NOT NULL
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MedicalRecordNotes')
CREATE TABLE MedicalRecordNotes (
    NoteId INT IDENTITY PRIMARY KEY,
    MedicalRecordId INT NOT NULL REFERENCES MedicalRecord,
    Content NVARCHAR(MAX) NOT NULL
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MedicationSchedules')
CREATE TABLE MedicationSchedules (
    MedicationScheduleId INT IDENTITY PRIMARY KEY,
    UserId INT NOT NULL REFERENCES Users,
    DrugName NVARCHAR(255) NOT NULL,
    DayInterval INT NOT NULL,
    Count INT NOT NULL,
    CountType NVARCHAR(50) NOT NULL CHECK (CountType IN ('days', 'times'))
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MedicationScheduleTimes')
CREATE TABLE MedicationScheduleTimes (
    MedicationScheduleId INT NOT NULL REFERENCES MedicationSchedules,
    Time TIME NOT NULL,
    PRIMARY KEY (MedicationScheduleId, Time)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LocalServices')
CREATE TABLE LocalServices (
    LocalServiceId INT IDENTITY PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Type NVARCHAR(255) NOT NULL,
    Location GEOGRAPHY
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserLocations')
CREATE TABLE UserLocations (
    UserId INT NOT NULL REFERENCES Users,
    Time DATETIME NOT NULL,
    Location GEOGRAPHY,
    PRIMARY KEY (UserId, Time)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SharedLocations')
CREATE TABLE SharedLocations (
    ViewingUserId INT NOT NULL REFERENCES Users,
    LocatedUserId INT NOT NULL REFERENCES Users,
    RequestAccepted BIT NOT NULL,
    PRIMARY KEY (ViewingUserId, LocatedUserId)
);
