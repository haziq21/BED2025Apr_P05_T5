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
  const { phoneNumber } = req.body;

  try {
    // Validate user credentials
    const user = await model.getUserByPhoneNumber(phoneNumber);
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    //payload
    const payload = {
      id: user.id,
      role: user.role,
    };
    const token = jwt.sign(payload, "my_secret_key", { expiresIn: "3600s" }); // Expires in 1 hour
    res.status(200).json({ token });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
}
