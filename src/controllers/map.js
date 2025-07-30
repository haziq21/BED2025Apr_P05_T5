/** @import { AuthenticatedRequestHandler } from "../types.js" */
import * as model from "../models/map.js";

/**
 * Retrieve all local services.
 * @type {AuthenticatedRequestHandler}
 */
export async function getLocalServices(req, res) {
  const services = await model.getLocalServices();
  res.status(200).json(services);
}

/**
 * Create a local service from the JSON body.
 * @type {AuthenticatedRequestHandler}
 */
export async function addLocalService(req, res) {
  const createdService = await model.addLocalService(req.body);
  res.status(201).json(createdService);
}

/**
 * Update the current user's tracked location.
 * @type {AuthenticatedRequestHandler}
 */
export async function updateUserLocation(req, res) {
  const { lat, lon } = req.body;
  if (typeof lat !== "number" || typeof lon !== "number") {
    res.status(400).json({ error: "Invalid location data" });
    return;
  }

  if (req.userId === undefined) {
    res.status(401);
    return;
  }
  await model.updateUserLocation(req.userId, { lat, lon });
  res.status(204).send();
}

/**
 * Request to share the user's location with another user.
 * @type {AuthenticatedRequestHandler}
 */
export async function shareLocation(req, res) {
  const viewingUserId = req.params.userId;
  if (typeof viewingUserId !== "number") {
    res.status(400).json({ error: "Invalid viewingUserId" });
    return;
  }

  if (req.userId === undefined) {
    res.status(401);
    return;
  }

  await model.shareLocation(req.userId, viewingUserId);
  res.status(204).send();
}

/**
 * Accept a request to share another user's location with the current user.
 * @type {AuthenticatedRequestHandler}
 */
export async function acceptShareRequest(req, res) {
  const locatedUserId = +req.params.userId;
  if (isNaN(locatedUserId)) {
    res.status(400).json({ error: "Invalid userId" });
    return;
  }

  if (req.userId === undefined) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const success = await model.acceptShareRequest(req.userId, locatedUserId);
  if (!success) {
    res.status(404).json({ error: "Share request not found" });
    return;
  }
  res.status(204).send();
}

/**
 * Revoke access for another user to view the current user's location.
 * @type {AuthenticatedRequestHandler}
 */
export async function revokeShare(req, res) {
  const { viewingUserId } = req.body;
  if (typeof viewingUserId !== "number") {
    res.status(400).json({ error: "Invalid viewingUserId" });
    return;
  }

  if (req.userId === undefined) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const success = await model.revokeShare(req.userId, viewingUserId);
  if (!success) {
    res.status(404).json({ error: "Share not found" });
    return;
  }
  res.status(204).send();
}

/**
 * Get the locations of users that the current user can view.
 * @type {AuthenticatedRequestHandler}
 */
export async function getSharedLocations(req, res) {
  if (req.userId === undefined) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const locations = await model.getSharedLocations(req.userId);
  res.status(200).json(locations);
}
