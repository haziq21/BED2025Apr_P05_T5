  import * as model from "../models/user.js";

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
