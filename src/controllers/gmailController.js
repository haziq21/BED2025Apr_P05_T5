import { google } from "googleapis";
import { getOAuthClient, getAuthUrl } from "../utils/googleAuth.js";
import * as model from "../models/interestGroupAdmin.js";
import * as gmailService from "../services/gmailService.js";
/** @type {{ [key: string]: any }} */
/** @type {{ [key: string]: { userId: string, returnUrl: string } }} */
const oauthStates = {};
function generateUniqueId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/** Redirect user to Google OAuth (Koh Hau's code)
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
  const authUrl = getAuthUrl(oAuth2Client, state); // Pass state to getAuthUrl

  res.json({ authUrl: authUrl });
}

/** Handle callback from Google OAuth (Koh Hau's code)
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
 * Send approval email and update application status
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 */
export async function sendApprovalEmail(req, res) {
  try {
    const { ProposalId, Status } = req.body;
    const userId = req.userId;

    // 1. Get application data
    const application = await model.getApplicationById(ProposalId);
    if (!application) throw new Error("Application not found");

    // 2. Update status
    await model.reviewApplication(ProposalId, Status);

    // 3. Send email (using existing gmailService)
    await gmailService.sendApprovalEmail(
      application.recordset[0].UserEmail, // Adjust field names as needed
      application.recordset[0].Title,
      Status === "approved"
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Email sending failed:", error);
    res.status(500).json({ error });
  }
}
