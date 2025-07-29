import pool from "../db.js";
import sql from "mssql";

/**
 * Saves the specified OTP for a user.
 * @param {number} userId
 * @param {string} otp
 * @param {Date} expiresAt
 */
export async function saveOTP(userId, otp, expiresAt) {
  try {
    const result = await pool
      .request()
      .input("userId", userId)
      .query(`DELETE FROM UserOTPs WHERE UserId = @userId`);

    await pool
      .request()
      .input("userId", userId)
      .input("otp", otp)
      .input("expiresAt", expiresAt).query(`
        INSERT INTO UserOTPs (UserId, OTP, ExpiresAt)
        VALUES (@userId, @otp, @expiresAt);

      `);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}
/**
 * Retrieves the OTP for a user.
 * @param {number} userId
 */
export async function getOTP(userId) {
  try {
    const result = await pool
      .request()
      .input("userId", userId)
      .query("SELECT OTP, ExpiresAt FROM UserOTPs WHERE UserId = @userId");

    if (result.recordset.length === 0) {
      return null; // No OTP found for the user
    }
    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}
/**
 * Deletes the OTP for a user.
 * @param {number} userId
 */
export async function deleteOTP(userId) {
  try {
    await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(`DELETE FROM UserOTPs WHERE UserId = @userId`);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
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
      .input("image", image).query(`
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
  try {
    const result = await pool
      .request()
      .input("id", userId)
      .query("SELECT * FROM Users WHERE UserId = @id");

    if (result.recordset.length === 0) {
      return null; // User not found
    }
    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
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
/** gets profile of user using phonenum
 * @param {string} phoneNumber
 */
export async function getUserByPhoneNumber(phoneNumber) {
  try {
    const result = await pool
      .request()
      .input("phoneNumber", sql.VarChar, phoneNumber)
      .query(
        "SELECT UserId, Name, PhoneNumber, Bio, ProfilePhotoURL FROM Users WHERE PhoneNumber = @phoneNumber"
      );

    if (result.recordset.length === 0) {
      return null; // User not found
    }
    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}
