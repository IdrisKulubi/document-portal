import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    role: "admin" | "user";
  }

  interface Session {
    user: User;
  }
}
