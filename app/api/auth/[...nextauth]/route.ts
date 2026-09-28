import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { createUser } from "@/lib/actions/patient.actions";

console.log("Google Client ID loaded:", process.env.GOOGLE_CLIENT_ID);
console.log("Google Client Secret loaded:", process.env.GOOGLE_CLIENT_SECRET ? "present (length " + process.env.GOOGLE_CLIENT_SECRET.length + ")" : "MISSING");

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const result = await createUser({
        email: user.email,
        name: user.name ?? "",
        phone: "",
      });

      if (result?.error) {
        console.error("Google sign-in createUser failed:", result.message);
        return false;
      }

      return true;
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/account-verification`;
    },
  },
});

export { handler as GET, handler as POST };