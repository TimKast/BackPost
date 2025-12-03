import { db } from "../db/db.ts";

export type Handler = (
  req: Request,
  params: Record<string, string | undefined>,
) => Promise<Response>;

export interface Route {
  method: string;
  pattern: URLPattern;
  handler: Handler;
}

export class Router {
  private routes: Route[] = [];

  constructor() {
    this.addDynamicRoutes();
  }

  add(method: string, path: string, handler: Handler) {
    this.routes.push({
      method,
      pattern: new URLPattern({ pathname: path }),
      handler,
    });
  }

  async route(req: Request): Promise<Response> {
    try {
      const url = new URL(req.url);

      for (const route of this.routes) {
        if (req.method === route.method) {
          const match = route.pattern.exec(url);

          if (match) {
            const params = match.pathname.groups || {};
            return await route.handler(req, params);
          }
        }
      }

      return new Response(
        JSON.stringify({ error: "Route not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      console.error("Router error:", error);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          message: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }

  addDynamicRoutes() {
    this.add("GET", "/:tableName", async (_req, params) => {
      const tableName = params.tableName;
      const data = await db.findAll(tableName!);

      return new Response(
        JSON.stringify({
          table: tableName,
          rowCount: data.rows.length,
          data: data.rows,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    });

    this.add("GET", "/:tableName/:id", async (_req, params) => {
      const tableName = params.tableName;
      const id = params.id ? parseInt(params.id) : NaN;
      const data = await db.find(tableName!, id);

      if (isNaN(id)) {
        return new Response(
          JSON.stringify({ error: "Invalid ID parameter" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      return new Response(
        JSON.stringify({
          table: tableName,
          rowCount: data.rows.length,
          data: data.rows,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    });

    this.add("POST", "/:tableName", async (req, params) => {
      const tableName = params.tableName;
      const body = await req.json();

      const result = await db.create(tableName!, body);
      return new Response(JSON.stringify({ success: true, result }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    });
  }
}
