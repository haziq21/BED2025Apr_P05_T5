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

-- CREATE TABLE InterestGroupProposals (
--   ProposalId INT IDENTITY PRIMARY KEY,
--   UserId INT NOT NULL REFERENCES Users,
--   CCId INT NOT NULL REFERENCES CCs,
--   Title NVARCHAR(255) NOT NULL,
--   Description NVARCHAR(MAX),
--   Accepted BIT
-- );

-- CREATE TABLE InterestGroupProposals (
--   ProposalId INT IDENTITY PRIMARY KEY,
--   UserId INT NOT NULL REFERENCES Users,
--   CCId INT NOT NULL REFERENCES CCs,
--   Title NVARCHAR(255) NOT NULL,
--   Description NVARCHAR(MAX),
--   Email NVARCHAR(255) NOT NULL,
--   Status NVARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected
--   SubmittedAt DATETIME DEFAULT GETDATE(),
--   UpdatedAt DATETIME DEFAULT GETDATE()
-- );

CREATE TABLE InterestGroupProposals (
  ProposalId INT IDENTITY PRIMARY KEY,
  UserId INT NOT NULL REFERENCES Users,
  CCId INT NOT NULL REFERENCES CCs,
  Name NVARCHAR(255) NOT NULL,
  Description NVARCHAR(MAX),
  Email NVARCHAR(255) NOT NULL,
  Status NVARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected
  SubmittedAt DATETIME DEFAULT GETDATE(),
  UpdatedAt DATETIME DEFAULT GETDATE(),
  Scope NVARCHAR(500),
  MeetingFrequency NVARCHAR(20),
  BudgetEstimateStart INT,
  BudgetEstimateEnd INT,
  AccessibilityConsideration NVARCHAR(MAX),
  HealthSafetyPrecaution NVARCHAR(MAX),

  CONSTRAINT CK_MeetingFrequency_AllowedValues CHECK (
    MeetingFrequency IN (
      'As needed', 'Daily', 'Weekly', 'Biweekly', 'Monthly', 'Quarterly'
    )
  )
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
  Time DATETIME DEFAULT GETDATE(),
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
  TimeStamp DATETIME DEFAULT GETDATE(),
  ParentPostId INT DEFAULT -1,  -- -1 means by default its post not comment 
  FOREIGN KEY (UserId) REFERENCES Users(UserId)
);




INSERT INTO Users (Name, PhoneNumber, Bio, ProfilePhotoURL) VALUES
('Lim Wei Leong', '91234567', 'Loves hawker food and playing badminton.', 'https://example.com/weileong.jpg'),
('Tan Mei Ling', '81234567', 'Avid cyclist and volunteer at the CC.', 'https://example.com/meiling.jpg'),
('Goh Eng Chuan', '71234567', 'Enjoys prawning and visiting nature parks.', 'https://example.com/engchuan.jpg'),
('Siti Nurul Huda', '61234567', 'Bakes delicious kueh and loves community events.', 'https://example.com/siti.jpg'),
('Deepak Kumar', '51234567', 'Passionate about local history and photography.', 'https://example.com/deepak.jpg'),
('Chua Kim Seng', '41234567', 'Auntie who knows all the best kopi places.', 'https://example.com/kimseng.jpg'),
('Fiona Tan', '31234567', 'Young professional interested in tech and fitness.', 'https://example.com/fiona.jpg'),
('Marcus Lim', '21234567', 'Student who enjoys gaming and basketball.', 'https://example.com/marcus.jpg'),
('Nurul Aishah', '11234567', 'Enjoys long walks along East Coast Park.', 'https://example.com/nurul.jpg'),
('Rajesh Suppiah', '99876543', 'Uncle who plays chess at the void deck.', 'https://example.com/rajesh.jpg'),
('Kelly Ong', '88765432', 'Loves cafe hopping and exploring new estates.', 'https://example.com/kelly.jpg'),
('Zainal Bin Ahmad', '77654321', 'Community leader, always organizing events.', 'https://example.com/zainal.jpg'),
('Priya Sharma', '66543210', 'Yoga instructor and healthy living advocate.', 'https://example.com/priya.jpg'),
('Shawn Tan', '55432109', 'Loves futsal and volunteering for beach cleanups.', 'https://example.com/shawn.jpg'),
('Vanessa Lee', '44321098', 'Foodie who enjoys trying out new hawker stalls.', 'https://example.com/vanessa.jpg');


INSERT INTO Friends (UserId1, UserId2, Accepted) VALUES
((SELECT UserId FROM Users WHERE Name = 'Lim Wei Leong'), (SELECT UserId FROM Users WHERE Name = 'Tan Mei Ling'), 1),
((SELECT UserId FROM Users WHERE Name = 'Tan Mei Ling'), (SELECT UserId FROM Users WHERE Name = 'Lim Wei Leong'), 1),

