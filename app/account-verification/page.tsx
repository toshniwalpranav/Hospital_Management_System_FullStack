"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getUserByEmail } from "@/lib/actions/patient.actions";

export default function AccountVerification() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState("Verifying your account...");

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || !session?.user?.email) {
      setMessage("Sign-in failed. Redirecting...");
      setTimeout(() => router.replace("/"), 1500);
      return;
    }

    const verify = async () => {
      const appwriteUser = await getUserByEmail(session.user!.email!);

      if (appwriteUser?.$id) {
        router.replace(`/patients/${appwriteUser.$id}/register`);
      } else {
        setMessage("We couldn't find your account. Redirecting...");
        setTimeout(() => router.replace("/"), 1500);
      }
    };

    verify();
  }, [session, status, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-14-regular text-dark-600">{message}</p>
    </div>
  );
}