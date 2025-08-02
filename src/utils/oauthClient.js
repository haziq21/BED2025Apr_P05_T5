const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");

// Initialize OAuth client
const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

module.exports = oAuth2Client;
