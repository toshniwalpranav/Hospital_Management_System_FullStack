import {
  Client,
  Databases,
  Messaging,
  Storage,
  Users,
} from "node-appwrite";

// Appwrite environment variables
export const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT;
export const NEXT_PUBLIC_PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID;
export const NEXT_PUBLIC_API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export const NEXT_PUBLIC_DATABASE_ID =
  process.env.NEXT_PUBLIC_DATABASE_ID;

export const NEXT_PUBLIC_PATIENT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_PATIENT_COLLECTION_ID;

export const NEXT_PUBLIC_DOCTOR_COLLECTION_ID =
  process.env.NEXT_PUBLIC_DOCTOR_COLLECTION_ID;

export const NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID;

export const BUCKET_ID =
  process.env.NEXT_PUBLIC_BUCKET_ID;

// Check required environment variables
if (!ENDPOINT) {
  throw new Error("Missing NEXT_PUBLIC_ENDPOINT in .env.local");
}

if (!NEXT_PUBLIC_PROJECT_ID) {
  throw new Error("Missing NEXT_PUBLIC_PROJECT_ID in .env.local");
}

if (!NEXT_PUBLIC_API_KEY) {
  throw new Error("Missing NEXT_PUBLIC_API_KEY in .env.local");
}

if (!NEXT_PUBLIC_DATABASE_ID) {
  throw new Error("Missing NEXT_PUBLIC_DATABASE_ID in .env.local");
}

if (!NEXT_PUBLIC_PATIENT_COLLECTION_ID) {
  throw new Error(
    "Missing NEXT_PUBLIC_PATIENT_COLLECTION_ID in .env.local"
  );
}

if (!NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID) {
  throw new Error(
    "Missing NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID in .env.local"
  );
}

if (!BUCKET_ID) {
  throw new Error("Missing NEXT_PUBLIC_BUCKET_ID in .env.local");
}

// Create Appwrite client
const client = new Client();

client
  .setEndpoint(ENDPOINT)
  .setProject(NEXT_PUBLIC_PROJECT_ID)
  .setKey(NEXT_PUBLIC_API_KEY);

// Appwrite services
export const databases = new Databases(client);
export const users = new Users(client);
export const messaging = new Messaging(client);
export const storage = new Storage(client);