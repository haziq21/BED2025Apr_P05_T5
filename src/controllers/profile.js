import pool from "../db.js";


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
  try {
    const request = pool.request();
    request.input("id", userId);
    const result = await request.query("SELECT id, name, phonenumber, bio FROM Users WHERE id = @id");

    if (result.recordset.length === 0) {
      return null; // User not found
    }

    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
    
  }
}
