import sql from "mssql";
import pool from "../db.js";

/** * Get all events for a CC
 * @param {number} CCId
 * @returns {Promise<{eventId: number, name: string, description: string, location: string, StartDateTime: Date, EndDateTime: Date}[]>} */
export async function getEventsByCCId(CCId) {
  const result = await pool
    .request()
    .input("CCId", CCId)
    .query(
      `SELECT EventId, Name, Description, Location, StartDateTime, EndDateTime
       FROM CCEvents
       WHERE CCId = @CCId`
    );
  return result.recordset.map((event) => ({
    eventId: event.EventId,
    name: event.Name,
    description: event.Description,
    location: event.Location,
    StartDateTime: new Date(event.StartDateTime),
    EndDateTime: new Date(event.EndDateTime),
  }));
}

/** * Get an event by its ID
 * @param {number} eventId
 * @returns {Promise<{name: string, description: string, location: string, StartDateTime: Date, EndDateTime: Date}|null>} */
export async function getEventById(eventId) {
  const result = await pool
    .request()
    .input("eventId", eventId)
    .query(
      `SELECT Name, Description, Location, StartDateTime, EndDateTime
       FROM CCEvents
       WHERE EventId = @eventId`
    );
  if (result.recordset.length === 0) return null;
  const event = result.recordset[0];
  return {
    name: event.Name,
    description: event.Description,
    location: event.Location,
    StartDateTime: new Date(event.StartDateTime),
    EndDateTime: new Date(event.EndDateTime),
  };
}

/**
 * Shows friends that have signed up for the same event by eventId
 * @param {number} userId - The ID of the user making the request
 * @param {number} eventId - The ID of the event to check registrations for
 */

export async function getMutualRegistrations(userId, eventId) {
  const result = await pool
    .request()
    .input("userId", userId)
    .input("eventId", eventId)
    .query(
      `SELECT u.ProfilePhotoURL, u.Name
     FROM Friends f
     JOIN CCEventRegistrations r ON r.UserId = f.UserId2
     JOIN Users u ON f.UserId2 = u.UserId
     WHERE f.Accepted = 1 AND r.EventId = @eventId AND f.UserId1 = @userId
     `
    );
  return result.recordset.map((registration) => ({
    profilePhotoURL: registration.ProfilePhotoURL,
    name: registration.Name,
  }));
}

/**
 * Register a user for an event
 * @param {number} userId - The ID of the user registering
 * @param {number} eventId - The ID of the event to register for
 * @return {Promise<boolean>} - Returns true if registration was successful, false if already registered
 */
export async function registerForEvent(userId, eventId) {
  const result = await pool
    .request()
    .input("userId", userId)
    .input("eventId", eventId)
    .query(
      `INSERT INTO CCEventRegistrations (EventId, UserId)
       VALUES (@eventId, @userId)`
    );
  if (result.rowsAffected[0] === 0) {
    return false; // Registration failed, possibly already registered
  }
  return true; // Successfully registered
}
/**
 * Unregister a user from an event
 * @param {number} userId - The ID of the user unregistering
 * @param {number} eventId - The ID of the event to unregister from
 * @return {Promise<boolean>} Returns true if the user was successfully unregistered, false otherwise.
 */
export async function unregisterFromEvent(userId, eventId) {
  const result = await pool
    .request()
    .input("userId", userId)
    .input("eventId", eventId)
    .query(
      `DELETE FROM CCEventRegistrations
       WHERE EventId = @eventId AND UserId = @userId`
    );
  if (result.rowsAffected[0] === 0) {
    return false; // Unregistration failed, possibly not registered
  }
  return true; // Successfully unregistered
}

/**Create an event
 * @param {number} CCId - The ID of the CC where the event is being created
 * @param {string} name - The name of the event
 * @param {string} description - The description of the event
 * @param {string} location - The location of the event
 * @param {Date} StartDateTime - The start date of the event
 * @param {Date} EndDateTime - The end date of the event
 * @returns {Promise<number>} - Returns the ID of the newly created event
 */
