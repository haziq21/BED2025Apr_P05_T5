import express from "express";
import * as auth from "./controllers/auth";
import * as profile from "./controllers/profile";

const PORT = 3000;
const app = express();
app.use(express.static("src/public"));

app.post("/api/otp", auth.sendOTP);
app.get("/api/profile", profile.getProfile);

app.listen(PORT, () => {
  console.log(`Open Kampung Connect at http://localhost:${PORT}`);
});
