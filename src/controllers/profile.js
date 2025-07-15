import * as model from "../models/user.js";
/**
 * Gets the profile of a user by their ID.
 * @type {import("express").RequestHandler}
 */
export async function getProfile(req, res) {
  const userId = parseInt(req.params.userId); // Get userId from the URL parameters
  try {
    const user = await model.getProfile(userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
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
export async function updateProfile(req, res) {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  const { name, phoneNumber, bio, image } = req.body;

  try {
    const updated = await model.updateProfile(userId, {
      name,
      phoneNumber,
      bio,
      image,
    });

    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Deletes the profile of a user.
 * @type {import("express").RequestHandler}
 */

export async function deleteUser(req, res) {
  const userId = parseInt(req.params.userId);

  try {
    const deletedUser = await model.deleteUser(userId);
    if (!deletedUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(200).json({ message: "Profile deleted successfully" });
    return;
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
}

/**
 * Deletes the profile picture of a user.
 * @type {import("express").RequestHandler}
 */

export async function deleteProfilePicture(req, res) {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  try {
    const deletedPicture = await model.deleteProfilePicture(userId);
    if (!deletedPicture) {
      res.status(404).json({ error: "User not found or no picture to delete" });
      return;
    }
    res.status(200).json({ message: "Profile picture deleted successfully" });
    return;
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
}
