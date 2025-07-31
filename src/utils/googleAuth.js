import fs from "fs";
import path from "path";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

const CREDENTIALS_PATH = path.join(process.cwd(), "google-credentials.json");
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

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
 * @param {OAuth2Client} oAuth2Client
 * @returns {string}
 */
export function getAuthUrl(oAuth2Client) {
  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
}
