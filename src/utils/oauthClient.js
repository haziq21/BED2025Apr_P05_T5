import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

// Initialize OAuth client
export const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
