import { ConfigSchema } from "../config/schema.ts";
import { dbAuth } from "../db/db.ts";
import { hashApiKey } from "./api-key.ts";
import { verifyToken } from "./jwt.ts";

export async function checkAuth(
  req: Request,
  config: ConfigSchema,
): Promise<unknown> {
  const jwtToken = req.headers.get("Authorization");
  if (jwtToken) {
    const token = jwtToken.slice(7);
    try {
      const payload = await verifyToken(token);
      return payload.sub;
    } catch (error) {
      if (error instanceof Error && error.message === "Token expired") {
        throw new Error("Token expired");
      }
    }
  }
  const apiKeyHeader = req.headers.get("x-api-key");
  if (apiKeyHeader) {
    const hashedKey = await hashApiKey(apiKeyHeader);
    const key = await dbAuth.getKey(
      config.auth.schema!,
      config.auth.key_table!,
    );
    if (key === hashedKey) {
      return -1;
    }
    throw new Error("Invalid API key");
  }
  throw new Error("Missing or invalid authentication");
}
