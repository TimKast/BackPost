import { Pool } from "@db/postgres";
import { ConfigSchema } from "../config/schema.ts";

let pool: Pool;

export async function initDB(config: ConfigSchema) {
  pool = new Pool(config.db.url, 10, true);

  try {
    const client = await getClient();

    try {
      const res1 = await client.queryArray(
        `SELECT 1 FROM information_schema.tables WHERE table_schema = '${config.auth.schema}' AND table_name = '${config.auth.key_table}' LIMIT 1;`,
      );
      if (res1.rows.length === 0) {
        console.warn(
          `Warning: Key table '${config.auth.schema}.${config.auth.key_table}' does not exist.`,
        );
        await client.queryArray(
          `CREATE TABLE IF NOT EXISTS ${config.auth.schema}.${config.auth.key_table} (
            id SERIAL PRIMARY KEY,
            key TEXT UNIQUE NOT NULL
          );`,
        );
        console.log(
          `Info: Key table '${config.auth.schema}.${config.auth.key_table}' has been created.`,
        );
      }
      const res2 = await client.queryArray(
        `SELECT 1 FROM information_schema.tables WHERE table_schema = '${config.auth.schema}' AND table_name = '${config.auth.login_table}' LIMIT 1;`,
      );
      if (res2.rows.length === 0) {
        console.warn(
          `Warning: Login table '${config.auth.schema}.${config.auth.login_table}' does not exist.`,
        );
      }
    } catch (error) {
      console.error(
        "Database initialization checks failed:",
        error instanceof Error ? error.message : String(error),
      );
    }

    client.release();
    console.log("Database connection successful");
  } catch (error) {
    console.error(
      "Failed to connect to database:",
      error instanceof Error ? error.message : String(error),
    );
    Deno.exit(1);
  }
}

export async function getClient() {
  return await pool.connect();
}
