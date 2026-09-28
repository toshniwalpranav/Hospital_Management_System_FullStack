import { NextRequest, NextResponse } from "next/server";
import { Query } from "node-appwrite";

import {
  databases,
  NEXT_PUBLIC_DATABASE_ID,
  NEXT_PUBLIC_PATIENT_COLLECTION_ID,
} from "@/lib/appwrite.config";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Invalid email" },
      { status: 400 }
    );
  }

  try {
    console.log("===== CHECK EMAIL =====");
    console.log("Email:", email);
    console.log("Database ID:", NEXT_PUBLIC_DATABASE_ID);
    console.log(
      "Patient Collection ID:",
      NEXT_PUBLIC_PATIENT_COLLECTION_ID
    );

    const response = await databases.listDocuments(
      NEXT_PUBLIC_DATABASE_ID!,
      NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
      [Query.equal("email", email)]
    );

    const exists = response.documents.length > 0;

    let userId: string | null = null;

    if (exists) {
      const patientDoc = response.documents[0];

      userId =
        typeof patientDoc.userId === "string"
          ? patientDoc.userId
          : null;
    }

    console.log("Patient exists:", exists);
    console.log("User ID:", userId);

    // Return ONLY simple JSON values
    return NextResponse.json({
      exists: Boolean(exists),
      userId,
    });
  } catch (error) {
    console.error("===== CHECK EMAIL ERROR =====");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("Unknown error:", String(error));
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        exists: false,
        userId: null,
      },
      {
        status: 500,
      }
    );
  }
}