import fs from "fs";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

const CREDENTIALS_PATH =
  process.env.GOOGLE_OAUTH2_KEYFILE || "./keyfiles/google-oauth2.json";
const SCOPES = [
  "https://www.googleapis.com/auth/calendar",

  "https://www.googleapis.com/auth/gmail.send",
];

/**
 * Creates and returns a configured OAuth2Client
 * @returns {OAuth2Client}
 */
export function getOAuthClient() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const { client_secret, client_id, redirect_uris } =
    credentials.installed || credentials.web;

  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

/**
 * Generate the Google OAuth URL for user authentication.
 * @param {OAuth2Client} oAuth2Client\
 * @param {string} state
 * @returns {string}
 */
export function getAuthUrl(oAuth2Client, state) {
  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    state, // Include state for CSRF protection
  });
}
