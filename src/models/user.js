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
  */
export async function getProfile(userId) {
  try{
    const result = await pool
    .request()
    .input("id", userId)
    .query("SELECT * FROM Users WHERE UserId = @id");

  if (result.recordset.length === 0) {
    return null; // User not found
  }
  return result.recordset[0];
}catch (error) {
    console.error("Database error:", error);
    throw error; // Rethrow the error to be handled by the caller
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
 */

export async function deleteProfile(userId) {
  try{
    const result = await pool
      .request()
      .input("id", userId)
      .query("DELETE FROM Users WHERE UserId = @id");

    return result.rowsAffected[0] > 0; // Return true if a row was deleted
  } catch (error) {
    console.error("Database error:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
}

/** * Deletes the profile picture of a user.
 * @param {number} userId - The ID of the user.
 */

export async function deleteProfilePicture(userId) {
  try {
    const result = await pool
      .request()
      .input("id", userId)
      .query(
        "UPDATE Users SET ProfilePhotoURL = NULL WHERE UserId = @id AND ProfilePhotoURL IS NOT NULL"
      );

    return result.rowsAffected[0] > 0; 
  } catch (error) {
    console.error("Database error:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
}