export async function createEvent(
  CCId,
  name,
  description,
  location,
  StartDateTime,
  EndDateTime
) {
  const result = await pool
    .request()
    .input("CCId", CCId)
    .input("name", name)
    .input("description", description)
    .input("location", location)
    .input("StartDateTime", StartDateTime)
    .input("EndDateTime", EndDateTime)
    .query(
      `INSERT INTO CCEvents (CCId, Name, Description, Location, StartDateTime, EndDateTime)
       OUTPUT INSERTED.EventId
       VALUES (@CCId, @name, @description, @location, @StartDateTime, @EndDateTime)`
    );
  return result.recordset[0].EventId; // Return the ID of the newly created event
}

/**Update an event
 * @param {number} eventId - The ID of the event to update
 * @param {string} name - The new name of the event
 * @param {string} description - The new description of the event
 * @param {string} location - The new location of the event
 * @param {Date} StartDateTime - The new start date of the event
 * @param {Date} EndDateTime - The new end date of the event
 * @returns {Promise<boolean>} - Returns true if the update was successful, false otherwise
 */
export async function updateEvent(
  eventId,
  name,
  description,
  location,
  StartDateTime,
  EndDateTime
) {
  const result = await pool
    .request()
    .input("eventId", eventId)
    .input("name", name)
    .input("description", description)
    .input("location", location)
    .input("StartDateTime", StartDateTime)
    .input("EndDateTime", EndDateTime)
    .query(
      `UPDATE CCEvents
       SET Name = @name, Description = @description, Location = @location, StartDateTime = @StartDateTime, EndDateTime = @EndDateTime
       WHERE EventId = @eventId`
    );
  return result.rowsAffected[0] > 0; // Return true if the update was successful
}

/**Delete an event
 * @param {number} eventId - The ID of the event to delete
 * @returns {Promise<boolean>} - Returns true if the deletion was successful, false otherwise
 */
export async function deleteEvent(eventId) {
  const result = await pool.request().input("eventId", eventId)
    .query(`DELETE FROM CCEventRegistrations WHERE EventId = @eventId;
DELETE FROM CCEvents WHERE EventId = @eventId;`);
  return result.rowsAffected[0] > 0; // Return true if the deletion was successful
}

/**Get all registrations for an event
 * @param {number} eventId - The ID of the event to get registrations for
 * @returns {Promise<{userId: number, name: string, phoneNumber: string ,profilePhotoURL: string}[]>} - Returns a list of users registered for the event
 */
export async function getRegistrationsForEvent(eventId) {
  const result = await pool
    .request()
    .input("eventId", eventId)
    .query(
      `SELECT u.UserId, u.Name, u.PhoneNumber, u.ProfilePhotoURL
       FROM CCEventRegistrations r
       JOIN Users u ON r.UserId = u.UserId
       WHERE r.EventId = @eventId`
    );
  return result.recordset.map((registration) => ({
    userId: registration.UserId,
    name: registration.Name,
    phoneNumber: registration.PhoneNumber,
    profilePhotoURL: registration.ProfilePhotoURL,
  }));
}

/** Get all events for a user
 * @param {number} userId - The ID of the user to get events for
 * @returns {Promise<{eventId: number, name: string, description: string, location: string,  StartDateTime: Date, EndDateTime: Date}[]>} - Returns a list of events the user is registered for
 */
export async function getEventsByUserId(userId) {
  const result = await pool
    .request()
    .input("userId", userId)
    .query(
      `SELECT e.EventId, e.Name, e.Description, e.Location, e.StartDateTime, e.EndDateTime
       FROM CCEventRegistrations r
       JOIN CCEvents e ON r.EventId = e.EventId
       WHERE r.UserId = @userId`
    );
  return result.recordset.map((event) => ({
    eventId: event.EventId,
    name: event.Name,
    description: event.Description,
    location: event.Location,
    StartDateTime: new Date(event.StartDateTime),
    EndDateTime: new Date(event.EndDateTime),
  }));
}
