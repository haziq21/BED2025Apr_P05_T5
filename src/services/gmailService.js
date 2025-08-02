/**
 * Service for sending emails via Gmail API.
 * @module services/gmailService
 * @requires googleapis
 * @requires ../utils/oauthClient
 */

const { google } = require("googleapis");
const oAuth2Client = require("../utils/oauthClient");

/**
 * Sends an approval/rejection email via Gmail API.
 * @param {string} recipient - Email address of the recipient.
 * @param {string} title - Title of the application (from MSSQL `InterestGroupProposals.Title`).
 * @param {boolean} isApproved - Whether the application was approved.
 * @returns {Promise<void>} Resolves when email is sent.
 * @throws {Error} If Gmail API fails.
 */
async function sendApprovalEmail(recipient, title, isApproved) {
  if (!recipient || !title) {
    throw new Error("Missing required fields: recipient or title");
  }

  try {
    // Initialize Gmail API client
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    // Email content
    const subject = isApproved
      ? `Approved: Your application for "${title}"`
      : `Update: Your application for "${title}"`;

    const body = isApproved
      ? `Congratulations! Your application for "${title}" has been approved.`
      : `We regret to inform you that your application for "${title}" was not approved.`;

    // Format raw email message
    const rawMessage = [
      `To: ${recipient}`,
      `Subject: ${subject}`,
      "Content-Type: text/html; charset=utf-8",
      "",
      body,
    ].join("\n");

    // Send email
    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: Buffer.from(rawMessage).toString("base64"),
      },
    });

    console.log(`Email sent to ${recipient}`);
  } catch (error) {
    console.error("[GmailService] Failed to send email:");
    throw new Error(`Email failed`);
  }
}

module.exports = { sendApprovalEmail };
