"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { Doctors } from "@/constants";
import { formatDateTime } from "@/lib/utils";
import { Appointment } from "@/types/appwrite.types";

import { AppointmentModal } from "../AppointmentModal";
import { StatusBadge } from "../StatusBadge";

interface ColumnsProps {
  openModal: (patientId: string) => void;
  isModalOpen: boolean;
  selectedPatientId: string | null;
  closeModal: () => void;
  reloadAppointments?: () => void;
}

export const Columns = ({
  openModal,
  isModalOpen,
  selectedPatientId,
  closeModal,
  reloadAppointments,
}: ColumnsProps): ColumnDef<Appointment>[] => [
  {
    header: "#",
    cell: ({ row }) => {
      return <p className="text-14-medium">{row.index + 1}</p>;
    },
  },

  // =========================
  // PATIENT
  // =========================
  {
    id: "patient",
    header: "Patient",

    cell: ({ row }) => {
      const appointment = row.original as any;

      const patient = Array.isArray(appointment.patient)
        ? appointment.patient[0]
        : appointment.patient;

      if (!patient) {
        return (
          <p className="text-14-medium text-gray-500">
            Patient not found
          </p>
        );
      }

      const patientId = patient.$id;
      const patientName = patient.name;

      return (
        <div className="text-14-medium">
          <button
            type="button"
            onClick={() => {
              if (patientId) {
                openModal(patientId);
              }
            }}
            className="cursor-pointer rounded-md p-3 text-left text-dark-700 transition-colors duration-200 hover:bg-gray-800 hover:text-white"
          >
            {patientName || "Unknown Patient"}
          </button>
        </div>
      );
    },
  },

  // =========================
  // STATUS
  // =========================
  {
    accessorKey: "status",
    header: "Status",

    cell: ({ row }) => {
      const appointment = row.original;

      return (
        <div className="min-w-[115px]">
          <StatusBadge status={appointment.status} />
        </div>
      );
    },
  },

  // =========================
  // APPOINTMENT DATE/TIME
  // =========================
  {
    accessorKey: "schedule",
    header: "Appointment",

    cell: ({ row }) => {
      const appointment = row.original;

      return (
        <p className="text-14-regular min-w-[100px]">
          {formatDateTime(appointment.schedule).dateTime}
        </p>
      );
    },
  },

  // =========================
  // DOCTOR
  // =========================
  {
    accessorKey: "primaryPhysician",
    header: "Doctor",

    cell: ({ row }) => {
      const appointment = row.original;

      const doctor = Doctors.find(
        (doctor) => doctor.name === appointment.primaryPhysician
      );

      return (
        <div className="flex items-center gap-3">
          {doctor?.image && (
            <img
              src={doctor.image}
              alt="doctor"
              width={100}
              height={100}
              className="size-8"
            />
          )}

          <p className="whitespace-nowrap">
            Dr. {doctor?.name || appointment.primaryPhysician}
          </p>
        </div>
      );
    },
  },

  // =========================
  // ACTIONS
  // =========================
  {
    id: "actions",

    header: () => <div className="pl-4">Actions</div>,

    cell: ({ row }) => {
      const appointment = row.original as any;

      const patient = Array.isArray(appointment.patient)
        ? appointment.patient[0]
        : appointment.patient;

      if (!patient) {
        return null;
      }

      return (
        <div className="flex gap-1">
          <AppointmentModal
            patientId={patient.$id}
            userId={appointment.userId}
            appointment={appointment}
            type="schedule"
            title="Schedule Appointment"
            description="Please confirm the following details to schedule."
            reloadAppointments={reloadAppointments}
          />

          <AppointmentModal
            patientId={patient.$id}
            userId={appointment.userId}
            appointment={appointment}
            type="cancel"
            title="Cancel Appointment"
            description="Are you sure you want to cancel your appointment?"
            reloadAppointments={reloadAppointments}
          />

          <Link href={`/admin/patient-history/${appointment.userId}`}>
            <Button
              variant="outline"
              className="rounded-lg border border-blue-400 text-blue-400 hover:bg-blue-400/10"
            >
              History
            </Button>
          </Link>
        </div>
      );
    },
  },
];