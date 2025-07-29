import sql from "mssql";
import pool from "../db.js";

/**
 * Save or update Google OAuth tokens for a user.
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
 * Retrieve Google OAuth tokens for a user.
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
