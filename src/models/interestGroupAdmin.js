import sql from "mssql";
import fs from "fs";
import pool from "../db.js";

/**
 * Save or update Google OAuth tokens for a user. (Koh Hau's code)
 * @param {number} userId
 * @param {import('google-auth-library').Credentials} tokens
 */
export async function saveGoogleTokens(userId, tokens) {
  const { access_token, refresh_token, expiry_date } = tokens;

  const existing = await getGoogleTokens(userId);

  const request = pool.request();
  request.input("UserId", sql.Int, userId);
  request.input("AccessToken", sql.NVarChar(sql.MAX), access_token || null);
  request.input(
    "RefreshToken",
    sql.NVarChar(sql.MAX),
    refresh_token ?? existing?.refresh_token ?? null
  );
  request.input("ExpiryDate", sql.BigInt, expiry_date || null);

  const query = `
    MERGE GoogleCredentials AS target
    USING (SELECT @UserId AS UserId) AS source
    ON target.UserId = source.UserId
    WHEN MATCHED THEN
      UPDATE SET 
        AccessToken = @AccessToken,
        RefreshToken = @RefreshToken,
        ExpiryDate = @ExpiryDate
    WHEN NOT MATCHED THEN
      INSERT (UserId, AccessToken, RefreshToken, ExpiryDate)
      VALUES (@UserId, @AccessToken, @RefreshToken, @ExpiryDate);
  `;

  await request.query(query);
}

/**
 * Retrieve Google OAuth tokens for a user. (Koh Hau's code)
 * @param {number} userId
 * @returns {Promise<import('google-auth-library').Credentials | null>}
 */
export async function getGoogleTokens(userId) {
  const request = pool.request();
  request.input("UserId", sql.Int, userId);

  const result = await request.query(`
    SELECT AccessToken, RefreshToken, ExpiryDate
    FROM GoogleCredentials
    WHERE UserId = @UserId
  `);

  const row = result.recordset[0];
  if (!row) return null;

  return {
    access_token: row.AccessToken,
    refresh_token: row.RefreshToken,
    expiry_date: row.ExpiryDate,
  };
}

// ADMIN FUNCTIONS

/**
 * View applications of a specific CC (by default all 'pending' status)
 * @param {number} CCId
 */

export async function getPendingApplicationsByCC(CCId) {
  try {
    const request = pool.request().input("CCId", CCId);

    const result = await request.query(`
      SELECT * FROM InterestGroupProposals 
      WHERE CCId = @CCId AND Status = 'pending'
      `);

    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

/**
 * Accept or reject an application
 * @param {number} ProposalId
 * @param {string} Status
 */

export async function reviewApplication(ProposalId, Status) {
  try {
    const request = pool
      .request()
      .input("ProposalId", ProposalId)
      .input("Status", Status);

    const result = await request.query(`
      UPDATE InterestGroupProposals
      SET Status = @Status
      WHERE ProposalId = @ProposalId
      `);

    const updatedApp = await getApplicationById(ProposalId);
    return updatedApp.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

/**
 * Get a application by ProposalId
 * @param {number} ProposalId
 */

export async function getApplicationById(ProposalId) {
  try {
    const request = pool.request().input("ProposalId", ProposalId);

    const result = await request.query(`
      SELECT * FROM InterestGroupProposals 
      WHERE 
      ProposalId = @ProposalId
      `);
    return result;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}
