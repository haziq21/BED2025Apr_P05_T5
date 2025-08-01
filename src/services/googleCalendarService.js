import { google } from "googleapis";
import { getOAuthClient } from "../utils/googleAuth.js";
import { saveGoogleTokens } from "../models/googleAuth.js";

/**
 * Add event to Google Calendar after validation.
 * @param {import('google-auth-library').Credentials} tokens
 * @param {object} eventInput
 */
/**
 * @typedef {Object} EventInput
 * @property {string} summary
 * @property {string} [description]
 * @property {string} [location]
 * @property {string} startDateTime
 * @property {string} endDateTime
 * @property {number} [reminderMinutes]
 */

/**
 * Add event to Google Calendar after validation.
 * @param {import('google-auth-library').Credentials} tokens
 * @param {EventInput} eventInput
 * @param {number} userId
 */
export async function addEventToGoogleCalendar(tokens, eventInput, userId) {
  const {
    summary,
    description,
    location,
    startDateTime,
    endDateTime,
    reminderMinutes = 180,
  } = eventInput;

  // Validate required fields
  if (!summary || !startDateTime || !endDateTime) {
    throw new Error(
      "Missing required fields: summary, startDateTime, endDateTime"
    );
  }

  const now = new Date();
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid date format");
  }

  if (start < now) {
    throw new Error("Start date/time cannot be in the past");
  }

  if (start >= end) {
    throw new Error("End date/time must be after start date/time");
  }

  const oAuth2Client = getOAuthClient();
  oAuth2Client.setCredentials(tokens);

  oAuth2Client.on("tokens", (newTokens) => {
    if (newTokens.access_token) {
      console.log("Token refreshed, saving new access token for user:", userId);
      const allTokens = { ...tokens, ...newTokens };
      saveGoogleTokens(userId, allTokens);
    }
  });
  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  const event = {
    summary,
    description,
    location,
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
    reminders: {
      useDefault: false,
      overrides: [{ method: "popup", minutes: reminderMinutes }],
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
  });
  return response.data.id; // Return the Google event ID
}

/**
 * Remove calendar event by Google Event ID
 * @param {import('google-auth-library').Credentials} tokens
 * @param {string} googleEventId
 * @param {number} userId
 */
export async function removeEventFromGoogleCalendar(
  tokens,
  googleEventId,
  userId
) {
  const oAuth2Client = getOAuthClient();
  oAuth2Client.setCredentials(tokens);
  oAuth2Client.on("tokens", (newTokens) => {
    if (newTokens.access_token) {
      console.log("Token refreshed, saving new access token for user:", userId);
      const allTokens = { ...tokens, ...newTokens };
      saveGoogleTokens(userId, allTokens);
    }
  });
  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  await calendar.events.delete({
    calendarId: "primary",
    eventId: googleEventId,
  });
}