((SELECT UserId FROM Users WHERE Name = 'Lim Wei Leong'), (SELECT UserId FROM Users WHERE Name = 'Goh Eng Chuan'), 1),
((SELECT UserId FROM Users WHERE Name = 'Goh Eng Chuan'), (SELECT UserId FROM Users WHERE Name = 'Lim Wei Leong'), 1),

((SELECT UserId FROM Users WHERE Name = 'Goh Eng Chuan'), (SELECT UserId FROM Users WHERE Name = 'Deepak Kumar'), 0),
((SELECT UserId FROM Users WHERE Name = 'Deepak Kumar'), (SELECT UserId FROM Users WHERE Name = 'Goh Eng Chuan'), 0),

((SELECT UserId FROM Users WHERE Name = 'Fiona Tan'), (SELECT UserId FROM Users WHERE Name = 'Nurul Aishah'), 1),
((SELECT UserId FROM Users WHERE Name = 'Nurul Aishah'), (SELECT UserId FROM Users WHERE Name = 'Fiona Tan'), 1),

((SELECT UserId FROM Users WHERE Name = 'Marcus Lim'), (SELECT UserId FROM Users WHERE Name = 'Rajesh Suppiah'), 1),
((SELECT UserId FROM Users WHERE Name = 'Rajesh Suppiah'), (SELECT UserId FROM Users WHERE Name = 'Marcus Lim'), 1),

((SELECT UserId FROM Users WHERE Name = 'Nurul Aishah'), (SELECT UserId FROM Users WHERE Name = 'Kelly Ong'), 1),
((SELECT UserId FROM Users WHERE Name = 'Kelly Ong'), (SELECT UserId FROM Users WHERE Name = 'Nurul Aishah'), 1),

((SELECT UserId FROM Users WHERE Name = 'Rajesh Suppiah'), (SELECT UserId FROM Users WHERE Name = 'Zainal Bin Ahmad'), 1),
((SELECT UserId FROM Users WHERE Name = 'Zainal Bin Ahmad'), (SELECT UserId FROM Users WHERE Name = 'Rajesh Suppiah'), 1),

((SELECT UserId FROM Users WHERE Name = 'Kelly Ong'), (SELECT UserId FROM Users WHERE Name = 'Priya Sharma'), 1),
((SELECT UserId FROM Users WHERE Name = 'Priya Sharma'), (SELECT UserId FROM Users WHERE Name = 'Kelly Ong'), 1),

((SELECT UserId FROM Users WHERE Name = 'Zainal Bin Ahmad'), (SELECT UserId FROM Users WHERE Name = 'Shawn Tan'), 1),
((SELECT UserId FROM Users WHERE Name = 'Shawn Tan'), (SELECT UserId FROM Users WHERE Name = 'Zainal Bin Ahmad'), 1),

((SELECT UserId FROM Users WHERE Name = 'Priya Sharma'), (SELECT UserId FROM Users WHERE Name = 'Vanessa Lee'), 1),
((SELECT UserId FROM Users WHERE Name = 'Vanessa Lee'), (SELECT UserId FROM Users WHERE Name = 'Priya Sharma'), 1),

((SELECT UserId FROM Users WHERE Name = 'Shawn Tan'), (SELECT UserId FROM Users WHERE Name = 'Lim Wei Leong'), 1),
((SELECT UserId FROM Users WHERE Name = 'Lim Wei Leong'), (SELECT UserId FROM Users WHERE Name = 'Shawn Tan'), 1);

INSERT INTO CCs (Name, Location) VALUES
('Bishan Community Club', geography::Point(1.349907438245468, 103.85019688185993,4326)),
('Tampines West Community Club', geography::Point(1.3490847641706871, 103.93557379481, 4326)),
('Jurong Green Community Club', geography::Point(1.3507590157469045, 103.72531376782432, 4326)),
('Ang Mo Kio Community Club', geography::Point(1.3676516078119032, 103.840533407364, 4326)),
('Clementi Community Club', geography::Point(1.3184393871172868, 103.7678135435397, 4326)),
('Serangoon Community Club', geography::Point(1.3702344336146253, 103.87396023713858, 4326)),
('Bedok Community Club', geography::Point(1.3249335994225218, 103.93598785204526, 4326)),
('Queenstown Community Club', geography::Point(1.299042472435749, 103.80153240830296, 4326)),
('Geylang West Community Club', geography::Point(1.3165672364731793, 103.87224872270684, 4326)),
('Sengkang Community Club', geography::Point(1.393068617238819, 103.89405165248134, 4326)),
('Marsiling Community Club', geography::Point(1.4410840834159733, 103.7737336997106, 4326)),
('Nee Soon Central Community Club', geography::Point(1.427566699811016, 103.83636595284976, 4326)),
('Punggol Community Club', geography::Point(1.377798333672588, 103.891378239072, 4326)),
('Choa Chu Kang Community Club', geography::Point(1.3813378586731735, 103.75187195248142, 4326)),
('Joo Chiat Community Club', geography::Point(1.3083585394999246, 103.90394133804972, 4326));


