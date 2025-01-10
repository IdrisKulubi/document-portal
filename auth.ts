/* eslint-disable @typescript-eslint/no-explicit-any */
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import db from "./db/drizzle";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

const customAdapter = {
  ...DrizzleAdapter(db),
  createUser: async (userData: any) => {
    const user = await db
      .insert(users)
      .values({
        ...userData,
        role: "user",
      })
      .returning();
    return user[0];
  },
};

export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: customAdapter,
  providers: [
    Google({
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, account, trigger, session }: any) => {
      if (user) {
        if (account?.provider === "google") {
          const existingUser = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, user.email),
          });

          if (existingUser) {
            token.role = existingUser.role;
          } else {
            token.role = "user";
            const userId = crypto.randomUUID();
            await db
              .insert(users)
              .values({
                id: userId,
                name: user.name,
                email: user.email,
                image: user.image,
                role: "user",
              })
              .onConflictDoUpdate({
                target: users.email,
                set: {
                  name: user.name,
                  image: user.image,
                },
              });
          }
        } else {
          token.role = user.role;
        }

        if (user.name === "NO_NAME") {
          token.name = user.email!.split("@")[0];
          await db
            .update(users)
            .set({ name: token.name })
            .where(eq(users.id, user.id));
        }

        if (trigger === "signIn" || trigger === "signUp") {
          try {
            const response = await fetch(
              new URL("/api/cart/merge", process.env.NEXTAUTH_URL).toString(),
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id }),
              }
            );
            if (!response.ok) {
              console.error("Failed to merge carts");
            }
          } catch (error) {
            console.error("Error merging carts:", error);
          }
        }
      }

      if (session?.user.name && trigger === "update") {
        token.name = session.user.name;
      }

      return token;
    },
    session: async ({ session, token }: any) => {
      session.user.id = token.sub;
      session.user.role = token.role;
      return session;
    },
    authorized({ request, auth }: any) {
      const protectedPaths = [/\/shipping-address/];
      const { pathname } = request.nextUrl;
      return !protectedPaths.some((p) => p.test(pathname)) || !!auth;
    },
    signIn: async ({ user, account }: any) => {
      console.log("🔑 Sign in callback triggered:", { user, account });
      return true;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
