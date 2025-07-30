import sql from "mssql";
import pool from "../db.js";

/**
 * Create a CC, returning the complete CC.
 * @param {{name: string, location: {lat: number, lon: number}}} fields
 * @returns {Promise<{id: number, name: string, location: {lat: number, lon: number}}>}
 */
export async function createCC(fields) {
  /** @type {sql.IResult<{CCId: number, Name: string, Lat: number, Lon: number}>} */
  const result = await pool
    .request()
    .input("name", fields.name)
    .input("lat", fields.location.lat)
    .input("lon", fields.location.lon)
    .query(
      `INSERT INTO CCs (Name, Location)
      OUTPUT INSERTED.CCId, INSERTED.Name, INSERTED.Location.Lat AS Lat, INSERTED.Location.Long AS Lon
      VALUES (@name, geography::Point(@lat, @lon, 4326));`
    );
  const cc = result.recordset[0];
  return {
    id: cc.CCId,
    name: cc.Name,
    location: { lat: cc.Lat, lon: cc.Lon },
  };
}

/**
 * Retrieve a CC by ID.
 * @param {number} ccId
 * @returns {Promise<{id: number, name: string, location: {lat: number, lon: number}} | null>}
 */
export async function getCCById(ccId) {
  /** @type {sql.IResult<{CCId: number, Name: string, Lat: number, Lon: number}>} */
  const result = await pool
    .request()
    .input("ccId", ccId)
    .query(
      `SELECT CCId, Name, Location.Lat AS Lat, Location.Long AS Lon
      FROM CCs
      WHERE CCId = @ccId`
    );
  if (result.recordset.length === 0) return null;

  const cc = result.recordset[0];
  return {
    id: cc.CCId,
    name: cc.Name,
    location: { lat: cc.Lat, lon: cc.Lon },
  };
}

/**
 * Retrieve all CCs.
 * - If `options.locationSort` is provided, the CCs will be sorted
 *   by distance from that point, and will include a `distance` field.
 * - If `options.adminFilter` is provided, only CCs where the specified
 *   user is an admin will be returned.
 * @param {{locationSort?: {lat: number, lon: number}?, adminFilter?: number?}} options
 * @returns {Promise<{id: number, name: string, location: {lat: number, lon:number}, distance?: number}[]>}
 */
export async function getAllCCs(options = {}) {
  /** @type {sql.IResult<{CCId: number, Name: string, Lat: number, Lon: number, Distance?: number}>} */
  const result = await pool
    .request()
    .input("lat", options?.locationSort?.lat)
    .input("lon", options?.locationSort?.lon)
    .input("userId", options?.adminFilter)
    .query(
      `SELECT c.CCId, Name, Location.Lat AS Lat, Location.Long AS Lon
        ${
          options?.locationSort
            ? ", Location.STDistance(geography::Point(@lat, @lon, 4326)) AS Distance"
            : ""
        }
      FROM CCs c
      ${
        options?.adminFilter
          ? "JOIN CCAdmins ca ON c.CCId = ca.CCId WHERE ca.UserId = @userId"
          : ""
      }
      ORDER BY ${options?.locationSort ? "Distance" : "Name"}`
    );

  return result.recordset.map((cc) => {
    const output = {
      id: cc.CCId,
      name: cc.Name,
      location: { lat: cc.Lat, lon: cc.Lon },
    };
    // @ts-ignore
    if (cc.Distance) output.distance = cc.Distance;
    return output;
  });
}

/**
 * Update the name or location of a CC by ID,
 * returning the updated CC or `null` if there
 * doesn't exist a CC with the specified ID.
 * @param {number} ccId
 * @param {{name?: string, location?: {lat: number, lon: number}}} fields
 */