INSERT INTO CCAdmins (CCId, UserId) VALUES
((SELECT CCId FROM CCs WHERE Name = 'Bishan Community Club'), (SELECT UserId FROM Users WHERE Name = 'Lim Wei Leong')),
((SELECT CCId FROM CCs WHERE Name = 'Tampines West Community Club'), (SELECT UserId FROM Users WHERE Name = 'Tan Mei Ling')),
((SELECT CCId FROM CCs WHERE Name = 'Jurong Green Community Club'), (SELECT UserId FROM Users WHERE Name = 'Goh Eng Chuan')),
((SELECT CCId FROM CCs WHERE Name = 'Ang Mo Kio Community Club'), (SELECT UserId FROM Users WHERE Name = 'Siti Nurul Huda')),
((SELECT CCId FROM CCs WHERE Name = 'Clementi Community Club'), (SELECT UserId FROM Users WHERE Name = 'Deepak Kumar')),
((SELECT CCId FROM CCs WHERE Name = 'Serangoon Community Club'), (SELECT UserId FROM Users WHERE Name = 'Chua Kim Seng')),
((SELECT CCId FROM CCs WHERE Name = 'Bedok Community Club'), (SELECT UserId FROM Users WHERE Name = 'Fiona Tan')),
((SELECT CCId FROM CCs WHERE Name = 'Queenstown Community Club'), (SELECT UserId FROM Users WHERE Name = 'Marcus Lim')),
((SELECT CCId FROM CCs WHERE Name = 'Geylang West Community Club'), (SELECT UserId FROM Users WHERE Name = 'Nurul Aishah')),
((SELECT CCId FROM CCs WHERE Name = 'Sengkang Community Club'), (SELECT UserId FROM Users WHERE Name = 'Rajesh Suppiah')),
((SELECT CCId FROM CCs WHERE Name = 'Nee Soon Central Community Club'), (SELECT UserId FROM Users WHERE Name = 'Kelly Ong')),
((SELECT CCId FROM CCs WHERE Name = 'Marsiling Community Club'), (SELECT UserId FROM Users WHERE Name = 'Zainal Bin Ahmad')),
((SELECT CCId FROM CCs WHERE Name = 'Punggol Community Club'), (SELECT UserId FROM Users WHERE Name = 'Priya Sharma')),
((SELECT CCId FROM CCs WHERE Name = 'Choa Chu Kang Community Club'), (SELECT UserId FROM Users WHERE Name = 'Shawn Tan')),
((SELECT CCId FROM CCs WHERE Name = 'Joo Chiat Community Club'), (SELECT UserId FROM Users WHERE Name = 'Vanessa Lee'));


INSERT INTO CCEvents (CCId, Name, Description, Location, StartDateTime, EndDateTime) VALUES
((SELECT CCId FROM CCs WHERE Name = 'Bishan Community Club'), 'Kampung Connect Bazaar', 'A lively bazaar featuring local crafts and food stalls.', 'Bishan ActiveSG Centre', '2025-08-01 10:00:00', '2025-08-01 20:00:00'),
((SELECT CCId FROM CCs WHERE Name = 'Tampines West Community Club'), 'Kopi & Teh Appreciation Workshop', 'Learn about local coffee and tea brewing techniques.', 'Tampines Hub Library', '2025-08-05 14:00:00', '2025-08-05 16:00:00'),
((SELECT CCId FROM CCs WHERE Name = 'Jurong Green Community Club'), 'Dragon Boat Festival Celebration', 'Cultural performances and traditional games.', 'Jurong Lake Gardens', '2025-08-10 10:00:00', '2025-08-10 17:00:00'),
((SELECT CCId FROM CCs WHERE Name = 'Ang Mo Kio Community Club'), 'Healthy Hawker Food Tour', 'Explore healthy options at local hawker centres.', 'AMK Food Centre', '2025-08-15 09:00:00', '2025-08-15 12:00:00'),
((SELECT CCId FROM CCs WHERE Name = 'Clementi Community Club'), 'Peranakan Culture Showcase', 'Experience Peranakan heritage through food and crafts.', 'Peranakan Museum', '2025-08-20 15:00:00', '2025-08-20 18:00:00'),
((SELECT CCId FROM CCs WHERE Name = 'Serangoon Community Club'), 'Community Futsal Tournament', 'Friendly futsal competition for all ages.', 'Serangoon Sports Centre', '2025-08-25 18:00:00', '2025-08-25 22:00:00'),
((SELECT CCId FROM CCs WHERE Name = 'Bedok Community Club'), 'Durian Appreciation Session', 'Taste various durian types and learn about them.', 'Bedok Market Square', '2025-09-01 19:00:00', '2025-09-01 21:00:00'),
((SELECT CCId FROM CCs WHERE Name = 'Queenstown Community Club'), 'Intergenerational Play Session', 'Grandparents and grandchildren playing traditional games.', 'Queenstown Family Park', '2025-09-05 10:00:00', '2025-09-05 12:00:00'),
((SELECT CCId FROM CCs WHERE Name = 'Geylang West Community Club'), 'Hari Raya Light-Up Event', 'Celebration with cultural performances and food.', 'Geylang Serai Market', '2025-09-10 19:00:00', '2025-09-10 22:00:00'),
((SELECT CCId FROM CCs WHERE Name = 'Sengkang Community Club'), 'Bubble Tea Making Workshop', 'Learn to concoct your own bubble tea.', 'Sengkang Community Kitchen', '2025-09-15 14:00:00', '2025-09-15 16:00:00'),
((SELECT CCId FROM CCs WHERE Name = 'Nee Soon Central Community Club'), 'Kampung Games Day', 'Relive traditional kampung games like chapteh and five stones.', 'Nee Soon Central Community Club Lv2', '2025-09-20 10:00:00', '2025-09-20 13:00:00'),
((SELECT CCId FROM CCs WHERE Name = 'Marsiling Community Club'), 'Cat Adoption Drive', 'Find a feline friend from local shelters.', 'Marsiling Community Club', '2025-09-25 11:00:00', '2025-09-25 16:00:00'),
((SELECT CCId FROM CCs WHERE Name = 'Punggol Community Club'), 'Kayaking in Punggol Waterway', 'Guided kayaking tour for beginners.', 'Punggol Waterway Park', '2025-10-01 08:00:00', '2025-10-01 10:00:00'),
((SELECT CCId FROM CCs WHERE Name = 'Choa Chu Kang Community Club'), 'Sustainable Living Fair', 'Showcasing eco-friendly products and practices.', 'CCK Green Hub', '2025-10-05 09:00:00', '2025-10-05 17:00:00'),
((SELECT CCId FROM CCs WHERE Name = 'Joo Chiat Community Club'), 'Beach Cleanup & Picnic', 'Contribute to a cleaner beach and enjoy a picnic.', 'East Coast Park (Area D)', '2025-10-10 08:30:00', '2025-10-10 12:30:00');


