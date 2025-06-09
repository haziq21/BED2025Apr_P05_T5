import express from "express";
import * as auth from "./controllers/auth.js";
import * as profile from "./controllers/profile.js";

const PORT = 3000;
const app = express();
app.use(express.static("src/public"));

app.post("/api/auth/otp", auth.sendOTP);
app.get("/api/profile", profile.getProfile);

app.listen(PORT, () => {
  console.log(`Open Kampung Connect at http://localhost:${PORT}`);
});
