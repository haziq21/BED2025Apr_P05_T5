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
import { sentiment } from "./controllers/sentiment.js"

import pool from "./db.js";
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(express.static("src/public"));

// Authentication
app.post("/api/auth/otp", auth.sendOTP);
app.post("/api/auth/user", auth.createUser);
app.post("/api/auth/login", auth.login);
app.get("/api/profile/:userId", verifyJWT, profile.getProfile);
app.put("/api/profile/:userId", verifyJWT, profile.updateProfile);
app.delete("/api/profile/:userId", verifyJWT, profile.deleteUser);
app.put(
  "/api/profile/:userId/picture",
  verifyJWT,
  profile.deleteProfilePicture
);
app.get("/api/profile", verifyJWT, profile.getProfile);
app.put("/api/profile", verifyJWT, profile.updateProfile);
app.delete("/api/profile", verifyJWT, profile.deleteUser);
app.put("/api/profile/picture", verifyJWT, profile.deleteProfilePicture);

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
  "/api/medicalRecords/:MedicalRecordId",
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
app.get("/api/friends/:friendId/public", verifyJWT, friends.getPublicProfile);
app.post(
  "/api/friends/requests/:friendId",
  verifyJWT,
  friends.acceptFriendRequest
);
app.post("/api/friends/:friendId", verifyJWT, friends.sendFriendRequest);
app.delete("/api/friends/:friendId", verifyJWT, friends.deleteFriend);

// Events management
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
app.get("/api/events/registered", verifyJWT, events.getEventsByUserId);
app.get("/api/events/cc/:CCId", verifyJWT, events.getEventsByCCId);
app.post("/api/events/:eventId/register", verifyJWT, events.registerForEvent);
app.post("/api/events/create", verifyJWT, events.createEvent);
app.delete("/api/events/:eventId", verifyJWT, events.deleteEvent);
app.delete(
  "/api/events/:eventId/unregister",
  verifyJWT,
  events.unregisterFromEvent
);

reminderCron.getDates();
app.get('/api/sentiment', sentiment);



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