INSERT INTO CCEventRegistrations (EventId, UserId) VALUES
((SELECT EventId FROM CCEvents WHERE Name = 'Kampung Connect Bazaar'), (SELECT UserId FROM Users WHERE Name = 'Lim Wei Leong')),
((SELECT EventId FROM CCEvents WHERE Name = 'Kopi & Teh Appreciation Workshop'), (SELECT UserId FROM Users WHERE Name = 'Tan Mei Ling')),
((SELECT EventId FROM CCEvents WHERE Name = 'Dragon Boat Festival Celebration'), (SELECT UserId FROM Users WHERE Name = 'Goh Eng Chuan')),
((SELECT EventId FROM CCEvents WHERE Name = 'Healthy Hawker Food Tour'), (SELECT UserId FROM Users WHERE Name = 'Siti Nurul Huda')),
((SELECT EventId FROM CCEvents WHERE Name = 'Peranakan Culture Showcase'), (SELECT UserId FROM Users WHERE Name = 'Deepak Kumar')),
((SELECT EventId FROM CCEvents WHERE Name = 'Community Futsal Tournament'), (SELECT UserId FROM Users WHERE Name = 'Chua Kim Seng')),
((SELECT EventId FROM CCEvents WHERE Name = 'Durian Appreciation Session'), (SELECT UserId FROM Users WHERE Name = 'Fiona Tan')),
((SELECT EventId FROM CCEvents WHERE Name = 'Intergenerational Play Session'), (SELECT UserId FROM Users WHERE Name = 'Marcus Lim')),
((SELECT EventId FROM CCEvents WHERE Name = 'Hari Raya Light-Up Event'), (SELECT UserId FROM Users WHERE Name = 'Nurul Aishah')),
((SELECT EventId FROM CCEvents WHERE Name = 'Bubble Tea Making Workshop'), (SELECT UserId FROM Users WHERE Name = 'Rajesh Suppiah')),
((SELECT EventId FROM CCEvents WHERE Name = 'Kampung Games Day'), (SELECT UserId FROM Users WHERE Name = 'Kelly Ong')),
((SELECT EventId FROM CCEvents WHERE Name = 'Cat Adoption Drive'), (SELECT UserId FROM Users WHERE Name = 'Zainal Bin Ahmad')),
((SELECT EventId FROM CCEvents WHERE Name = 'Kayaking in Punggol Waterway'), (SELECT UserId FROM Users WHERE Name = 'Priya Sharma')),
((SELECT EventId FROM CCEvents WHERE Name = 'Sustainable Living Fair'), (SELECT UserId FROM Users WHERE Name = 'Shawn Tan')),
((SELECT EventId FROM CCEvents WHERE Name = 'Beach Cleanup & Picnic'), (SELECT UserId FROM Users WHERE Name = 'Vanessa Lee'));

