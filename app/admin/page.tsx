/* eslint-disable @next/next/no-img-element */

"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";

import GlobalLoading from "@/components/GlobalLoading";
import { StatCard } from "@/components/StatCard";
import { Columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";

import { PatientModal } from "../../components/PatientModal";

type AppointmentData = {
  scheduledCount: number;
  pendingCount: number;
  cancelledCount: number;
  documents: any[];
};

const AdminPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  );

  const [appointments, setAppointments] =
    useState<AppointmentData | null>(null);

  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setError(null);

      console.log("Loading appointments...");

      const data = await getRecentAppointmentList();

      console.log("Appointment data:", data);

      setAppointments({
        scheduledCount: data?.scheduledCount ?? 0,
        pendingCount: data?.pendingCount ?? 0,
        cancelledCount: data?.cancelledCount ?? 0,
        documents: data?.documents ?? [],
      });
    } catch (error) {
      console.error("Failed to fetch appointments:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load appointments."
      );

      // Allow the dashboard to display even if Appwrite fails
      setAppointments({
        scheduledCount: 0,
        pendingCount: 0,
        cancelledCount: 0,
        documents: [],
      });
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const openModal = (patientId: string) => {
    setSelectedPatientId(patientId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPatientId(null);
  };

  if (!appointments) {
    return <GlobalLoading text="Loading appointments..." />;
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      <header className="admin-header">
        <Link href="/">
          <img
            src="/assets/icons/logo-full.svg"
            width={200}
            height={40}
            alt="CarePulse Logo"
            className="mb-12 h-10 w-fit"
            loading="eager"
            decoding="async"
            style={{ height: "auto", width: "auto" }}
          />
        </Link>

        <p className="text-16-semibold text-dark-700">
          Admin Dashboard
        </p>
      </header>

      <main className="admin-main">
        <section className="w-full space-y-4">
          <h1 className="header text-dark-700">
            Welcome 👋
          </h1>

          <p className="text-dark-700">
            Start the day with managing new appointments
          </p>

          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
              <p className="font-semibold">
                Could not load appointment data.
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchAppointments}
                className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white"
              >
                Try Again
              </button>
            </div>
          )}
        </section>

        <section className="admin-stat text-dark-700">
          <StatCard
            type="appointments"
            count={appointments.scheduledCount}
            label="Scheduled appointments"
            icon="/assets/icons/appointments.svg"
          />

          <StatCard
            type="pending"
            count={appointments.pendingCount}
            label="Pending appointments"
            icon="/assets/icons/pending.svg"
          />

          <StatCard
            type="cancelled"
            count={appointments.cancelledCount}
            label="Cancelled appointments"
            icon="/assets/icons/cancelled.svg"
          />
        </section>

        <DataTable
          columns={Columns({
            openModal,
            isModalOpen,
            selectedPatientId,
            closeModal,
            reloadAppointments: fetchAppointments,
          })}
          data={appointments.documents}
        />
      </main>

      {isModalOpen && selectedPatientId && (
        <PatientModal
          patientId={selectedPatientId}
          closeModal={closeModal}
        />
      )}
    </div>
  );
};

export default AdminPage;