import { db } from "../db/db.ts";
import { Filter, parseUrlSearchParams } from "./url_parser.ts";

export type Handler = (
  req: Request,
  params: Record<string, string | undefined>,
  filters: Filter[],
) => Promise<Response>;

export interface Route {
  method: string;
  pattern: URLPattern;
  handler: Handler;
}

export class Router {
  private routes: Route[] = [];

  constructor() {
    this.add("GET", "/:tableName", getHandler);
    this.add("POST", "/:tableName", postHandler);
    this.add("PUT", "/:tableName/:id", putHandler);
    this.add("DELETE", "/:tableName/:id", deleteHandler);
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
            const filters = parseUrlSearchParams(url.searchParams);
            return await route.handler(req, params, filters);
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
}

const getHandler: Handler = async (_req, params, filters) => {
  const tableName = params.tableName;

  const data = await db.find(tableName!, filters);

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
};

const postHandler: Handler = async (req, params) => {
  const tableName = params.tableName;
  const body = await req.json();

  const result = await db.create(tableName!, body);
  return new Response(JSON.stringify({ success: true, result }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};

const putHandler: Handler = async (req, params, filters) => {
  const tableName = params.tableName;
  const id = params.id;
  const body = await req.json();

  const result = await db.update(tableName!, filters, body);
  return new Response(JSON.stringify({ success: true, result }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

const deleteHandler: Handler = async (_req, params, filters) => {
  const tableName = params.tableName;
  const id = params.id;

  const result = await db.delete(tableName!, filters);
  return new Response(JSON.stringify({ success: true, result }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
