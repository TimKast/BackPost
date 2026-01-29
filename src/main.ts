import { generateOpenApi } from "./Schema/openapi.ts";
import { initSchema } from "./Schema/schema.ts";
import { Router } from "./server/router.ts";
import { handleSwaggerRequest } from "./server/swagger.ts";

await initSchema();

const router = new Router();

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
