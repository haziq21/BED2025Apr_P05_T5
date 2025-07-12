import express from "express";
import multer from "multer"; // to read files
import { errorHandler } from "./middleware/error.js";
import upload from "./middleware/upload.js";
import * as auth from "./controllers/auth.js";
import * as profile from "./controllers/profile.js";
import * as cc from "./controllers/cc.js";
import * as friends from "./controllers/friends.js";
import * as events from "./controllers/events.js";
import * as comment from "./controllers/comment.js";
import * as medicalRecordsController from "./controllers/medicalRecordsController.js";

import * as mediSchedule from "./controllers/medicationSchedule.js";
import * as mediValidate from "./middleware/medicationScheduleValidation.js";

import pool from "./db.js";

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/api/auth/otp", auth.sendOTP);
app.post("/api/auth/user", auth.createUser);
app.post("/api/auth/login", auth.login);
app.get("/api/profile/:userId", profile.getProfile);
app.put("/api/profile/:userId", profile.updateProfile);
app.delete("/api/profile/:userId", profile.deleteUser);
app.put("/api/profile/:userId/picture", profile.deleteProfilePicture);

// CC management
app.delete("/api/profile/:userId/picture", profile.deleteProfilePicture);
app.get("/api/cc", cc.getAllCCs);
app.get("/api/cc/:id", cc.getCCById);
app.post("/api/cc", cc.createCC);
app.patch("/api/cc/:id", cc.updateCC);
app.delete("/api/cc/:id", cc.deleteCC);
app.get("/api/cc/:id/admins", cc.getAdmins);
app.post("/api/cc/:id/admins/:userId", cc.makeAdmin);
app.delete("/api/cc/:id/admins/:userId", cc.removeAdmin);

app.post("/api/medicalRecords/:UserId", medicalRecordsController.uploadFile);
app.get("/api/medicalRecords/:UserId", medicalRecordsController.getFiles);
app.delete(
  "/api/medicalRecords/:UserId/:MedicalRecordId",
  medicalRecordsController.deleteFile
);

// Medication Schedule
app.get("/api/medicationSchedule/:userId", mediSchedule.getMediSchedule);
app.post(
  "/api/medicationSchedule/:userId",
  mediValidate.validateSchedule,
  mediSchedule.createSchedule
);
app.put(
  "/api/medicationSchedule/:userId",
  mediValidate.validateSchedule,
  mediSchedule.updateSchedule
);
app.delete(
  "/api/medicationSchedule/:userId/:scheduleId",
  mediValidate.validateScheduleId,
  mediSchedule.deleteSchedule
);

//Comment
app.get("/api/comment", comment.getComment);
app.get("/api/comment/:userId", comment.getCommentById);
app.post("/api/comment/:userId", comment.createComment);
app.put("/api/comment/:userId", comment.updateComment);
app.delete("/api/comment/:userId/:postId", comment.deleteComment);

//Friends management
app.get("/api/friends/:id", friends.getAllFriends);
app.get("/api/friends/:id/search", friends.searchUsers);
app.get("/api/friends/:id/requests", friends.getPendingFriendRequests);
app.get("/api/friends/:id/:friendId/public", friends.getPublicProfile);
app.post("/api/friends/:id/requests/:friendId", friends.acceptFriendRequest);
app.post("/api/friends/:id/:friendId", friends.sendFriendRequest);
app.delete("/api/friends/:id/:friendId", friends.deleteFriend);

//

// Events management
app.get("/api/events/:id", events.getEventById);
app.put("/api/events/:id", events.updateEvent);
app.get("/api/events/:id/registrations", events.getRegistrationsByEventId);
app.get("/api/events/:userId/:eventId/mutual", events.getMutualRegistrations);
app.get("/api/events/:userId/registered", events.getEventsByUserId);
app.get("/api/events/cc/:id", events.getEventsByCCId);
app.post("/api/events/:userId/:eventId/register", events.registerForEvent);
app.post("/api/events/create", events.createEvent);
app.delete("/api/events/:id", events.deleteEvent);
app.delete(
  "/api/events/:userId/:eventId/unregister",
  events.unregisterFromEvent
);

// This must come after all the routes
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Open Kampung Connect at http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  console.log("Received SIGINT. Closing pool and exiting...");
  try {
    await pool.close();
    console.log("Database connection closed.");
  } catch (err) {
    console.error("Error closing DB connection:", err);
  } finally {
    process.exit(0);
  }
});
