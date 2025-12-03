import { Pool } from "@db/postgres";

export const pool = new Pool({/* Uses Environment Variables */}, 10, true);

export async function getClient() {
  return await pool.connect();
}
