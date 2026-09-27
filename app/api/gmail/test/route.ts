import { NextResponse } from "next/server";
import { sendGmail } from "@/lib/gmail";

export async function GET() {
  try {
    await sendGmail(
      "toshniwalpranav.30@gmail.com",
      "Test Email - Doctor Appointment System",
      `
        <h2>Test Email</h2>
        <p>This email was sent using Gmail API.</p>
        <p>Your Gmail integration is working successfully.</p>
      `
    );

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully!",
    });
  } catch (error) {
    console.error("Gmail test error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send test email",
      },
      { status: 500 }
    );
  }
}