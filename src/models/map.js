/** @import sql from "mssql" */
import pool from "../db.js";

/**
 * Retrieve all local services.
 * @returns {Promise<{id: number, name: string, type: string, location: {lat: number, lon: number}}[]>}
 */
export async function getLocalServices() {
  /** @type {sql.IResult<{LocalServiceId: number, Name: string, Type: string, Lat: number, Lon: number}>} */
  const result = await pool.request().query(
    `SELECT LocalServiceId, Name, Type, Location.Lat AS Lat, Location.Long AS Lon
    FROM LocalServices`
  );

  return result.recordset.map((service) => ({
    id: service.LocalServiceId,
    name: service.Name,
    type: service.Type,
    location: { lat: service.Lat, lon: service.Lon },
  }));
}

/**
 * Create a local service, returning the complete local service.
 * @param {{name: string, type: string, location: {lat: number, lon: number}}} fields
 * @returns {Promise<{id: number, name: string, type: string, location: {lat: number, lon: number}}>}
 */
export async function addLocalService(fields) {
  /** @type {sql.IResult<{LocalServiceId: number, Name: string, Type: string, Lat: number, Lon: number}>} */
  const result = await pool
    .request()
    .input("name", fields.name)
    .input("type", fields.type)
    .input("lat", fields.location.lat)
    .input("lon", fields.location.lon)
    .query(
      `INSERT INTO LocalServices (Name, Type, Location)
      OUTPUT INSERTED.LocalServiceId, INSERTED.Name, INSERTED.Type, INSERTED.Location.Lat AS Lat, INSERTED.Location.Long AS Lon
      VALUES (@name, @type, geography::Point(@lat, @lon, 4326));`
    );
  const service = result.recordset[0];
  return {
    id: service.LocalServiceId,
    name: service.Name,
    type: service.Type,
    location: { lat: service.Lat, lon: service.Lon },
  };
}

/**
 * Update a user's tracked location.
 * @param {number} userId
 * @param {{lat: number, lon: number}} location
 * @returns {Promise<void>}
 */
export async function updateUserLocation(userId, location) {
  await pool
    .request()
    .input("userId", userId)
    .input("lat", location.lat)
    .input("lon", location.lon)
    .query(
      `MERGE INTO UserLocations AS T
      USING (VALUES (@userId, @lat, @lon)) AS S (UserId, Lat, Lon)
      ON T.UserId = S.UserId
      WHEN MATCHED THEN
        UPDATE SET T.Location = geography::Point(S.Lat, S.Lon, 4326), T.Time = GETDATE()
      WHEN NOT MATCHED THEN
        INSERT (UserId, Location, Time)
        VALUES (S.UserId, geography::Point(S.Lat, S.Lon, 4326), GETDATE());`
    );
}

/**
 * Request to share one user's location with another user.
 * @param {number} locatedUserId The user who is sharing their location.
 * @param {number} viewingUserId The user who is viewing the shared location.
 * @returns {Promise<void>}
 */
export async function shareLocation(locatedUserId, viewingUserId) {
  await pool
    .request()
    .input("locatedUserId", locatedUserId)
    .input("viewingUserId", viewingUserId)
    .query(
      `INSERT INTO SharedLocations (LocatedUserId, ViewingUserId)
      VALUES (@locatedUserId, @viewingUserId);`
    );
}

/**
 * Revoke access for a user to view another user's location.
 * @param {number} locatedUserId The user who is sharing their location.
 * @param {number} viewingUserId The user who is viewing the shared location.
 * @returns {Promise<boolean>} Whether the share existed to be revoked.
 */
export async function revokeShare(locatedUserId, viewingUserId) {
  const result = await pool
    .request()
    .input("locatedUserId", locatedUserId)
    .input("viewingUserId", viewingUserId)
    .query(
      `DELETE FROM SharedLocations
      WHERE LocatedUserId = @locatedUserId AND ViewingUserId = @viewingUserId`
    );
  return result.rowsAffected[0] > 0;
}

/**
 * Get the locations of users that the specified user can view.
 * @param {number} viewingUserId
 * @returns {Promise<{userId: number, name: string, profilePhotoUrl: string, location: {lat: number, lon: number}, time: Date}[]>}
 */
export async function getSharedLocations(viewingUserId) {
  /** @type {sql.IResult<{UserId: number, Name: string, ProfilePhotoURL: string, Lat: number, Lon: number, Time: Date}>} */
  const result = await pool
    .request()
    .input("viewingUserId", viewingUserId)
    .query(
      `SELECT u.UserId, u.Name, u.ProfilePhotoURL, ul.Location.Lat AS Lat, ul.Location.Long AS Lon, ul.Time
      FROM Users u
      JOIN UserLocations ul ON u.UserId = ul.UserId
      JOIN SharedLocations sl ON u.UserId = sl.LocatedUserId
      WHERE sl.ViewingUserId = @viewingUserId`
    );

  return result.recordset.map((row) => ({
    userId: row.UserId,
    name: row.Name,
    profilePhotoUrl: row.ProfilePhotoURL,
    location: { lat: row.Lat, lon: row.Lon },
    time: row.Time,
  }));
}

/**
 * Get the users that can view the specified user's location.
 * @param {number} userId
 * @returns {Promise<{userId: number, name: string, profilePhotoUrl: string}[]>}
 */
export async function getViewers(userId) {
  /** @type {sql.IResult<{UserId: number, Name: string, ProfilePhotoURL: string}>} */
  const result = await pool
    .request()
    .input("userId", userId)
    .query(
      `SELECT u.UserId, u.Name, u.ProfilePhotoURL
      FROM Users u
      JOIN SharedLocations sl ON u.UserId = sl.ViewingUserId
      WHERE sl.LocatedUserId = @userId`
    );

  return result.recordset.map((row) => ({
    userId: row.UserId,
    name: row.Name,
    profilePhotoUrl: row.ProfilePhotoURL,
  }));
}
