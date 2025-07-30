import * as model from "../models/user.js";
import jwt from "jsonwebtoken";
import twilio from "twilio";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
/**
 * Adds +65 prefix if missing.
 * @param {string} phone
 */
function formatPhoneNumber(phone) {
  if (phone.startsWith("+")) return phone;
  return "+65" + phone;
}
/**
 * Sends an OTP to the user's phone number.
 * @type {import("express").RequestHandler}
 */
export async function sendOTP(req, res) {
  const { phoneNumber } = req.body;
  const formattedPhone = formatPhoneNumber(phoneNumber);

  if (!phoneNumber) {
    res.status(400).json({ message: "Phone number is required" });
    return;
  }
  try {
    const user = await model.getUserByPhoneNumber(phoneNumber);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await model.saveOTP(user.UserId, otp, expiresAt);
    await twilioClient.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
}
/**
 * Sends a one-time password (OTP) to the user's phone number.
 * @type {import("express").RequestHandler}
 */
export async function verifyOTP(req, res) {
  const secretKey = process.env.JWT_SECRET;
  const { phoneNumber, otp } = req.body;
  if (!secretKey) {
    res.status(500).json({ message: "JWT secret key is not configured" });
    return;
  }
  const user = await model.getUserByPhoneNumber(phoneNumber);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const record = await model.getOTP(user.UserId);
  if (!record) {
    res.status(400).json({ error: "No OTP found" });
    return;
  }
  if (record.OTP !== otp) {
    res.status(400).json({ error: "Invalid OTP" });
    return;
  }
  if (new Date(record.ExpiresAt) < new Date()) {
    res.status(400).json({ error: "OTP expired" });
    return;
  }
  await model.deleteOTP(user.UserId);

  const payload = { userId: user.UserId, name: user.Name };
  const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });

  res.status(200).json({ token });
}

/**
 * Creates a new user.
 * @type {import("express").RequestHandler}
 */
export async function createUser(req, res) {
  const { Name, PhoneNumber, Bio, Image } = req.body;

  try {
    // Check if phone number already exists
    const existingUser = await model.getUserByPhoneNumber(PhoneNumber);
    if (existingUser) {
      res.status(409).json({ error: "Phone number already registered" });
      return;
    }
    const user = await model.createUser(Name, PhoneNumber, Bio, Image);
    if (!user) {
      res.status(400).json({ error: "Failed to create user" });
      return;
    }

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
/**
 * Gets the profile of a user by their ID.
 * @type {import("express").RequestHandler}
 */

export async function login(req, res) {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    res.status(500).json({ message: "JWT secret key is not configured" });
    return;
  }
  const { phoneNumber } = req.body;

  try {
    // Validate user credentials
    const user = await model.getUserByPhoneNumber(phoneNumber);
    console.log("User from DB:", user);
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    if (!phoneNumber) {
      res.status(400).json({ message: "Phone number is required" });
      return;
    }
    //payload
    const payload = {
      userId: user.UserId,
      name: user.Name,
    };
    const token = jwt.sign(payload, secretKey, { expiresIn: "3600s" }); // Expires in 1 hour
    res.status(200).json({ token }); //return the token
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
}
