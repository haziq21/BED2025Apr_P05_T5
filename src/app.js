import express from "express";
import multer from "multer"; // to read files
import { errorHandler } from "./middleware/error.js";
import upload from "./middleware/upload.js";
import * as auth from "./controllers/auth.js";
import * as profile from "./controllers/profile.js";
import * as cc from "./controllers/cc.js";
import * as friends from "./controllers/friends.js";
import * as events from "./controllers/events.js";
import { verifyJWT } from "./middleware/auth.js";
import * as comment from "./controllers/comment.js";
import * as medicalRecordsController from "./controllers/medicalRecordsController.js";
import * as mediSchedule from "./controllers/medicationSchedule.js";
import * as mediValidate from "./middleware/medicationScheduleValidation.js";
import * as reminderCron from "./cron/reminderCron.js";
import { sentiment } from "./controllers/sentiment.js";
import { getOAuthClient, getAuthUrl } from "./utils/googleAuth.js";
import * as googleCalendar from "./controllers/googleCalendar.js";
import * as map from "./controllers/map.js";
import * as interestGroupUserController from "./controllers/interestGroupUserController.js";
import * as interestGroupAdminController from "./controllers/interestGroupAdminController.js";
import * as gmailController from "./controllers/gmailController.js";

import pool from "./db.js";
const PORT = process.env.PORT || 3000;
const app = express();
// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log("Incoming Request:", req.method, req.url);
  next();
});
app.use(express.json());

app.use("/uploads", express.static("uploads"));
app.use(express.static("src/public"));

// Authentication
app.post("/api/auth/otp", auth.sendOTP);
app.post("/api/auth/verify", auth.verifyOTP);
app.post("/api/auth/user", auth.createUser);
app.post("/api/auth/login", auth.login);
app.get("/api/profile", verifyJWT, profile.getProfile);
app.put("/api/profile", verifyJWT, profile.updateProfile);
app.delete("/api/profile", verifyJWT, profile.deleteUser);
app.delete("/api/profile/picture", verifyJWT, profile.deleteProfilePicture);
app.post(
  "/api/profile/upload",
  verifyJWT,
  upload.single("image"),
  profile.uploadProfilePicture
);

// CC management
app.get("/api/cc", verifyJWT, cc.getAllCCs);
app.get("/api/cc/:id", verifyJWT, cc.getCCById);
app.post("/api/cc", verifyJWT, cc.createCC);
app.patch("/api/cc/:id", verifyJWT, cc.updateCC);
app.delete("/api/cc/:id", verifyJWT, cc.deleteCC);
app.get("/api/cc/:id/admins", verifyJWT, cc.getAdmins);
app.post("/api/cc/:id/admins/:userId", verifyJWT, cc.makeAdmin);
app.delete("/api/cc/:id/admins/:userId", verifyJWT, cc.removeAdmin);

// Medical Record Management
app.post("/api/medicalRecords", verifyJWT, medicalRecordsController.uploadFile);
app.get("/api/medicalRecords", verifyJWT, medicalRecordsController.getFiles);
app.delete(
  "/api/medicalRecords:MedicalRecordId",
  verifyJWT,
  medicalRecordsController.deleteFile
);
app.put(
  "/api/medicalRecords/:MedicalRecordId",
  verifyJWT,
  medicalRecordsController.updateFileName
);

// Medication Schedule
app.get("/api/medicationSchedule", verifyJWT, mediSchedule.getMediSchedule);
app.post(
  "/api/medicationSchedule",
  verifyJWT,
  mediValidate.validateSchedule,
  mediSchedule.createSchedule
);
app.put(
  "/api/medicationSchedule",
  verifyJWT,
  mediValidate.validateSchedule,
  mediSchedule.updateSchedule
);
app.delete(
  "/api/medicationSchedule/:scheduleId",
  verifyJWT,
  mediValidate.validateScheduleId,
  mediSchedule.deleteSchedule
);

//Comment
app.get("/api/comment", verifyJWT, comment.getComment);
app.get("/api/comment/getReply/:postId", verifyJWT, comment.getCommentByOthers);
app.get("/api/comment/byuser", verifyJWT, comment.getCommentById);
app.post("/api/comment", verifyJWT, comment.createComment);
app.put("/api/comment", verifyJWT, comment.updateComment);
app.delete("/api/comment/:postId", verifyJWT, comment.deleteComment);

