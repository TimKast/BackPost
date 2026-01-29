const SWAGGER_DIR = new URL("../swagger/dist/", import.meta.url);

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

export async function handleSwaggerRequest(
  pathname: string,
): Promise<Response | null> {
  if (pathname === "/docs/") {
    const file = await serveStaticFrom(SWAGGER_DIR, "index.html");
    return new Response(file.readable, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  if (pathname.startsWith("/docs/")) {
    const rel = pathname.slice("/docs/".length);
    try {
      const file = await serveStaticFrom(SWAGGER_DIR, rel);
      return new Response(file.readable, {
        headers: { "content-type": contentType(rel) },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }

  return null;
}
