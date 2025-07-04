import pool from "../db.js";
import sql from "mssql"; 
/**
 * Sets the specified OTP for a user.
 * @param {number} userId - The ID of the user.
 * @param {string} otp - The one-time password to set for the user.
 */
export async function setOTP(userId, otp) {
  // TODO
}

/**
 * Gets the profile of a user by their ID.
  * @param {number} userId - The ID of the user.
  * @returns {Promise<object>} - The user's profile data.
  */

export async function getProfile(userId) {
  try {
    const request = pool.request();
    request.input("id", userId);
    const result = await request.query("SELECT * FROM Users WHERE id = @id");
    return result.recordset[0]; 
  } catch (error) {
    console.error("Database error:", error);
    throw error; 
  }
}


/** * Updates the profile of a user.
 * @param {number} userId 
 * @param {string} [name]
 * @param {string} [bio] 
 * @param {string} [image] 
 * @returns {Promise<object|null>} - The updated user, or null if not found.
 */
export async function updateProfile(userId, name, bio, image) {
  const request = pool.request();
  request.input("id", userId);

  const updates = [];
  if (name) {
    updates.push("name = @name");
    request.input("name", name);
  }
  if (bio) {
    updates.push("bio = @bio");
    request.input("bio", bio);
  }
  if (image) {
    updates.push("ProfilePhotoURL = @image");
    request.input("image", image);
  }

  if (updates.length === 0) {
    throw new Error("No fields to update");
  }

  // Perform the update
  const sql = `UPDATE Users SET ${updates.join(", ")} WHERE id = @id`;
  const result = await request.query(sql);

  if (result.rowsAffected[0] === 0) {
    return null;
  }
  
  const fetchResult = await request.query(
    "SELECT * FROM Users WHERE id = @id"
  );
  return fetchResult.recordset[0];
}
/**
 * Deletes the profile of a user.
 * @param {number} userId 
 * @returns {Promise<boolean>} - True if deleted, false if not found.
 */
export async function deleteProfile(userId) {
  const request = pool.request();
  request.input("id", userId);

  const result = await request.query("DELETE FROM Users WHERE id = @id");

  return result.rowsAffected[0] > 0;  
}

/** * Deletes the profile picture of a user.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<boolean>} - True if the profile picture was deleted, false if not found.
 */
export async function deleteProfilePicture(userId) {
  const request = pool.request();
  request.input("id", userId);

  const result = await request.query('UPDATE Users SET ProfilePhotoURL = NULL WHERE id = @id AND ProfilePhotoURL IS NOT NULL');
  return result.rowsAffected[0] > 0;
}
