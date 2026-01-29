import { schema } from "./schema.ts";
import { DbSchema } from "./schema_types.ts";

function buildPaths(db: DbSchema): Record<string, unknown> {
  const paths: Record<string, unknown> = {};

  for (const table of db.tables) {
    paths[`/${table.name}`] = {
      get: {
        summary: `Get all records from table ${table.name}`,
        responses: {
          "200": { description: "Successful response" },
        },
      },
      post: {
        summary: `Create a new record in table ${table.name}`,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object" },
            },
          },
        },
        responses: {
          "200": { description: "Successful response" },
        },
      },
      patch: {
        summary: `Update records in table ${table.name}`,
        parameters: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object" },
            },
          },
        },
        responses: {
          "200": { description: "Successful response" },
        },
      },
      delete: {
        summary: `Delete records from table ${table.name}`,
        parameters: [],
        responses: {
          "200": { description: "Successful response" },
        },
      },
    };
  }

  for (const view of db.views) {
    paths[`/view/${view}`] = {
      get: {
        summary: `Get all records from view ${view}`,
        responses: {
          "200": { description: "Successful response" },
        },
      },
    };
  }

  // TODO: make Procedures callable
  for (const procedure of db.procedures) {
    paths[`/rpc/${procedure}`] = {
      post: {
        summary: `Call procedure ${procedure}`,
        requestBody: {
          content: {
            "application/json": {
              schema: { type: "object" },
            },
          },
        },
        responses: {
          "200": { description: "Successful response" },
        },
      },
    };
  }

  return paths;
}

export function generateOpenApi(
  opts?: { title?: string; version?: string },
): Record<string, unknown> {
  const title = opts?.title ?? "DB API";
  const version = opts?.version ?? "1.0.0";

  return {
    openapi: "3.0.3",
    info: { title, version },
    paths: buildPaths(schema),
  };
}
