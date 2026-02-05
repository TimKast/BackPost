import { ConfigSchema } from "../config/schema.ts";
import {
  createLoginHandler,
  createRegisterHandler,
} from "../handler/auth_handler.ts";
import {
  deleteHandler,
  getHandler,
  patchHandler,
  postHandler,
  rpcHandler,
} from "../handler/db_handler.ts";
import { checkAuth } from "../helper/auth.ts";
import { Filter, parseUrlSearchParams } from "./url_parser.ts";

export type Handler = (
  req: Request,
  params: Record<string, string | undefined>,
  filters: Filter,
) => Promise<Response>;

export interface Route {
  method: string;
  pattern: URLPattern;
  handler: Handler;
}

export class Router {
  private routes: Route[] = [];
  private config: ConfigSchema;

  constructor(config: ConfigSchema) {
    this.config = config;

    this.add("GET", "/:schema/:tableName", getHandler);
    this.add("POST", "/:schema/:tableName", postHandler);
    this.add("PATCH", "/:schema/:tableName", patchHandler);
    this.add("DELETE", "/:schema/:tableName", deleteHandler);
    this.add("GET", "/:schema/view/:tableName", getHandler);
    this.add("POST", "/:schema/rpc/:procedure", rpcHandler);

    if (this.config.auth?.login_table) {
      this.add("POST", "/login", createLoginHandler(this.config));
      this.add("POST", "/register", createRegisterHandler(this.config));
    }
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
            try {
              await checkAuth(req, this.config);
            } catch (error) {
              return new Response(
                JSON.stringify({
                  error: "Unauthorized",
                  message: error instanceof Error
                    ? error.message
                    : String(error),
                }),
                {
                  status: 401,
                  headers: { "Content-Type": "application/json" },
                },
              );
            }

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
