import { Pool } from "@db/postgres";

let pool: Pool;

export async function initDBPool(connectionString: string) {
  pool = new Pool(connectionString, 10, true);

  try {
    const client = await getClient();
    client.release();
    console.log("Database connection successful");
  } catch (error) {
    console.error("Failed to connect to database:", error);
    Deno.exit(1);
  }
}

export async function getClient() {
  return await pool.connect();
}
