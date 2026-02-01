import { Pool } from "@db/postgres";
import { ConfigSchema } from "../config/schema.ts";

let pool: Pool;

export async function initDBPool(config: ConfigSchema) {
  pool = new Pool(config.db.url, 10, true);

  try {
    const client = await getClient();
    if (config.auth!.mode === "login") {
      try {
        await client.queryObject(
          `SELECT 1 FROM ${config.auth!.loginTable!.schema}.${
            config.auth!.loginTable!.name
          } LIMIT 1`,
        );
      } catch (error) {
        console.warn(
          `Failed to verify database connection for auth mode 'login':`,
          error instanceof Error ? error.message : String(error),
        );
      }
    }
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
