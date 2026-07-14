import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@kingdom/db";
import { credentialsSchema } from "@/lib/validation";
import { verifyPassword } from "@/lib/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "אימייל", type: "email" },
        password: { label: "סיסמה", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user) {
          return null;
        }
        const valid = await verifyPassword(user.passwordHash, parsed.data.password);
        if (!valid) {
          return null;
        }
        return { id: user.id, email: user.email };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token.id && typeof token.id === "string") {
        session.user.id = token.id;
      }
      return session;
    },
  },
});
