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
 * Creates a new user profile.
 * @param {string} name 
 * @param {string} PhoneNumber 
 * @param {string} bio 
 * @param {string} image 
 */
export async function createUser(name, PhoneNumber, bio, image) {
  try {
    const result = await pool
      .request()
      .input("name", name)
      .input("phoneNumber", PhoneNumber)
      .input("bio", bio)
      .input("image", image)
      .query(`
        INSERT INTO Users (Name, PhoneNumber, Bio, ProfilePhotoURL)
        VALUES (@name, @phoneNumber, @bio, @image);

        SELECT * FROM Users WHERE UserId = SCOPE_IDENTITY();
      `);

    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
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

/**
 * Updates the user's profile details.
 * @param {number} userId 
 * @param {{ name?: string, phoneNumber?: string, bio?: string, image?: string }} profileData - Fields to update.
 */
export async function updateProfile(userId, { name, phoneNumber, bio, image }) {
  try {
    const request = pool.request().input("id", userId);

    const updates = [];

    if (name !== undefined && name !== null) {
      request.input("name", name);
      updates.push("Name = @name");
    }

    if (phoneNumber !== undefined && phoneNumber !== null) {
      request.input("phoneNumber", phoneNumber);
      updates.push("PhoneNumber = @phoneNumber");
    }

    if (bio !== undefined && bio !== null) {
      request.input("bio", bio);
      updates.push("Bio = @bio");
    }

    if (image !== undefined && image !== null) {
      request.input("image", image);
      updates.push("ProfilePhotoURL = @image");
    }

    if (updates.length === 0) {
      throw new Error("No valid fields provided for update.");
    }

    const query = `
      UPDATE Users
      SET ${updates.join(", ")}
      WHERE UserId = @id
    `;

    const result = await request.query(query);

    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}
    
/**
 * Deletes the profile of a user.
 * @param {number} userId 
 */

export async function deleteUser(userId) {
  try {
    const result = await pool
      .request()
      .input("id", userId)
      .query("DELETE FROM Users WHERE UserId = @id");

    return result.rowsAffected[0] > 0; 
  } catch (error) {
    console.error("Database error:", error);
    throw error; 
  }
}

/** * Deletes the profile picture of a user.
 * @param {number} userId 
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
    throw error; 
  }
}
/** *gets profile of user using phonenum
 * @param {string} phoneNumber 
 */
export async function getUserByPhoneNumber(phoneNumber) {   
  try{
    const result = await pool
    .request()
    .input("phoneNumber", phoneNumber)
    .query("SELECT * FROM Users WHERE phoneNumber = @phoneNumber");

  if (result.recordset.length === 0) {
    return null; // User not found
  }
  return result.recordset[0];
}catch (error) {
    console.error("Database error:", error);
    throw error; 
  }
}
