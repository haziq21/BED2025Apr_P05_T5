import sql from "mssql";
import pool from "../db.js";
/**
 * @param {number} id
 * @returns {Promise<{name: string}[]>}
 */
export async function getAllFriends(id) {
  const result = await pool
    .request()
    .input("userId1", id)
    .query(
      `SELECT u.Name AS FriendName
      FROM Friends f
      JOIN 
      Users u ON f.UserId2 = u.UserId
      WHERE f.Accepted = 1 AND f.UserId1 = @userId1`
    );
  return result.recordset.map((friend) => ({
    name: friend.FriendName,
  }));
}

/**
 * Delete friendship between two users.
 * @param {number} userId1
 * @param {number} userId2
 * @return {Promise<boolean>} Returns true if the friendship was deleted, false otherwise.
 */
export async function deleteFriend(userId1, userId2) {
  const result = await pool
    .request()
    .input("userId1", userId1)
    .input("userId2", userId2)
    .query(
      `DELETE FROM Friends
      WHERE (UserId1 = @userId1 AND UserId2 = @userId2)
         OR (UserId1 = @userId2 AND UserId2 = @userId1)`
    );
  return result.rowsAffected[0] > 0; // Returns true if a row was deleted
}
/**
 * @param {number} userId1
 * @param {number} userId2
 * @returns
 */
export async function sendFriendRequest(userId1, userId2) {
  const result = await pool
    .request()
    .input("userId1", userId1)
    .input("userId2", userId2)
    .query(
      `INSERT INTO Friends (UserId1, UserId2, Accepted) 
      VALUES (@userId1, @userId2, 0)`
    );
  return result.rowsAffected[0] > 0; // Returns true if a row was inserted
}
/**
 * Accept a friend request between two users.
 * @param {number} userId1
 * @param {number} userId2
 * @return {Promise<boolean>} Returns true if the friend request was accepted, false otherwise.
 */

export async function acceptFriendRequest(userId1, userId2) {
  const result = await pool
    .request()
    .input("userId1", userId1)
    .input("userId2", userId2)
    .query(
      `UPDATE Friends
       SET Accepted = 1
       WHERE (UserId1 = @userId1 AND UserId2 = @userId2);

       IF @@ROWCOUNT > 0
       BEGIN
        INSERT INTO Friends (UserId1, UserId2, Accepted)
        VALUES (@userId2, @userId1, 1);
       END`
    );

  return result.rowsAffected[0] > 0; // Returns true if a row was updated
}

/**
 * Get all users who have sent a friend request to a user.
 * @param {number} userId
 * @returns {Promise<{id: number, name: string, bio: string, profilePhotoURL: string}[]>}
 */
export async function getPendingFriendRequests(userId) {
  const result = await pool
    .request()
    .input("userId", userId)
    .query(
      `SELECT u.UserId, u.Name, u.Bio, u.ProfilePhotoURL
      FROM Friends f
      JOIN Users u ON f.UserId1 = u.UserId
      WHERE f.UserId2 = @userId AND f.Accepted = 0`
    );
  return result.recordset.map((request) => ({
    id: request.UserId,
    name: request.Name,
    phoneNumber: request.PhoneNumber,
    bio: request.Bio,
    profilePhotoURL: request.ProfilePhotoURL,
  }));
}
/**
 * Search for users by name.
 * @param {string} query - The search query.
 * @returns {Promise<{id: number, name: string, bio: string, profilePhotoURL: string}[]>}
 */
export async function searchUsers(query) {
  query = decodeURIComponent(query); // Decode the query to handle special characters

  if (query.trim() === "") {
    return []; // Return an empty array if the query is empty
  }
  const result = await pool
    .request()
    .input("query", `%${query}%`)
    .query(
      `SELECT UserId, Name, Bio, ProfilePhotoURL
      FROM Users
      WHERE Name LIKE @query`
    );
  return result.recordset.map((user) => ({
    id: user.UserId,
    name: user.Name,
    bio: user.Bio,
    profilePhotoURL: user.ProfilePhotoURL,
  }));
}

/**
 * get the public view of a profile by userId
 * @param {number} id
 * @returns {Promise<{id: number, name: string, bio: string, profilePhotoURL: string}[]>}
 */

export async function getPublicProfile(id) {
  const result = await pool
    .request()
    .input("userId", id)
    .query(
      `SELECT UserId, Name, Bio, ProfilePhotoURL
      FROM Users
      WHERE UserId = @userId`
    );
  return result.recordset.map((user) => ({
    id: user.UserId,
    name: user.Name,
    bio: user.Bio,
    profilePhotoURL: user.ProfilePhotoURL,
  }));
}
