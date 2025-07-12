import * as model from "../models/events.js";

/** get all events for a CC
 * @type {import("express").RequestHandler}
 */
export async function getEventsByCCId(req, res) {
  const CCId = +req.params.CCid;
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
  const eventId = +req.params.id;
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
 * @type {import("express").RequestHandler}
 */
export async function getMutualRegistrations(req, res) {
  const userId = +req.params.userId;
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

/** register for an event
 * @type {import("express").RequestHandler}
 */
export async function registerForEvent(req, res) {
  const userId = +req.params.userId;
  const eventId = +req.params.eventId;

  if (isNaN(userId) || isNaN(eventId)) {
    res.status(400).json({ error: "Invalid User ID or Event ID" });
    return;
  }

  const registration = await model.registerForEvent(userId, eventId);
  if (!registration) {
    res.status(404).json({ error: "Event not found or already registered" });
    return;
  }

  res.status(201).json({ message: "Successfully registered for the event" });
}

/** unregister from an event
 * @type {import("express").RequestHandler}
 */
export async function unregisterFromEvent(req, res) {
  const userId = +req.params.userId;
  const eventId = +req.params.eventId;

  if (isNaN(userId) || isNaN(eventId)) {
    res.status(400).json({ error: "Invalid User ID or Event ID" });
    return;
  }

  const unregistration = await model.unregisterFromEvent(userId, eventId);
  if (!unregistration) {
    res.status(404).json({ error: "Event not found or not registered" });
    return;
  }

  res.status(200).json({ message: "Successfully unregistered from the event" });
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
  const eventId = +req.params.id;
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
  const eventId = +req.params.id;

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
  const eventId = +req.params.id;

  if (isNaN(eventId)) {
    res.status(400).json({ error: "Invalid Event ID" });
    return;
  }

  const registrations = await model.getRegistrationsForEvent(eventId);
  res.status(200).json(registrations);
}

/** get all events for a user
 * @type {import("express").RequestHandler}
 */
export async function getEventsByUserId(req, res) {
  const userId = +req.params.userId;

  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid User ID" });
    return;
  }

  const events = await model.getEventsByUserId(userId);
  res.status(200).json(events);
}