-- NEED NEW SAMPLE DATA !!
-- INSERT INTO InterestGroupProposals (UserId, CCId, Title, Description, Accepted) VALUES
-- ((SELECT UserId FROM Users WHERE Name = 'Lim Wei Leong'), (SELECT CCId FROM CCs WHERE Name = 'Bishan Community Club'), 'Hawker Food Explorers', 'A group to explore and review new and old hawker gems.', 1),
-- ((SELECT UserId FROM Users WHERE Name = 'Tan Mei Ling'), (SELECT CCId FROM CCs WHERE Name = 'Tampines West Community Club'), 'Cycling Kakis', 'Group cycling sessions around Singapore parks and PCNs.', 0),
-- ((SELECT UserId FROM Users WHERE Name = 'Goh Eng Chuan'), (SELECT CCId FROM CCs WHERE Name = 'Jurong Green Community Club'), 'Prawning Enthusiasts', 'Meetups for prawning and sharing tips and tricks.', 1),
-- ((SELECT UserId FROM Users WHERE Name = 'Siti Nurul Huda'), (SELECT CCId FROM CCs WHERE Name = 'Ang Mo Kio Community Club'), 'Kueh Baking Workshop', 'Learn to bake traditional Malay and Peranakan kueh.', 1),
-- ((SELECT UserId FROM Users WHERE Name = 'Deepak Kumar'), (SELECT CCId FROM CCs WHERE Name = 'Clementi Community Club'), 'Heritage Trail Blazers', 'Organized walks to uncover the hidden history of Singapore neighbourhoods.', 0),
-- ((SELECT UserId FROM Users WHERE Name = 'Chua Kim Seng'), (SELECT CCId FROM CCs WHERE Name = 'Serangoon Community Club'), 'Kopi & Teh O''clock', 'A social group for seniors to chat over kopi/teh.', 1),
-- ((SELECT UserId FROM Users WHERE Name = 'Fiona Tan'), (SELECT CCId FROM CCs WHERE Name = 'Bedok Community Club'), 'Tech & Tiong', 'Casual discussions about new tech gadgets and trends.', 1),
-- ((SELECT UserId FROM Users WHERE Name = 'Marcus Lim'), (SELECT CCId FROM CCs WHERE Name = 'Queenstown Community Club'), 'Basketball Pick-up Games', 'Organize friendly basketball matches at local courts.', 0),
-- ((SELECT UserId FROM Users WHERE Name = 'Nurul Aishah'), (SELECT CCId FROM CCs WHERE Name = 'Geylang West Community Club'), 'Nature Photography Walks', 'Capturing Singapore''s flora and fauna.', 1),
-- ((SELECT UserId FROM Users WHERE Name = 'Rajesh Suppiah'), (SELECT CCId FROM CCs WHERE Name = 'Sengkang Community Club'), 'Void Deck Chess Club', 'Regular chess games and strategy sharing at the void deck.', 1),
-- ((SELECT UserId FROM Users WHERE Name = 'Kelly Ong'), (SELECT CCId FROM CCs WHERE Name = 'Nee Soon Central Community Club'), 'Cafe Hopping Crew', 'Exploring new cafes and reviewing their food and ambiance.', 0),
-- ((SELECT UserId FROM Users WHERE Name = 'Zainal Bin Ahmad'), (SELECT CCId FROM CCs WHERE Name = 'Marsiling Community Club'), 'Kampung Spirit Volunteers', 'A group dedicated to organizing community clean-ups and aid.', 1),
-- ((SELECT UserId FROM Users WHERE Name = 'Priya Sharma'), (SELECT CCId FROM CCs WHERE Name = 'Punggol Community Club'), 'Yoga by the Water', 'Outdoor yoga sessions along the Punggol Waterway.', 1),
-- ((SELECT UserId FROM Users WHERE Name = 'Shawn Tan'), (SELECT CCId FROM CCs WHERE Name = 'Choa Chu Kang Community Club'), 'Beach Clean-up Warriors', 'Regular trips to clean up Singapore''s beaches.', 0),
-- ((SELECT UserId FROM Users WHERE Name = 'Vanessa Lee'), (SELECT CCId FROM CCs WHERE Name = 'Joo Chiat Community Club'), 'Food Blogging & Reviewers', 'For foodies who love to eat, review, and share their experiences.', 1);


