import * as schema from "./schema";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

// Make sure the connection string is being used
if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not defined in environment variables");
}

const db = drizzle(sql, {
  schema,
});

export default db;
