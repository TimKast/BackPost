import { ConfigSchema } from "../config/schema.ts";
import { getClient } from "../db/connection.ts";
import { createApiKey, hashApiKey } from "../helper/api-key.ts";

export async function initAuth(config: ConfigSchema) {
  const client = await getClient();

  try {
    const result = await client.queryObject(
      `SELECT id FROM ${config.auth.schema}.${config.auth.key_table} LIMIT 1`,
    );
    if (result.rowCount && result.rowCount > 0) {
      console.log("Key table already initialized.");
      return;
    }
  } catch (error) {
    console.log("Error: ", error);
  }

  const apiKey = createApiKey();
  console.log("Generated API Key for initial use:", apiKey);

  const hashedKey = await hashApiKey(apiKey);

  try {
    const query =
      `INSERT INTO ${config.auth.schema}.${config.auth.key_table} (key) VALUES ($1)`;
    await client.queryObject(query, [hashedKey]);
  } finally {
    client.release();
  }
}