INSERT INTO MedicalRecord (UserId, originalName, fileName, mimeType, filePath) VALUES
((SELECT UserId FROM Users WHERE Name = 'Lim Wei Leong'), 'Wei_Leong_Health_Checkup_2024.pdf', 'weileong_hc_2024.pdf', 'application/pdf', '/medical_records/weileong_hc_2024.pdf'),
((SELECT UserId FROM Users WHERE Name = 'Tan Mei Ling'), 'Mei_Ling_Blood_Test_2023.jpg', 'meiling_bt_2023.jpg', 'image/jpeg', '/medical_records/meiling_bt_2023.jpg'),
((SELECT UserId FROM Users WHERE Name = 'Goh Eng Chuan'), 'Eng_Chuan_Dental_Scan_2025.png', 'engchuan_ds_2025.png', 'image/png', '/medical_records/engchuan_ds_2025.png'),
((SELECT UserId FROM Users WHERE Name = 'Siti Nurul Huda'), 'Siti_Vaccination_Booklet.pdf', 'siti_vacc_bk.pdf', 'application/pdf', '/medical_records/siti_vacc_bk.pdf'),
((SELECT UserId FROM Users WHERE Name = 'Deepak Kumar'), 'Deepak_Allergy_List.txt', 'deepak_allergy.txt', 'text/plain', '/medical_records/deepak_allergy.txt'),
((SELECT UserId FROM Users WHERE Name = 'Chua Kim Seng'), 'Kim_Seng_Eye_Test_Report.pdf', 'kimseng_eye_test.pdf', 'application/pdf', '/medical_records/kimseng_eye_test.pdf'),
((SELECT UserId FROM Users WHERE Name = 'Fiona Tan'), 'Fiona_Annual_Checkup_2024.jpg', 'fiona_ac_2024.jpg', 'image/jpeg', '/medical_records/fiona_ac_2024.jpg'),
((SELECT UserId FROM Users WHERE Name = 'Marcus Lim'), 'Marcus_Sports_Injury_MRI.pdf', 'marcus_si_mri.pdf', 'application/pdf', '/medical_records/marcus_si_mri.pdf'),
((SELECT UserId FROM Users WHERE Name = 'Nurul Aishah'), 'Nurul_Health_Screen_Results.pdf', 'nurul_hs_results.pdf', 'application/pdf', '/medical_records/nurul_hs_results.pdf'),
((SELECT UserId FROM Users WHERE Name = 'Rajesh Suppiah'), 'Rajesh_Knee_XRay.jpg', 'rajesh_knee_xray.jpg', 'image/jpeg', '/medical_records/rajesh_knee_xray.jpg'),
((SELECT UserId FROM Users WHERE Name = 'Kelly Ong'), 'Kelly_Physiotherapy_Report.pdf', 'kelly_pt_report.pdf', 'application/pdf', '/medical_records/kelly_pt_report.pdf'),
((SELECT UserId FROM Users WHERE Name = 'Zainal Bin Ahmad'), 'Zainal_Medication_History.pdf', 'zainal_med_hist.pdf', 'application/pdf', '/medical_records/zainal_med_hist.pdf'),
((SELECT UserId FROM Users WHERE Name = 'Priya Sharma'), 'Priya_Yoga_Injury_Report.png', 'priya_yi_report.png', 'image/png', '/medical_records/priya_yi_report.png'),
((SELECT UserId FROM Users WHERE Name = 'Shawn Tan'), 'Shawn_Flu_Vacc_Record.pdf', 'shawn_flu_vacc.pdf', 'application/pdf', '/medical_records/shawn_flu_vacc.pdf'),
((SELECT UserId FROM Users WHERE Name = 'Vanessa Lee'), 'Vanessa_Dietitian_Notes.pdf', 'vanessa_diet_notes.pdf', 'application/pdf', '/medical_records/vanessa_diet_notes.pdf');


INSERT INTO MedicationSchedules (DrugName, UserId, StartDateXTime, EndDate, RepeatRequest, RepeatEveryXDays, RepeatEveryXWeeks, RepeatWeekDate) VALUES
('Panadol', (SELECT UserId FROM Users WHERE Name = 'Lim Wei Leong'), '2025-07-11T11:30:00.000', '2025-11-22', 1, 1, NULL, NULL),
('Brufen', (SELECT UserId FROM Users WHERE Name = 'Tan Mei Ling'), '2025-07-10T12:00:00.000', '2025-07-23', 1, 2, NULL, NULL),
('Antibiotics', (SELECT UserId FROM Users WHERE Name = 'Goh Eng Chuan'), '2025-07-17T09:00:00.000', NULL, 0, NULL, NULL, NULL),
('Antihistamine', (SELECT UserId FROM Users WHERE Name = 'Siti Nurul Huda'), '2025-07-13T10:00:00.000', '2025-08-18', 1, 1, NULL, NULL),
('Blood Pressure Med', (SELECT UserId FROM Users WHERE Name = 'Deepak Kumar'), '2025-07-10T07:00:00.000', NULL, 2, NULL, 2, '0000011'),
('Cholesterol Med', (SELECT UserId FROM Users WHERE Name = 'Chua Kim Seng'), '2025-07-14T20:00:00.000', NULL, 1, 1, NULL, NULL),
('Thyroid Med', (SELECT UserId FROM Users WHERE Name = 'Fiona Tan'), '2025-07-21T06:00:00.000', NULL, 1, 1, NULL, NULL),
('Inhaler', (SELECT UserId FROM Users WHERE Name = 'Marcus Lim'), '2025-07-22T14:00:00.000', NULL, 0, NULL, NULL, NULL),
('Gastric Med', (SELECT UserId FROM Users WHERE Name = 'Nurul Aishah'), '2025-07-23T08:30:00.000', '2025-07-20', 1, 1, NULL, NULL),
('Diabetic Med', (SELECT UserId FROM Users WHERE Name = 'Rajesh Suppiah'), '2025-07-24T18:00:00.000', NULL, 1, 1, NULL, NULL),
('Diuretic', (SELECT UserId FROM Users WHERE Name = 'Kelly Ong'), '2025-07-25T09:00:00.000', NULL, 2, NULL, 1, '1001010'),
('Nerve Pain Med', (SELECT UserId FROM Users WHERE Name = 'Zainal Bin Ahmad'), '2025-07-26T11:00:00.000', NULL, 0, NULL, NULL, NULL),
('Antidepressant', (SELECT UserId FROM Users WHERE Name = 'Priya Sharma'), '2025-07-27T07:30:00.000', NULL, 1, 1, NULL, NULL),
('Steroids', (SELECT UserId FROM Users WHERE Name = 'Shawn Tan'), '2025-07-28T08:00:00.000', '2025-08-11', 1, 1, NULL, NULL),
('Sleeping Pills', (SELECT UserId FROM Users WHERE Name = 'Vanessa Lee'), '2025-07-29T19:00:00.000', NULL, 1, 1, NULL, NULL);


