import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL!;

// For server-side only
const client = postgres(connectionString);
const db = drizzle(client);

export default db;
