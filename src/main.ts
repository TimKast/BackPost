import { parseArgs } from "@std/cli/parse-args";
import { loadConfig } from "./config/load.ts";
import { initDB } from "./db/connection.ts";
import { generateOpenApi } from "./schema/openapi.ts";
import { initSchema } from "./schema/schema.ts";
import { initAuth } from "./server/auth.ts";
import { Router } from "./server/router.ts";
import { handleSwaggerRequest } from "./server/swagger.ts";

const args = parseArgs(Deno.args, {
  string: ["config"],
});

const configPath = args.config;
if (!configPath) {
  console.error("Error: --config argument is required.");
  Deno.exit(1);
}

const config = await loadConfig(configPath);
console.log("Config loaded successfully: \n", config);

await initDB(config);

await initAuth(config);

await initSchema();

const router = new Router(config);

Deno.serve(async (req) => {
  const url = new URL(req.url);

  if (url.pathname === "/openapi.json") {
    const doc = generateOpenApi({ title: "BackPost", version: "1.0.0" });
    return new Response(JSON.stringify(doc, null, 2), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const swaggerResponse = await handleSwaggerRequest(url.pathname);
  if (swaggerResponse) {
    return swaggerResponse;
  }

  return await router.route(req);
});
