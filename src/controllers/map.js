/** @import { AuthenticatedRequestHandler } from "../types.js" */
import * as model from "../models/map.js";
import * as userModel from "../models/user.js";
import * as googleMaps from "../services/googleMaps.js";

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
  const viewingUser = await userModel.getUserByPhoneNumber(
    req.params.phoneNumber
  );
  if (viewingUser === null) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  if (req.userId === undefined) {
    res.status(401);
    return;
  }

  await model.shareLocation(req.userId, viewingUser.UserId);
  res.status(204).send();
}

/**
 * Revoke access for another user to view the current user's location.
 * @type {AuthenticatedRequestHandler}
 */
export async function revokeShare(req, res) {
  const viewingUserId = +req.params.userId;
  if (isNaN(viewingUserId)) {
    res.status(400).json({ error: "Invalid userId" });
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

/**
 * Get the users that can view the current user's location.
 * @type {AuthenticatedRequestHandler}
 */
export async function getViewers(req, res) {
  if (req.userId === undefined) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const viewers = await model.getViewers(req.userId);
  res.status(200).json(viewers);
}

/**
 * Get autocomplete suggestions for community center names.
 * @type {AuthenticatedRequestHandler}
 */
export async function getAutocompleteSuggestions(req, res) {
  if (req.userId === undefined) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { query } = req.query;
  if (typeof query !== "string" || query.trim().length === 0) {
    res.status(400).json({ error: "Query parameter is required" });
    return;
  }

  try {
    const suggestions = await googleMaps.autocompleteCCs(query.trim());
    res.status(200).json(suggestions);
  } catch (error) {
    console.error("Error fetching autocomplete suggestions:", error);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
}
