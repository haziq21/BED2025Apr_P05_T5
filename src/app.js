import express from "express";
import { errorHandler } from "./middleware/error.js";
import * as auth from "./controllers/auth.js";
import * as profile from "./controllers/profile.js";
import * as cc from "./controllers/cc.js";

import pool from "./db.js";

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(express.static("src/public"));

app.post("/api/auth/otp", auth.sendOTP);
app.get("/api/profile/:userId", profile.getProfile);
app.patch("/api/profile/:userId", profile.updateProfile);
app.delete("/api/profile/:userId", profile.deleteProfile);
app.delete("/api/profile/:userId/picture", profile.deleteProfilePicture);
app.get("/api/cc", cc.getAllCCs);
app.post("/api/cc", cc.createCC);
app.patch("/api/cc/:id", cc.updateCC);
app.delete("/api/cc/:id", cc.deleteCC);
app.get("/api/cc/:id/admins", cc.getAdmins);
app.post("/api/cc/:id/admins/:userId", cc.makeAdmin);
app.delete("/api/cc/:id/admins/:userId", cc.removeAdmin);

// This must come after all the routes
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Open Kampung Connect at http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
  // Close the database connection pool
  pool.close();
});
