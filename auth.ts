/* eslint-disable @typescript-eslint/no-explicit-any */
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import db from "./db/drizzle";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const emailSchema = z.string().email();

const customAdapter = {
  ...DrizzleAdapter(db),
  createUser: async (userData: any) => {
    try {
      const adminEmails =
        process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim()) || [];
      console.log("[CREATE_USER] Admin emails:", adminEmails);
      console.log("[CREATE_USER] User data:", userData);

      const [user] = await db
        .insert(users)
        .values({
          ...userData,
          name: userData.email.split("@")[0],
          role: adminEmails.includes(userData.email) ? "admin" : "user",
          isActive: true,
        })
        .returning();
      return user;
    } catch (error) {
      console.error("[CREATE_USER_ERROR]", error);
      throw error;
    }
  },
};

export const config = {
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        try {
          const { email } = credentials;
          const parsedEmail = emailSchema.parse(email);

          // Check if user exists
          let user = await db.query.users.findFirst({
            where: eq(users.email, parsedEmail),
          });

          // If user doesn't exist, create one
          if (!user) {
            const adminEmails =
              process.env.ADMIN_EMAILS?.split(",").map((email) =>
                email.trim()
              ) || [];
            const [newUser] = await db
              .insert(users)
              .values({
                email: parsedEmail,
                name: parsedEmail.split("@")[0],
                role: adminEmails.includes(parsedEmail) ? "admin" : "user",
                isActive: true,
              })
              .returning();
            user = newUser;
          }

          if (!user.isActive) {
            throw new Error("Account is deactivated");
          }

          // Ensure role is typed correctly
          return {
            ...user,
            role: user.role as "admin" | "user",
          };
        } catch (error) {
          console.error("[AUTH_ERROR]", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      console.log("[SIGNIN_CALLBACK] User:", user);
      return true;
    },
    jwt: async ({ token, user }) => {
      console.log("[JWT_CALLBACK] Token:", token, "User:", user);
      if (user) {
        token.role = user.role;
        token.email = user.email;
        token.isActive = user.isActive;
      }
      return token;
    },
    session: async ({ session, token }) => {
      console.log("[SESSION_CALLBACK] Session:", session, "Token:", token);
      session.user.id = token.sub!;
      session.user.role = token.role as "admin" | "user";
      session.user.email = token.email as string;
      session.user.isActive = token.isActive as boolean;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  debug: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.AUTH_SECRET,
  adapter: customAdapter as Adapter,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
