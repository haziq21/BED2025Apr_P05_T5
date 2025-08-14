// import { google } from "googleapis";
// import { getOAuthClient } from "../utils/googleAuth.js";
// import { saveGoogleTokens } from "../models/googleAuth.js";

// /**
//  * Service for sending emails via Gmail API.
//  * @module services/gmailService
//  * @requires googleapis
//  */

// /**
//  * Sends an approval/rejection email via Gmail API.
//  * @param {string} recipient - Email address of the recipient.
//  * @param {string} title - Title of the application (from MSSQL `InterestGroupProposals.Title`).
//  * @param {string} isApproved - Whether the application was approved.
//  * @returns {Promise<void>} Resolves when email is sent.
//  * @throws {Error} If Gmail API fails.
//  */

// export async function sendApprovalEmail(recipient, title, isApproved) {
//   if (!recipient || !title) {
//     throw new Error("Missing required fields: recipient or title");
//   }

//   try {
//     // Initialize Gmail API client
//     // @ts-ignore
//     const gmail = google.gmail({ version: "v1", auth: getOAuthClient });

//     // Email content
//     const subject = isApproved
//       ? `Approved: Your application for "${title}"`
//       : `Update: Your application for "${title}"`;

//     const body = isApproved
//       ? `Congratulations! Your application for "${title}" has been approved.`
//       : `We regret to inform you that your application for "${title}" was not approved.`;

//     // Format raw email message
//     const rawMessage = [
//       `To: ${recipient}`,
//       `Subject: ${subject}`,
//       "Content-Type: text/html; charset=utf-8",
//       "",
//       body,
//     ].join("\n");

//     // Send email
//     await gmail.users.messages.send({
//       userId: "me",
//       requestBody: {
//         raw: Buffer.from(rawMessage).toString("base64"),
//       },
//     });

//     console.log(`Email sent to ${recipient}`);
//   } catch (error) {
//     console.error("[GmailService] Failed to send email:");
//     throw new Error(`Email failed`);
//   }
// }

// services/googleEmailService.js
import fs from "fs";
import { google } from "googleapis";
import * as model from "../models/interestGroupAdmin.js";
import { getOAuthClient, getAuthUrl } from "../utils/googleAuth.js";

/** In-memory state store (use DB/Redis in production) */
/**
 * @type {{ [key: string]: { userId: any, returnUrl: string } }}
 */
const oauthStates = {};

function generateUniqueId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Redirect user to Google OAuth
 * @param {{ userId: any; headers: { referer: string; }; }} req
 * @param {{ status: (arg0: number) => { (): any; new (): any; json: { (arg0: { error: string; }): any; new (): any; }; }; json: (arg0: { authUrl: string; }) => void; }} res
 */
export function redirectToGoogleOAuth(req, res) {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const oAuth2Client = getOAuthClient();
  const state = generateUniqueId();
  const returnUrl = req.headers.referer || "/";

  oauthStates[state] = { userId, returnUrl };
  const authUrl = getAuthUrl(oAuth2Client, state);
  res.json({ authUrl });
}

/**
 * Handle OAuth callback
 * @param {{ query: { code: any; state: any; }; }} req
 * @param {{ status: (arg0: number) => { (): any; new (): any; send: { (arg0: string): void; new (): any; }; }; redirect: (arg0: any) => void; }} res
 */
export async function oauthCallback(req, res) {
  try {
    const oAuth2Client = getOAuthClient();
    const code = req.query.code;
    const stateRaw = req.query.state;
    const state = Array.isArray(stateRaw) ? stateRaw[0] : stateRaw;

    const stateData = oauthStates[state];
    if (!stateData || !stateData.userId)
      return res.status(400).send("Invalid state");

    const { userId, returnUrl } = stateData;
    delete oauthStates[state];

    const tokenResponse = await oAuth2Client.getToken(code);
    const tokens = tokenResponse.tokens;
    oAuth2Client.setCredentials(tokens);

    // Save tokens in DB for the user
    await model.saveGoogleTokens(Number(userId), tokens);

    res.redirect(returnUrl);
  } catch (error) {
    console.error("OAuth callback failed:", error);
    res.status(500).send("Authentication failed");
  }
}

/**
 * Send approval/rejection email
 * @param {any} userId
 * @param {any} recipient
 * @param {string} title
 * @param {string | undefined} [isApproved]
 */
export async function sendApprovalEmail(userId, recipient, title, isApproved) {
  try {
    if (!recipient || !title) throw new Error("Missing recipient or title");

    // Load user's saved Google tokens
    const tokens = await model.getGoogleTokens(Number(userId));
    if (!tokens) throw new Error("User has not connected Google account");

    // Create OAuth2 client
    const oAuth2Client = getOAuthClient();
    oAuth2Client.setCredentials(tokens);

    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    // Prepare email
    const subject = isApproved
      ? `Approved: Your application for "${title}"`
      : `Update: Your application for "${title}"`;

    const body = isApproved
      ? `Congratulations! Your application for "${title}" has been approved.`
      : `We regret to inform you that your application for "${title}" was not approved.`;

    const rawMessage = [
      `To: ${recipient}`,
      `Subject: ${subject}`,
      "Content-Type: text/html; charset=utf-8",
      "",
      body,
    ].join("\n");

    const encodedMessage = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Send email
    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });

    console.log(`[GoogleEmailService] Email sent to ${recipient}`);
  } catch (error) {
    console.error("[GoogleEmailService] Failed to send email:", error);
    throw error;
  }
}
