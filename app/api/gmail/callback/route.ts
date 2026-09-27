import { NextResponse } from "next/server";
import { oauth2Client } from "@/lib/gmail";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code missing" },
        { status: 400 }
      );
    }

    const { tokens } = await oauth2Client.getToken(code);

    console.log("=====================================================");
    console.log("GMAIL AUTH SUCCESS. Copy this into .env.local:");
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log("=====================================================");

    return NextResponse.json({
      message:
        "Gmail authorization successful! Check your terminal for the new GMAIL_REFRESH_TOKEN — copy it into .env.local and restart the dev server.",
      refresh_token_received: !!tokens.refresh_token,
    });
  } catch (error) {
    console.error("Gmail OAuth error:", error);
    return NextResponse.json(
      { error: "Failed to authorize Gmail" },
      { status: 500 }
    );
  }
}