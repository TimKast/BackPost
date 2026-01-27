import { Router } from "./server/router.ts";
import { generateOpenApi } from "./Schema/openapi3.ts";
import { initSchema } from "./Schema/schema.ts";

await initSchema();

const router = new Router();

const SWAGGER_DIR = new URL("./swagger/dist/", import.meta.url);

function contentType(path: string) {
  if (path.endsWith(".html")) return "text/html; charset=utf-8";
  if (path.endsWith(".css")) return "text/css; charset=utf-8";
  if (path.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (path.endsWith(".json")) return "application/json; charset=utf-8";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

async function serveStaticFrom(dir: URL, relPath: string) {
  const fileUrl = new URL(relPath, dir);
  const file = await Deno.open(fileUrl, { read: true });
  return file;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);

  if (url.pathname === "/openapi.json") {
    const doc = generateOpenApi({ title: "BackPost", version: "1.0.0" });
    return new Response(JSON.stringify(doc, null, 2), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  if (url.pathname === "/docs/") {
    const file = await serveStaticFrom(SWAGGER_DIR, "index.html");
    return new Response(file.readable, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  if (url.pathname.startsWith("/docs/")) {
    const rel = url.pathname.slice("/docs/".length); // z.B. swagger-ui.css
    try {
      const file = await serveStaticFrom(SWAGGER_DIR, rel);
      return new Response(file.readable, {
        headers: { "content-type": contentType(rel) },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }

  return await router.route(req);
});
