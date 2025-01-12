import db from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";

export async function checkUserAuthorization(email: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    
    throw new Error("Unauthorized email address");
  }

  return user;
}
