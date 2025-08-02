import { google } from "googleapis";
import { getOAuthClient, getAuthUrl } from "../utils/googleAuth.js";
import * as model from "../models/googleAuth.js";
import * as calendarService from "../services/googleCalendarService.js";
/** @type {{ [key: string]: any }} */
/** @type {{ [key: string]: { userId: string, returnUrl: string } }} */
const oauthStates = {};
function generateUniqueId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
/** Redirect user to Google OAuth
 * @typedef {import('express').Request & { userId?: any }} AuthenticatedRequest
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * */
export function redirectToGoogleOAuth(req, res) {
  // userId is available here because verifyJWT runs on this route (/api/googleCalendar/auth/url)
  const userId = req.userId;

  if (!userId) {
    // This case should ideally be handled by verifyJWT, but added for safety
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const oAuth2Client = getOAuthClient();
  const state = generateUniqueId(); // Generate unique state
  const returnUrl = req.headers.referer || "/"; // Get the referring URL or default to homepage

  // Store the state and associate it with the userId temporarily
  // *** Replace this with persistent storage in production ***
  oauthStates[state] = { userId: userId, returnUrl: returnUrl };
  console.log(
    `Generated state: ${state} for userId: ${userId}, returnUrl: ${returnUrl}`
  );
  console.log("Current oauthStates:", oauthStates); // Log for debugging

  // Get the auth URL including the state parameter
  // ASSUMPTION: getAuthUrl supports a state parameter. If not, you'll need to construct the URL manually.
  const authUrl = getAuthUrl(oAuth2Client, state); // Pass state to getAuthUrl

  res.json({ authUrl: authUrl });
}

/** Handle callback from Google OAuth
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
export async function oauthCallback(req, res) {
  const oAuth2Client = getOAuthClient();
  const code = req.query.code;
  const stateRaw = req.query.state; // Get the state parameter from Google's redirect
  const state = Array.isArray(stateRaw) ? stateRaw[0] : stateRaw; // Ensure state is a string

  console.log("Received OAuth callback. Code:", code, "State:", state); // Log for debugging
  console.log("Current oauthStates:", oauthStates); // Log for debugging

  //State Validation and userId retrieval
  const stateData = typeof state === "string" ? oauthStates[state] : undefined;
  if (!stateData || !stateData.userId) {
    // Invalid or expired state
    console.error("Invalid or expired OAuth state:", state);
    res.status(400).send("Authentication failed. Invalid state.");
    return;
  }

  const userId = stateData.userId;
  const returnUrl = stateData.returnUrl;

  // Remove the state to clean up temporary storage
  if (typeof state === "string") {
    delete oauthStates[state];
  }
  console.log(`Validated state: ${state}. Retrieved userId: ${userId}`); // Log for debugging
  console.log("oauthStates after deletion:", oauthStates); // Log for debugging
  // --- End State Validation ---

  if (!code || typeof code !== "string") {
    res.status(400).json({ error: "Missing or invalid code in query." });
    return;
  }

  const tokenResponse = await oAuth2Client.getToken(code);
  const tokens = tokenResponse.tokens;

  oAuth2Client.setCredentials(tokens);
  // Save tokens for the user retrieved from the state
  await model.saveGoogleTokens(Number(userId), tokens);
  console.log(`Successfully saved Google tokens for userId: ${userId}`); // Log for debugging
  res.redirect(returnUrl);
}

/**
 * Add a calendar event using user input.
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * @return {Promise<void>}
 */
export async function addCalendarEvent(req, res) {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const tokens = await model.getGoogleTokens(userId);
  if (!tokens) {
    res.status(401).json({ error: "Google not linked" });
    return;
  }

  try {
    await calendarService.addEventToGoogleCalendar(
      tokens,
      req.body,
      req.userId
    );
    res.status(201).json({ message: "Event added to Google Calendar!" });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      error: err instanceof Error ? err.message : "An unknown error occurred",
    });
  }
}

/**
 * Check if a user has linked their Google Calendar.
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * @return {Promise<void>}
 */
export async function checkGoogleCalendarLinkStatus(req, res) {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const tokens = await model.getGoogleTokens(userId);

    const isLinked = tokens && tokens.refresh_token;
    res.status(200).json({ isLinked });
  } catch (error) {
    console.error("Error checking Google Calendar link status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * remove a calendar event
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 */
export async function removeCalendarEvent(req, res) {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const tokens = await model.getGoogleTokens(userId);
  if (!tokens) return res.status(401).json({ error: "Google not linked" });

  try {
    await calendarService.removeEventFromGoogleCalendar(
      tokens,
      req.body,
      req.userId
    );
    res.status(201).json({ message: "Event removed from Google Calendar!" });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      error: err instanceof Error ? err.message : "An unknown error occurred",
    });
  }
}
