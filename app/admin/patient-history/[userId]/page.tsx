import Link from "next/link";

import { getPatientHistory } from "@/lib/actions/history.actions";
import { formatDateTime } from "@/lib/utils";

const PatientHistory = async ({
  params,
}: {
  params: Promise<{ userId: string }>;
}) => {
  const { userId } = await params;
  const { patientName, totalVisits, visits, changes } =
    await getPatientHistory(userId);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 p-6">
      <Link href="/admin" className="text-green-500">
        ← Back to admin
      </Link>

      <div>
        <h1 className="text-32-bold text-white">Patient history</h1>
        <p className="text-dark-700">{patientName}</p>
      </div>

      <div className="rounded-xl bg-dark-400 p-4">
        <p className="text-14-regular text-dark-700">Total visits</p>
        <p className="text-32-bold text-white">{totalVisits}</p>
      </div>

      <section>
        <h2 className="mb-3 text-18-bold text-white">Visits and reasons</h2>
        {visits.length === 0 ? (
          <p className="text-dark-700">No visits found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-14-regular">
              <thead className="bg-dark-200 text-dark-700">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Doctor</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v.id} className="border-b border-dark-500">
                    <td className="p-3">{formatDateTime(v.schedule).dateTime}</td>
                    <td className="p-3">{v.reason}</td>
                    <td className="p-3">Dr. {v.doctor}</td>
                    <td className="p-3 capitalize">{v.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-18-bold text-white">Change log</h2>
        {changes.length === 0 ? (
          <p className="text-dark-700">No changes recorded yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {changes.map((c) => (
              <li key={c.id} className="rounded-lg border border-dark-500 p-3">
                <span className="text-dark-700">
                  {formatDateTime(c.changedAt).dateTime}
                </span>
                : <span className="capitalize">{c.changeType}</span> action.
                Previous status was{" "}
                <span className="capitalize">{c.previousStatus}</span>, previous
                slot {formatDateTime(c.previousSchedule).dateTime}.
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default PatientHistory;