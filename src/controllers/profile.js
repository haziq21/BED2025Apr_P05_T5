import * as model from "../models/user.js";
/**
 * Gets the profile of a user 
* @typedef {import('express').Request & { userId?: any }} AuthenticatedRequest
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 */
export async function getProfile(req, res) {
  const userId = req.userId;
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
 * updates the profile of a user.
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 */
export async function updateProfile(req, res) {
  // const userId = parseInt(req.params.userId);
    const userId = req.userId;
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  const { name, phoneNumber, bio, ProfilePhotoURL } = req.body;

  try {
    const updated = await model.updateProfile(userId, {
      name,
      phoneNumber,
      bio,
      ProfilePhotoURL,
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
 * deletes the profile of a user
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 */

export async function deleteUser(req, res) {
   const userId = req.userId;

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
 *  Deletes the profile picture of a user.
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 */

export async function deleteProfilePicture(req, res) {
   const userId = req.userId;
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
/**
 * Uploads a profile picture and updates the user's profile with the image URL.
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 */
export async function uploadProfilePicture(req, res) {
  const userId = req.userId;
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  try {
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const updated = await model.updateProfile(userId, { ProfilePhotoURL: imageUrl });


    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(200).json({ ProfilePhotoURL: imageUrl });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}