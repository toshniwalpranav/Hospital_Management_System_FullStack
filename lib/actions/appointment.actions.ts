"use server";

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";

import { Appointment } from "@/types/appwrite.types";
import { sendGmail } from "@/lib/gmail";

import {
  NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID,
  NEXT_PUBLIC_DATABASE_ID,
  NEXT_PUBLIC_PATIENT_COLLECTION_ID,
  databases,
  users,
} from "../appwrite.config";

import { formatDateTime, parseStringify } from "../utils";

// CREATE APPOINTMENT
export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    const newAppointment = await databases.createDocument(
      NEXT_PUBLIC_DATABASE_ID!,
      NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointment
    );

    revalidatePath("/admin");

    return parseStringify(newAppointment);
  } catch (error) {
    console.error(
      "An error occurred while creating a new appointment:",
      error
    );

    return null;
  }
};

// GET RECENT APPOINTMENTS
export const getRecentAppointmentList = async () => {
  try {
    console.log("ADMIN: Starting getRecentAppointmentList");

    const appointments = await databases.listDocuments(
      NEXT_PUBLIC_DATABASE_ID!,
      NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
      [Query.orderDesc("$createdAt")]
    );

    console.log(
      "ADMIN: Appwrite response received. Total:",
      appointments.total
    );

    // Count appointment statuses
    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    };

    const counts = (
      appointments.documents as unknown as Appointment[]
    ).reduce(
      (acc, appointment) => {
        switch (appointment.status) {
          case "scheduled":
            acc.scheduledCount++;
            break;

          case "pending":
            acc.pendingCount++;
            break;

          case "cancelled":
            acc.cancelledCount++;
            break;
        }

        return acc;
      },
      initialCounts
    );

    // --------------------------------------------------
    // GET PATIENT DETAILS
    // --------------------------------------------------

    const documentsWithPatients = await Promise.all(
      appointments.documents.map(async (appointment: any) => {
        try {
          // Appwrite currently returns patient as an ID
          const patientId =
            typeof appointment.patient === "string"
              ? appointment.patient
              : appointment.patient?.$id;

          console.log(
            "ADMIN: Patient ID:",
            patientId
          );

          if (!patientId) {
            console.log(
              "ADMIN: No patient ID for appointment:",
              appointment.$id
            );

            return {
              ...appointment,
              patient: null,
            };
          }

          // Get patient document from Patient collection
          const patient = await databases.getDocument(
            NEXT_PUBLIC_DATABASE_ID!,
            NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
            patientId
          );

          console.log(
            "ADMIN: Patient found:",
            patient.name
          );

          return {
            ...appointment,

            // Replace patient ID with complete patient object
            patient,
          };
        } catch (error) {
          console.error(
            "ADMIN: Could not load patient:",
            appointment.patient,
            error
          );

          return {
            ...appointment,
            patient: null,
          };
        }
      })
    );

    const data = {
      totalCount: appointments.total,
      ...counts,
      documents: documentsWithPatients,
    };

    console.log(
      "ADMIN: Appointment data prepared successfully"
    );

    return parseStringify(data);
  } catch (error) {
    console.error(
      "ADMIN ERROR - getRecentAppointmentList:",
      error
    );

    return null;
  }
};

// SEND EMAIL NOTIFICATION USING GMAIL
export const sendEmailNotification = async (
  userId: string,
  subject: string,
  content: string
) => {
  try {
    console.log("EMAIL: Getting patient email...");
    console.log("EMAIL: User ID:", userId);
    console.log("EMAIL: Subject:", subject);

    const user = await users.get(userId);

    if (!user?.email) {
      throw new Error("Patient email address not found.");
    }

    console.log("EMAIL: Patient email:", user.email);

    const htmlContent = content
      .replace(/\n/g, "<br />")
      .trim();

    const message = await sendGmail(
      user.email,
      subject,
      htmlContent
    );

    console.log("EMAIL: Gmail email sent successfully");

    return parseStringify(message);
  } catch (error) {
    console.error(
      "EMAIL ERROR - An error occurred while sending email:",
      error
    );

    return null;
  }
};

// UPDATE APPOINTMENT PARAMS
interface UpdateAppointmentParams {
  userId: string;

  appointmentId: string;

  appointment: {
    primaryPhysician: string;
    schedule: Date;
    status: Status;
    cancellationReason?: string;
  };

  type: "schedule" | "create" | "cancel";

  timeZone: string;
}

// UPDATE APPOINTMENT
export const updateAppointment = async ({
  appointmentId,
  userId,
  timeZone,
  appointment,
  type,
}: UpdateAppointmentParams) => {
  try {
    if (!appointmentId) {
      throw new Error(
        "updateAppointment called without a valid appointmentId. Check your frontend logic."
      );
    }

    console.log(
      "APPOINTMENT: Updating appointment:",
      appointmentId
    );

    const updatedAppointment = await databases.updateDocument(
      NEXT_PUBLIC_DATABASE_ID!,
      NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment
    );

    if (!updatedAppointment) {
      throw new Error("Appointment update failed.");
    }

    console.log(
      "APPOINTMENT: Status updated to:",
      appointment.status
    );

    let emailSubject = "";
    let emailMessage = "";

    if (type === "schedule") {
      emailSubject = "CarePulse - Appointment Confirmed";

      emailMessage = `
Greetings from CarePulse.

Your appointment has been confirmed.

Doctor: Dr. ${appointment.primaryPhysician}

Appointment Date & Time:
${
  formatDateTime(
    appointment.schedule!,
    timeZone
  ).dateTime
}

Thank you for choosing CarePulse.
      `;
    } else if (type === "cancel") {
      emailSubject = "CarePulse - Appointment Cancelled";

      emailMessage = `
Greetings from CarePulse.

We regret to inform you that your appointment has been cancelled.

Appointment Date & Time:
${
  formatDateTime(
    appointment.schedule!,
    timeZone
  ).dateTime
}

Reason:
${appointment.cancellationReason || "No reason provided."}

If you have any questions, please contact the clinic.

Thank you,
CarePulse
      `;
    }

    // Send email only for schedule/cancel
    if (emailSubject && emailMessage) {
      const emailResult = await sendEmailNotification(
        userId,
        emailSubject,
        emailMessage
      );

      if (!emailResult) {
        console.error(
          "APPOINTMENT WARNING: Appointment updated but email could not be sent."
        );
      }
    }

    revalidatePath("/admin");

    console.log(
      "APPOINTMENT: Update completed successfully."
    );

    return parseStringify(updatedAppointment);
  } catch (error) {
    console.error(
      "APPOINTMENT ERROR - An error occurred while updating appointment:",
      error
    );

    return null;
  }
};

// GET APPOINTMENT
export const getAppointment = async (
  appointmentId: string
) => {
  try {
    const appointment = await databases.getDocument(
      NEXT_PUBLIC_DATABASE_ID!,
      NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );

    return parseStringify(appointment);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the existing appointment:",
      error
    );

    return null;
  }
};