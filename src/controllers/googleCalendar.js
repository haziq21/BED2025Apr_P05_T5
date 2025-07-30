import { google } from "googleapis";
import { getOAuthClient, getAuthUrl } from "../utils/googleAuth.js";
import * as model from "../models/googleAuth.js";
import * as calendarService from "../services/googleCalendarService.js";

/** Redirect user to Google OAuth
 * @typedef {import('express').Request & { userId?: any }} AuthenticatedRequest
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * */
export function redirectToGoogleOAuth(req, res) {
  const oAuth2Client = getOAuthClient();
  const url = getAuthUrl(oAuth2Client);
  res.redirect(url);
}

/** Handle callback from Google OAuth
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
export async function oauthCallback(req, res) {
  const oAuth2Client = getOAuthClient();
  const code = req.query.code;
  const userId = 1;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!code || typeof code !== "string") {
    res.status(400).json({ error: "Missing or invalid code in query." });
    return;
  }

  const tokenResponse = await oAuth2Client.getToken(code);
  const tokens = tokenResponse.tokens;

  oAuth2Client.setCredentials(tokens);
  await model.saveGoogleTokens(userId, tokens); // Save tokens to the database
  res.status(200).json({ message: "Google account linked successfully" });
}

/**
 * Add a calendar event using user input.
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 */
export async function addCalendarEvent(req, res) {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const tokens = await model.getGoogleTokens(userId);
  if (!tokens) return res.status(401).json({ error: "Google not linked" });

  try {
    await calendarService.addEventToGoogleCalendar(tokens, req.body);
    res.status(201).json({ message: "Event added to Google Calendar!" });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      error: err instanceof Error ? err.message : "An unknown error occurred",
    });
  }
}
