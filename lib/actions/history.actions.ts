"use server";

import { ID, Query } from "node-appwrite";

import { databases } from "../appwrite.config";

const DB = process.env.NEXT_PUBLIC_DATABASE_ID!;
const APPT = process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!;
const PATIENT = process.env.NEXT_PUBLIC_PATIENT_COLLECTION_ID!;
const HIST = process.env.NEXT_PUBLIC_APPOINTMENT_HISTORY_COLLECTION_ID!;

export const saveHistory = async (appointmentId: string, changeType: string) => {
  try {
    const old = await databases.getDocument(DB, APPT, appointmentId);

    await databases.createDocument(DB, HIST, ID.unique(), {
      appointmentId,
      userId: old.userId,
      reason: old.reason ?? "",
      primaryPhysician: old.primaryPhysician,
      schedule: String(old.schedule),
      status: old.status,
      changeType,
      changedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("saveHistory failed:", error);
  }
};

export const getPatientHistory = async (userId: string) => {
  console.log("HISTORY DEBUG ids:", { userId, DB, APPT, PATIENT, HIST });

  let visits: any[] = [];
  let changes: any[] = [];
  let patientName = "Unknown patient";

  // Visits
  try {
    const res = await databases.listDocuments(DB, APPT, [
      Query.equal("userId", userId),
      Query.limit(100),
    ]);
    visits = res.documents;
  } catch (error) {
    console.error("VISITS query failed:", error);
  }

  // Change log
  try {
    const res = await databases.listDocuments(DB, HIST, [
      Query.equal("userId", userId),
      Query.limit(100),
    ]);
    changes = res.documents;
  } catch (error) {
    console.error("CHANGES query failed:", error);
  }

  // Patient name
  try {
    const res = await databases.listDocuments(DB, PATIENT, [
      Query.equal("userId", userId),
      Query.limit(1),
    ]);
    patientName = res.documents[0]?.name ?? "Unknown patient";
  } catch (error) {
    console.error("PATIENT query failed:", error);
  }

  // Sort in code so no extra Appwrite index is needed
  visits.sort(
    (a, b) => new Date(b.schedule).getTime() - new Date(a.schedule).getTime()
  );
  changes.sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );

  return {
    patientName,
    totalVisits: visits.length,
    visits: visits.map((d) => ({
      id: d.$id as string,
      schedule: d.schedule as string,
      reason: (d.reason as string) || "Not provided",
      doctor: d.primaryPhysician as string,
      status: d.status as string,
    })),
    changes: changes.map((c) => ({
      id: c.$id as string,
      changedAt: c.changedAt as string,
      changeType: c.changeType as string,
      previousStatus: c.status as string,
      previousSchedule: c.schedule as string,
    })),
  };
};