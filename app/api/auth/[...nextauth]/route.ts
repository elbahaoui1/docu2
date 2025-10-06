// /app/api/auth/[...nextauth]/route.ts

import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/prisma/client";
import { compare } from "bcrypt";

// Prisma is provided via singleton client

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: { email: { equals: credentials.email.trim(), mode: "insensitive" } },
        });

        if (!user) {
          // eslint-disable-next-line no-console
          console.warn("Credentials sign-in failed: user not found", { email: credentials.email });
          return null;
        }

        const passwordMatches = await compare(credentials.password, user.password);
        if (!passwordMatches) {
          // eslint-disable-next-line no-console
          console.warn("Credentials sign-in failed: wrong password", { email: credentials.email });
          return null;
        }

        if (!user.emailVerified) {
          // eslint-disable-next-line no-console
          console.warn("Credentials sign-in blocked: email not verified", { email: credentials.email });
          return null;
        }

        // Return the user object that NextAuth will use
        return {
          id: user.id,
          email: user.email,
          accountType: user.accountType,
          role: user.role,
          companyId: user.companyId,
          cabinetId: user.cabinetId,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // On sign in, `user` object is passed.
      if (user) {
        token.id = user.id;
        token.accountType = user.accountType;
        token.role = user.role;
        token.companyId = user.companyId;
        token.cabinetId = user.cabinetId;
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom properties to the session object
      if (token) {
        session.user.id = token.id as string;
        session.user.accountType = token.accountType as any;
        session.user.role = token.role as any;
        session.user.companyId = token.companyId as string | null;
        session.user.cabinetId = token.cabinetId as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Redirect to custom login page
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };