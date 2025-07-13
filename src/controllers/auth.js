import * as model from "../models/user.js";
import jwt from "jsonwebtoken";
/**
 * Gets the profile of a user by their ID.
 * @type {import("express").RequestHandler}
 */
export function sendOTP(req, res) {
  // TODO (advanced feature)
}

/**
 * Gets the profile of a user by their ID.
 * @type {import("express").RequestHandler}
 */

export async function createUser(req, res) {
  const { Name, PhoneNumber, Bio, Image } = req.body;

  try {
    const user = await model.createUser(Name, PhoneNumber, Bio, Image);
    if (!user) {
      res.status(400).json({ error: "Failed to create user" });
      return;
    }
    res.status(201).json({ message: "User created successfully", user });
    return;
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
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
