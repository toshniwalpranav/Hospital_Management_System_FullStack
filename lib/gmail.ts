import { google } from "googleapis";

// Google OAuth settings now come from environment variables (no credentials.json needed)
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

// Redirect address: localhost on your PC, your Azure address when hosted
const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

export const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  `${baseUrl}/api/gmail/callback`
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

// GET GOOGLE CONSENT URL (used by /api/gmail/auth)
export function getAuthUrl(): string {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // forces Google to always issue a NEW refresh_token
    scope: ["https://www.googleapis.com/auth/gmail.send"],
  });
}

export async function sendGmail(
  to: string,
  subject: string,
  html: string
) {
  const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client,
  });

  const message = [
    `From: ${process.env.GMAIL_USER}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "",
    html,
  ].join("\r\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });

  return response.data;
}