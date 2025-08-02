import * as model from "../models/events.js";
import * as authModel from "../models/googleAuth.js";
import * as calendarService from "../services/googleCalendarService.js";
/** get all events for a CC
 * @typedef {import('express').Request & { userId?: any }} AuthenticatedRequest
 * @type {import("express").RequestHandler}
 */
export async function getEventsByCCId(req, res) {
  const CCId = +req.params.CCId;
  if (isNaN(CCId)) {
    res.status(400).json({ error: "Invalid CC ID" });
    return;
  }

  const events = await model.getEventsByCCId(CCId);
  res.status(200).json(events);
}

/** get an event by its ID
 * @type {import("express").RequestHandler}
 */
export async function getEventById(req, res) {
  const eventId = +req.params.eventId;
  if (isNaN(eventId)) {
    res.status(400).json({ error: "Invalid Event ID" });
    return;
  }

  const event = await model.getEventById(eventId);
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.status(200).json(event);
}

/** get mutual registrations for an event
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res */
export async function getMutualRegistrations(req, res) {
  const userId = +req.userId;
  const eventId = +req.params.eventId;

  if (isNaN(userId) || isNaN(eventId)) {
    res.status(400).json({ error: "Invalid User ID or Event ID" });
    return;
  }

  const mutualRegistrations = await model.getMutualRegistrations(
    userId,
    eventId
  );
  res.status(200).json(mutualRegistrations);
}

/** Register for event and add to Google Calendar
 * @type {import("express").RequestHandler}
 * @param {AuthenticatedRequest} req
 */
export async function registerForEvent(req, res) {
  const userId = req.userId;
  const eventId = parseInt(req.params.eventId);

  const success = await model.registerForEvent(userId, eventId);
  if (!success) throw new Error("Event registration failed.");

  const eventDetails = await model.getEventById(eventId);
  const tokens = await authModel.getGoogleTokens(userId);

  if (tokens && eventDetails) {
    const eventInput = {
      summary: eventDetails.name,
      description: eventDetails.description,
      location: eventDetails.location,
      startDateTime: new Date(eventDetails.StartDateTime).toISOString(),
      endDateTime: new Date(eventDetails.EndDateTime).toISOString(),
    };

    const googleEventId = await calendarService.addEventToGoogleCalendar(
      tokens,
      eventInput,
      userId
    );

    if (typeof googleEventId === "string") {
      await model.saveGoogleCalendarEventId(userId, eventId, googleEventId);
    } else {
      throw new Error("Failed to create Google Calendar event ID.");
    }
  }

  res.status(200).json({ message: "Registered and added to calendar." });
}

/** Unregister from event and remove from Google Calendar */
/** @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * @returns {Promise<void>} */
export async function unregisterFromEvent(req, res) {
  const userId = req.userId;
  const eventId = parseInt(req.params.eventId);

  const success = await model.unregisterFromEvent(userId, eventId);
  if (!success) {
    res
      .status(404)
      .json({ error: "Event not found or user is not registered." });
  }
  const tokens = await authModel.getGoogleTokens(userId);

  if (tokens) {
    const googleEventId = await model.getGoogleCalendarEventId(userId, eventId);
    if (googleEventId) {
      await calendarService.removeEventFromGoogleCalendar(
        tokens,
        googleEventId,
        userId
      );
      await model.deleteGoogleCalendarEventId(userId, eventId);
    }
  }

  res.status(200).json({ message: "Unregistered and removed from calendar." });
}

/** create a new event
 * @type {import("express").RequestHandler}
 */
export async function createEvent(req, res) {
  const { CCId, name, description, location, startDate, endDate } = req.body;

  if (!CCId || !name || !description || !location || !startDate || !endDate) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const newEvent = await model.createEvent(
    CCId,
    name,
    description,
    location,
    startDate,
    endDate
  );
  res.status(201).json(newEvent);
}

/** update an existing event
 * @type {import("express").RequestHandler}
 */
export async function updateEvent(req, res) {
  const eventId = +req.params.eventId;
  const { name, description, location, startDate, endDate } = req.body;

  if (isNaN(eventId)) {
    res.status(400).json({ error: "Invalid Event ID" });
    return;
  }

  if (!name || !description || !startDate || !endDate || !location) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const updatedEvent = await model.updateEvent(
    eventId,
    name,
    description,
    location,
    startDate,
    endDate
  );
  if (!updatedEvent) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.status(200).json({ message: "Event successfully updated" });
}

/** delete an event
 * @type {import("express").RequestHandler}
 */
export async function deleteEvent(req, res) {
  const eventId = +req.params.eventId;

  if (isNaN(eventId)) {
    res.status(400).json({ error: "Invalid Event ID" });
    return;
  }

  const deleted = await model.deleteEvent(eventId);
  if (!deleted) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.status(200).json({ message: "Event successfully deleted" });
}

/** get all registrations for an event
 * @type {import("express").RequestHandler}
 */
export async function getRegistrationsByEventId(req, res) {
  const eventId = +req.params.eventId;

  if (isNaN(eventId)) {
    res.status(400).json({ error: "Invalid Event ID" });
    return;
  }

  const registrations = await model.getRegistrationsForEvent(eventId);
  res.status(200).json(registrations);
}

/** get all events for a user
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res */
export async function getEventsByUserId(req, res) {
  const userId = +req.userId;
  console.log(
    "Inside getEventsByUserId - req.userId:",
    req.userId,
    typeof req.userId
  );
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid User ID" });
    return;
  }

  const events = await model.getEventsByUserId(userId);
  res.status(200).json(events);
}