INSERT INTO LocalServices (Name, Type, Location) VALUES
('SingHealth Polyclinics @ Punggol', 'Healthcare', geography::Point(1.4029876928229805, 103.91279285248129, 4326)),
('Our Tampines Hub', 'Community Hub', geography::Point(1.3531379739861755, 103.93958795063145, 4326)),
('Jurong Point', 'Shopping Centre', geography::Point(1.3398622835876262, 103.70674042364573, 4326)),
('AMK Hub', 'Shopping Centre', geography::Point(1.3692489914049568, 103.84817012364564, 4326)),
('Clementi Mall', 'Shopping Centre', geography::Point(1.31504671080733, 103.76437326782434, 4326)),
('NEX', 'Shopping Centre', geography::Point(1.350930015731627, 103.87191740645282, 4326)),
('Bedok Mall', 'Shopping Centre', geography::Point(1.3250165257690405, 103.92936445248142, 4326)),
('ABC Brickworks Market & Food Centre', 'Hawker Centre', geography::Point(1.2871192212966118, 103.808198010153, 4326)),
('Geylang Serai Market', 'Market', geography::Point(1.3170287267425067, 103.89831961015288, 4326)),
('Sengkang Community Hospital', 'Healthcare', geography::Point(1.3964970988683112, 103.89113559985526, 4326)),
('Woodlands North Plaza', 'Shopping Centre', geography::Point(1.4428282800738934, 103.7906689217955, 4326)),
('Khoo Teck Puat Hospital', 'Healthcare', geography::Point(1.4245546110640734, 103.83864433898842, 4326)),
('Punggol Oasis Terraces', 'Shopping Centre', geography::Point(1.4028231597674234, 103.91286032179556, 4326)),
('Lot One Shoppers', 'Shopping Centre', geography::Point(1.3853957668198382, 103.74500002549564, 4326)),
('Parkway Parade', 'Shopping Centre', geography::Point(1.3015243061946873, 103.90527621519816, 4326));


INSERT INTO UserLocations (UserId,Location) VALUES
((SELECT UserId FROM Users WHERE Name = 'Lim Wei Leong'), geography::Point(1.3507, 103.8488, 4326)),
((SELECT UserId FROM Users WHERE Name = 'Tan Mei Ling'), geography::Point(1.3468, 103.9407, 4326)),
((SELECT UserId FROM Users WHERE Name = 'Goh Eng Chuan'), geography::Point(1.3323, 103.7423, 4326)),
((SELECT UserId FROM Users WHERE Name = 'Siti Nurul Huda'), geography::Point(1.3704, 103.8475, 4326)),
((SELECT UserId FROM Users WHERE Name = 'Deepak Kumar'), geography::Point(1.3150, 103.7656, 4326)),
((SELECT UserId FROM Users WHERE Name = 'Chua Kim Seng'), geography::Point(1.3656, 103.8756, 4326)),
((SELECT UserId FROM Users WHERE Name = 'Fiona Tan'), geography::Point(1.3262, 103.9317, 4326)),
((SELECT UserId FROM Users WHERE Name = 'Marcus Lim'), geography::Point(1.2936, 103.7909, 4326)),
((SELECT UserId FROM Users WHERE Name = 'Nurul Aishah'), geography::Point(1.3149, 103.8967, 4326)),
((SELECT UserId FROM Users WHERE Name = 'Rajesh Suppiah'), geography::Point(1.3892, 103.8931, 4326)),
((SELECT UserId FROM Users WHERE Name = 'Kelly Ong'), geography::Point(1.4363, 103.7862, 4326)),
((SELECT UserId FROM Users WHERE Name = 'Zainal Bin Ahmad'), geography::Point(1.4293, 103.8351, 4326)),
((SELECT UserId FROM Users WHERE Name = 'Priya Sharma'), geography::Point(1.3999, 103.9069, 4326)),
((SELECT UserId FROM Users WHERE Name = 'Shawn Tan'), geography::Point(1.3831, 103.7441, 4326)),
((SELECT UserId FROM Users WHERE Name = 'Vanessa Lee'), geography::Point(1.2942, 103.9056, 4326));


