import { Pool } from "pg";
import { env } from "./env";

export const pool = new Pool({ connectionString: env.databaseUrl });

export async function testDatabaseConnection() {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    console.log("PostgreSQL connected");
  } finally {
    client.release();
  }
}
