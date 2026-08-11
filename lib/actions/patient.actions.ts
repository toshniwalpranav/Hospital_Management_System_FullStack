"use server";

import { ID, Query } from "node-appwrite";
import { InputFile } from "node-appwrite/file";

import {
  BUCKET_ID,
  NEXT_PUBLIC_DATABASE_ID,
  ENDPOINT,
  NEXT_PUBLIC_PATIENT_COLLECTION_ID,
  NEXT_PUBLIC_PROJECT_ID,
  databases,
  storage,
  users,
} from "../appwrite.config";

import { parseStringify } from "../utils";

// CREATE APPWRITE USER
export const createUser = async (user: CreateUserParams) => {
  try {
    const newUser = await users.create(
      ID.unique(),
      user.email,
      undefined,
      undefined,
      user.name
    );

    return parseStringify(newUser);
  } catch (error: any) {
    if (error?.code === 409) {
      const existingUser = await users.list([
        Query.equal("email", [user.email]),
      ]);

      if (existingUser.users.length > 0) {
        return parseStringify(existingUser.users[0]);
      }

      return {
        error: true,
        message:
          "Email already exists, but user record is invalid. Please contact support or use the 'Returning Patient?' button.",
      };
    }

    console.error(
      "An error occurred while creating a new user:",
      error instanceof Error ? error.message : String(error)
    );

    return {
      error: true,
      message: "Failed to create user.",
    };
  }
};

// GET USER
export const getUser = async (userId: string) => {
  try {
    const user = await users.get(userId);

    return parseStringify(user);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the user details:",
      error instanceof Error ? error.message : String(error)
    );

    return null;
  }
};

// REGISTER PATIENT
export const registerPatient = async ({
  identificationDocument,
  $id: _id,
  ...patient
}: RegisterUserParams) => {
  try {
    let file;
    let publicUrl: string | null = null;

    if (identificationDocument) {
      const blobEntry = identificationDocument.get("blobFile");
      const fileName = identificationDocument.get("fileName") as string;

      if (blobEntry instanceof Blob) {
        const arrayBuffer = await blobEntry.arrayBuffer();

        const inputFile = InputFile.fromBuffer(
          Buffer.from(arrayBuffer),
          fileName
        );

        file = await storage.createFile(
          BUCKET_ID!,
          ID.unique(),
          inputFile
        );

        if (file?.$id) {
          publicUrl =
            `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view?project=${NEXT_PUBLIC_PROJECT_ID}`;
        }
      }
    }

    const newPatient = await databases.createDocument(
      NEXT_PUBLIC_DATABASE_ID!,
      NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        identificationDocumentId: file?.$id ?? null,
        identificationDocumentUrl: publicUrl,
        ...patient,
      }
    );

    return parseStringify(newPatient);
  } catch (error) {
    console.error(
      "An error occurred while creating a new patient:",
      error instanceof Error ? error.message : String(error)
    );

    return null;
  }
};

// GET PATIENT
export const getPatient = async (userId: string) => {
  try {
    const patients = await databases.listDocuments(
      NEXT_PUBLIC_DATABASE_ID!,
      NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
      [
        Query.equal("userId", [userId]),
        Query.orderDesc("$updatedAt"),
        Query.limit(1),
      ]
    );

    if (patients.documents.length === 0) {
      return null;
    }

    return parseStringify(patients.documents[0]);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the patient details:",
      error instanceof Error ? error.message : String(error)
    );

    return null;
  }
};

// GET USER BY EMAIL
export const getUserByEmail = async (email: string) => {
  try {
    const usersList = await users.list([
      Query.equal("email", [email]),
    ]);

    if (usersList.users.length === 0) {
      return null;
    }

    return parseStringify(usersList.users[0]);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the user by email:",
      error instanceof Error ? error.message : String(error)
    );

    return null;
  }
};

// GET PATIENT BY EMAIL
export const getPatientByEmail = async (email: string) => {
  try {
    const patients = await databases.listDocuments(
      NEXT_PUBLIC_DATABASE_ID!,
      NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
      [
        Query.equal("email", [email]),
        Query.orderDesc("$updatedAt"),
        Query.limit(1),
      ]
    );

    if (patients.documents.length === 0) {
      return null;
    }

    return parseStringify(patients.documents[0]);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the patient by email:",
      error instanceof Error ? error.message : String(error)
    );

    return null;
  }
};

// UPDATE PATIENT USER ID
export const updatePatientUserId = async (
  patientId: string,
  userId: string
) => {
  try {
    const updated = await databases.updateDocument(
      NEXT_PUBLIC_DATABASE_ID!,
      NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
      patientId,
      {
        userId,
      }
    );

    return parseStringify(updated);
  } catch (error) {
    console.error(
      "An error occurred while updating patient userId:",
      error instanceof Error ? error.message : String(error)
    );

    return null;
  }
};