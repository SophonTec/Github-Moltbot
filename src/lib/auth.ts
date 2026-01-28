import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { upsertUserFromOAuth } from "@/lib/userdb";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      upsertUserFromOAuth({ email: user.email, name: user.name, image: user.image });
      return true;
    },
    async jwt({ token }) {
      if (token.email) {
        const { getUserByEmail } = await import("@/lib/userdb");
        const u = getUserByEmail(String(token.email));
        if (u) (token as unknown as { uid?: string }).uid = u.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as { id?: string }).id = (token as unknown as { uid?: string }).uid;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
