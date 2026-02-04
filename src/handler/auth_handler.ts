import type { ConfigSchema } from "../config/schema.ts";
import { dbAuth } from "../db/db.ts";
import { createToken } from "../helper/jwt.ts";
import type { Handler } from "../server/router.ts";

export interface Credentials {
  username: string;
  password: string;
}

export const createLoginHandler = (config: ConfigSchema): Handler => {
  return async (req, _params, _filters) => {
    const loginTable = config.auth.login_table!;

    const body = await req.json();
    const { username, password } = body as Credentials;

    const userId = await dbAuth.login(config.auth.schema!, loginTable, {
      username,
      password,
    });

    if (userId) {
      const token = await createToken(userId as string);
      return new Response(
        JSON.stringify({ message: "Login successful", token: token }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    return new Response(
      JSON.stringify({ message: "Invalid username or password" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  };
};