INSERT INTO SharedLocations (ViewingUserId, LocatedUserId, RequestAccepted) VALUES
((SELECT UserId FROM Users WHERE Name = 'Lim Wei Leong'), (SELECT UserId FROM Users WHERE Name = 'Tan Mei Ling'), 1),
((SELECT UserId FROM Users WHERE Name = 'Vanessa Lee'), (SELECT UserId FROM Users WHERE Name = 'Goh Eng Chuan'), 0),
((SELECT UserId FROM Users WHERE Name = 'Tan Mei Ling'), (SELECT UserId FROM Users WHERE Name = 'Siti Nurul Huda'), 1),
((SELECT UserId FROM Users WHERE Name = 'Goh Eng Chuan'), (SELECT UserId FROM Users WHERE Name = 'Deepak Kumar'), 1),
((SELECT UserId FROM Users WHERE Name = 'Siti Nurul Huda'), (SELECT UserId FROM Users WHERE Name = 'Chua Kim Seng'), 0),
((SELECT UserId FROM Users WHERE Name = 'Deepak Kumar'), (SELECT UserId FROM Users WHERE Name = 'Fiona Tan'), 1),
((SELECT UserId FROM Users WHERE Name = 'Chua Kim Seng'), (SELECT UserId FROM Users WHERE Name = 'Marcus Lim'), 1),
((SELECT UserId FROM Users WHERE Name = 'Fiona Tan'), (SELECT UserId FROM Users WHERE Name = 'Nurul Aishah'), 0),
((SELECT UserId FROM Users WHERE Name = 'Marcus Lim'), (SELECT UserId FROM Users WHERE Name = 'Rajesh Suppiah'), 1),
((SELECT UserId FROM Users WHERE Name = 'Nurul Aishah'), (SELECT UserId FROM Users WHERE Name = 'Kelly Ong'), 1),
((SELECT UserId FROM Users WHERE Name = 'Rajesh Suppiah'), (SELECT UserId FROM Users WHERE Name = 'Zainal Bin Ahmad'), 0),
((SELECT UserId FROM Users WHERE Name = 'Kelly Ong'), (SELECT UserId FROM Users WHERE Name = 'Priya Sharma'), 1),
((SELECT UserId FROM Users WHERE Name = 'Zainal Bin Ahmad'), (SELECT UserId FROM Users WHERE Name = 'Shawn Tan'), 1),
((SELECT UserId FROM Users WHERE Name = 'Priya Sharma'), (SELECT UserId FROM Users WHERE Name = 'Vanessa Lee'), 0),
((SELECT UserId FROM Users WHERE Name = 'Shawn Tan'), (SELECT UserId FROM Users WHERE Name = 'Lim Wei Leong'), 1);


INSERT INTO Comment (UserId, Comment) VALUES
((SELECT UserId FROM Users WHERE Name = 'Lim Wei Leong'), 'Shiok! The Kampung Connect Bazaar was awesome!'),
((SELECT UserId FROM Users WHERE Name = 'Tan Mei Ling'), 'Learned so much at the Kopi & Teh workshop. Can make my own kopi-o now!'),
((SELECT UserId FROM Users WHERE Name = 'Goh Eng Chuan'), 'Dragon Boat Festival celebration was so vibrant. Good vibes!'),
((SELECT UserId FROM Users WHERE Name = 'Siti Nurul Huda'), 'The healthy hawker food tour showed me so many hidden gems. Sedap!'),
((SELECT UserId FROM Users WHERE Name = 'Deepak Kumar'), 'Peranakan culture showcase was truly enriching. Loved the intricate kebaya!'),
((SELECT UserId FROM Users WHERE Name = 'Chua Kim Seng'), 'Futsal tournament was so intense! Good workout.'),
((SELECT UserId FROM Users WHERE Name = 'Fiona Tan'), 'Durian session was mind-blowing! So many varieties.'),
((SELECT UserId FROM Users WHERE Name = 'Marcus Lim'), 'Had a great time playing traditional games with my grandparents!'),
((SELECT UserId FROM Users WHERE Name = 'Nurul Aishah'), 'The Hari Raya Light-Up was beautiful. Feeling the festive spirit!'),
((SELECT UserId FROM Users WHERE Name = 'Rajesh Suppiah'), 'My homemade bubble tea from the workshop turned out pretty good!'),
((SELECT UserId FROM Users WHERE Name = 'Kelly Ong'), 'Kampung Games Day brought back so many childhood memories!'),
((SELECT UserId FROM Users WHERE Name = 'Zainal Bin Ahmad'), 'Happy to see so many cats finding their furever homes!'),
((SELECT UserId FROM Users WHERE Name = 'Priya Sharma'), 'Kayaking in Punggol Waterway was so peaceful and refreshing.'),
((SELECT UserId FROM Users WHERE Name = 'Shawn Tan'), 'The Sustainable Living Fair gave me so many ideas for reducing waste.'),
((SELECT UserId FROM Users WHERE Name = 'Vanessa Lee'), 'Great initiative with the beach cleanup! Let''s keep our beaches clean.');