export async function updateCC(ccId, fields) {
  const { name, location } = fields;

  // Build the SET clause dynamically based on provided fields
  const setParts = [];
  if (name) setParts.push("Name = @name");
  if (location) setParts.push("Location = geography::Point(@lat, @lon, 4326)");

  /** @type {sql.IResult<{CCId: number, Name: string, Lat: number, Lon: number}>} */
  const result = await pool
    .request()
    .input("ccId", ccId)
    .input("name", name)
    .input("lat", location?.lat)
    .input("lon", location?.lon)
    .query(
      `UPDATE CCs
      SET ${setParts.join(", ")}
      OUTPUT INSERTED.CCId, INSERTED.Name, INSERTED.Location.Lat AS Lat, INSERTED.Location.Long AS Lon
      WHERE CCId = @ccId`
    );

  if (result.recordset.length === 0) {
    return null;
  }

  const cc = result.recordset[0];
  return {
    id: cc.CCId,
    name: cc.Name,
    location: { lat: cc.Lat, lon: cc.Lon },
  };
}

/**
 * Delete a CC by ID, returning the deleted CC or `null`
 * if there doesn't exist a CC with the specified ID.
 * @param {number} ccId
 * @returns {Promise<{id: number, name: string, location: {lat: number, lon:number}}?>}
 */
export async function deleteCC(ccId) {
  /** @type {sql.IResult<{CCId: number, Name: string, Lat: number, Lon: number}>} */
  const result = await pool
    .request()
    .input("ccId", ccId)
    .query(
      `DELETE FROM CCs
      OUTPUT DELETED.CCId, DELETED.Name, DELETED.Location.Lat AS Lat, DELETED.Location.Long AS Lon
      WHERE CCId = @ccId`
    );

  if (result.recordset.length === 0) {
    return null;
  }

  const cc = result.recordset[0];
  return {
    id: cc.CCId,
    name: cc.Name,
    location: { lat: cc.Lat, lon: cc.Lon },
  };
}

/**
 * Return whether the specified user is an admin of the specified CC.
 * @param {number} userId
 * @param {number} ccId
 * @returns {Promise<boolean>}
 */
export async function isAdmin(userId, ccId) {
  const result = await pool
    .request()
    .input("userId", userId)
    .input("ccId", ccId)
    .query(`SELECT * FROM CCAdmins WHERE UserId = @userId AND CCId = @ccId`);
  return result.recordset.length > 0;
}

/**
 * Retrieve all the admins of a CC.
 * @param {number} ccId
 * @returns {Promise<{id: number, name: string, phoneNumber: string, bio: string, profilePhotoURL: string}[]>}
 */
export async function getAdmins(ccId) {
  /** @type {sql.IResult<{UserId: number, Name: string, PhoneNumber: string, Bio: string, ProfilePhotoURL: string}>} */
  const result = await pool
    .request()
    .input("ccId", ccId)
    .query(
      `SELECT u.UserId, u.Name, u.PhoneNumber, u.Bio, u.ProfilePhotoURL
       FROM CCAdmins ca
       JOIN Users u ON ca.UserId = u.UserId
       WHERE ca.CCId = @ccId`
    );

  return result.recordset.map((admin) => ({
    id: admin.UserId,
    name: admin.Name,
    phoneNumber: admin.PhoneNumber,
    bio: admin.Bio,
    profilePhotoURL: admin.ProfilePhotoURL,
  }));
}

/**
 * Make a user an admin of a CC.
 * @param {number} ccId
 * @param {number} userId
 */
export async function makeAdmin(ccId, userId) {
  await pool
    .request()
    .input("ccId", ccId)
    .input("userId", userId)
    .query(
      `INSERT INTO CCAdmins (CCId, UserId)
       VALUES (@ccId, @userId)`
    );
}

/**
 * Remove a user as an admin of a CC, returning `true` if the user
 * was successfully removed as an admin and `false` otherwise.
 * @param {number} ccId
 * @param {number} userId
 * @return {Promise<boolean>}
 */
export async function removeAdmin(ccId, userId) {
  const result = await pool
    .request()
    .input("ccId", ccId)
    .input("userId", userId)
    .query(
      `DELETE FROM CCAdmins
      WHERE CCId = @ccId AND UserId = @userId`
    );

  return result.rowsAffected[0] > 0;
}
