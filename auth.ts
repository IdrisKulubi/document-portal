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
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
    const user = await db
      .insert(users)
      .values({
        ...userData,
        role: adminEmails.includes(userData.email) ? "admin" : "user",
      })
      .returning();
    return user[0];
  },
};

export const config = {
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.AUTH_SECRET,
  adapter: customAdapter,
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
            const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
            const [newUser] = await db
              .insert(users)
              .values({
                email: parsedEmail,
                name: parsedEmail.split("@")[0],
                role: adminEmails.includes(parsedEmail) ? "admin" : "user",
              })
              .returning();
            user = newUser;
          }

          return user;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.email = user.email;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.email = token.email;
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
