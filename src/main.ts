import { connectDB } from "./db/connect.ts";

const BASE_URL = Deno.env.get("BASE_URL") ?? "http://localhost:8000";
const client = await connectDB();

const tables = await client.queryArray(
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'",
);

async function handler(request: Request): Promise<Response> {
  console.log("Received request:", request);

  const table = tables.rows.find((table) =>
    request.url.endsWith(`${BASE_URL}/${table[0]}`)
  );
  if (table) {
    const result = await client.queryArray(
      `SELECT * FROM ${table[0]}`,
    );
    return new Response(
      JSON.stringify(result.rows),
    );
  }

  return new Response(
    JSON.stringify({ error: "Table not found" }),
  );
}

Deno.serve({ port: 8000 }, handler);