//Friends management
app.get("/api/friends", verifyJWT, friends.getAllFriends);
app.get("/api/friends/search", verifyJWT, friends.searchUsers);
app.get("/api/friends/requests", verifyJWT, friends.getPendingFriendRequests);
app.get("/api/friends/status/:friendId", verifyJWT, friends.getFriendStatus);
app.get("/api/friends/:friendId/public", verifyJWT, friends.getPublicProfile);
app.post(
  "/api/friends/requests/:friendId",
  verifyJWT,
  friends.acceptFriendRequest
);
app.post("/api/friends/:friendId", verifyJWT, friends.sendFriendRequest);
app.delete("/api/friends/:friendId", verifyJWT, friends.deleteFriend);

// Events management
app.get("/api/events/registered", verifyJWT, events.getEventsByUserId);
app.get("/api/events/:eventId", verifyJWT, events.getEventById);
app.put("/api/events/:eventId", verifyJWT, events.updateEvent);
app.get(
  "/api/events/:eventId/registrations",
  verifyJWT,
  events.getRegistrationsByEventId
);
app.get(
  "/api/events/:eventId/mutual",
  verifyJWT,
  events.getMutualRegistrations
);
app.get("/api/events/cc/:CCId", verifyJWT, events.getEventsByCCId);
app.post("/api/events/:eventId/register", verifyJWT, events.registerForEvent);
app.post("/api/events/create", verifyJWT, events.createEvent);
app.delete("/api/events/:eventId", verifyJWT, events.deleteEvent);
app.delete(
  "/api/events/:eventId/unregister",
  verifyJWT,
  events.unregisterFromEvent
);

// Map features
app.get("/api/map/services", verifyJWT, map.getLocalServices);
app.post("/api/map/services", verifyJWT, map.addLocalService);
app.put("/api/map/my-location", verifyJWT, map.updateUserLocation);
app.get("/api/map/shared-with-me", verifyJWT, map.getSharedLocations);
app.put("/api/map/shared-with-me/:userId", verifyJWT, map.acceptShareRequest);
app.post("/api/map/shared-by-me/:userId", verifyJWT, map.shareLocation);
app.delete("/api/map/shared-by-me/:userId", verifyJWT, map.revokeShare);
app.get("/api/map/autocomplete", verifyJWT, map.getAutocompleteSuggestions);

// Interest Group Application (USER SIDE)
app.post(
  "/api/interestGroupUser",
  verifyJWT,
  interestGroupUserController.fillApplication
);
app.get(
  "/api/interestGroup",
  verifyJWT,
  interestGroupUserController.getApplications
);
app.put(
  "/api/interestGroupUser/:ProposalId",
  verifyJWT,
  interestGroupUserController.updateApplication
);
app.delete(
  "/api/interestGroupUser/:ProposalId",
  verifyJWT,
  interestGroupUserController.deleteApplication
);

// Interest Group Application (ADMIN SIDE)
app.get(
  "/api/interestGroupAdmin/:CCId",
  verifyJWT,
  interestGroupAdminController.getPendingApplicationsByCC
);
app.put(
  "/api/interestGroupAdmin/:ProposalId",
  verifyJWT,
  interestGroupAdminController.reviewApplication
);
app.get(
  "/api/interestGroupAdmin/:ProposalId",
  verifyJWT,
  interestGroupAdminController.getApplicationById
);

// Google Calendar Integration
app.get(
  "/api/calendar/google/auth/url",
  verifyJWT,
  googleCalendar.redirectToGoogleOAuth
);
app.get("/auth/google/callback", googleCalendar.oauthCallback);
app.post(
  "/api/googleCalendar/events",
  verifyJWT,
  googleCalendar.addCalendarEvent
);
app.get(
  "/api/calendar/google/status",
  verifyJWT,
  googleCalendar.checkGoogleCalendarLinkStatus
);
// Gmail Routes
app.get("/api/gmail/auth", verifyJWT, gmailController.redirectToGoogleOAuth);
app.get("/api/gmail/callback", gmailController.oauthCallback);
app.post(
  "/api/gmail/send-approval",
  verifyJWT,
  gmailController.sendApprovalEmail
);

reminderCron.getDates();
app.get("/api/sentiment", sentiment);

// This must come after all the routes
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Open Kampung Connect at http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  try {
    await pool.close();
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
});
