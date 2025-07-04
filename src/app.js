import express from "express";
import { errorHandler } from "./middleware/error.js";
import * as auth from "./controllers/auth.js";
import * as profile from "./controllers/profile.js";
import * as cc from "./controllers/cc.js";
import * as mediSchedule from "./controllers/medicationSchedule.js";
import * as mediValidate from "./middleware/medicationScheduleValidation.js"

import pool from "./db.js";

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(express.static("src/public"));

app.post("/api/auth/otp", auth.sendOTP);
app.get("/api/profile/:userId", profile.getProfile);
app.patch("/api/profile/:userId", profile.updateProfile);
app.delete("/api/profile/:userId", profile.deleteProfile);
app.put("/api/profile/:userId/picture", profile.deleteProfilePicture);
app.get("/api/cc", cc.getAllCCs);
app.post("/api/cc", cc.createCC);
app.patch("/api/cc/:id", cc.updateCC);
app.delete("/api/cc/:id", cc.deleteCC);
app.get("/api/cc/:id/admins", cc.getAdmins);
app.post("/api/cc/:id/admins/:userId", cc.makeAdmin);
app.delete("/api/cc/:id/admins/:userId", cc.removeAdmin);

// Medication Schedule
app.get("/api/medicationSchedule/:userId",mediSchedule.getMediSchedule);
app.post("/api/medicationSchedule/:userId",mediSchedule.createSchedule);
app.put("/api/medicationSchedule/:userId/:scheduleId",mediSchedule.updateSchedule);
app.delete("/api/medicationSchedule/:userId/:scheduleId",mediSchedule.deleteSchedule);


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

