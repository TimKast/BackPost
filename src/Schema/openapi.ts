import { schema } from "./schema.ts";
import { DbColumn, DbSchema } from "./schema_types.ts";

function columnsToExample(columns: DbColumn[]): Record<string, string> {
  return Object.fromEntries(
    columns
      .filter((column) => column.name !== "id")
      .map((column) => [column.name, pgTypeToOpenApiType(column.pgType)]),
  );
}

function pgTypeToOpenApiType(pgType: string): string {
  switch (pgType) {
    case "smallint":
    case "integer":
    case "bigint":
    case "decimal":
    case "numeric":
    case "real":
    case "double precision":
    case "smallserial":
    case "serial":
    case "bigserial":
      return "number";
    case "boolean":
      return "boolean";
    default:
      return "string";
  }
}

function buildPaths(db: DbSchema): Record<string, unknown> {
  const paths: Record<string, unknown> = {};

  for (const table of db.tables) {
    paths[`/${table.name}`] = {
      get: {
        summary: `Get all records from table ${table.name}`,
        parameters: [
          {
            $ref: "#/components/parameters/select",
          },
          {
            $ref: "#/components/parameters/where",
          },
          {
            $ref: "#/components/parameters/order",
          },
          {
            $ref: "#/components/parameters/limit",
          },
          {
            $ref: "#/components/parameters/offset",
          },
        ],
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
              schema: { $ref: `#/components/schemas/${table.name}` },
              example: columnsToExample(table.columns),
            },
          },
        },
        responses: {
          "200": { description: "Successful response" },
        },
      },
      patch: {
        summary: `Update records in table ${table.name}`,
        parameters: [
          {
            $ref: "#/components/parameters/where",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: `#/components/schemas/${table.name}` },
              example: columnsToExample(table.columns),
            },
          },
        },
        responses: {
          "200": { description: "Successful response" },
        },
      },
      delete: {
        summary: `Delete records from table ${table.name}`,
        parameters: [
          {
            $ref: "#/components/parameters/where",
          },
        ],
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
        parameters: [
          {
            $ref: "#/components/parameters/select",
          },
          {
            $ref: "#/components/parameters/where",
          },
          {
            $ref: "#/components/parameters/order",
          },
          {
            $ref: "#/components/parameters/limit",
          },
          {
            $ref: "#/components/parameters/offset",
          },
        ],
        responses: {
          "200": { description: "Successful response" },
        },
      },
    };
  }

  // TODO: make Procedures callable with arguments
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

function buildComponents(db: DbSchema): Record<string, unknown> {
  const components: Record<string, unknown> = {};
  const schemas: Record<string, unknown> = {};
  components["schemas"] = schemas;

  for (const table of db.tables) {
    schemas[`${table.name}`] = {
      type: "object",
      properties: Object.fromEntries(
        table.columns.map((
          column,
        ) => [column.name, { type: pgTypeToOpenApiType(column.pgType) }]),
      ),
    };
  }

  components["parameters"] = {
    select: {
      name: "select",
      in: "query",
      required: false,
      schema: { type: "string" },
      description: "Columns to select, comma-separated",
    },
    where: {
      name: "where",
      in: "query",
      required: false,
      schema: { type: "string" },
      description: "Filter conditions, comma-separated",
    },
    order: {
      name: "order",
      in: "query",
      required: false,
      schema: { type: "string" },
      description: "Order by columns, comma-separated",
    },
    limit: {
      name: "limit",
      in: "query",
      required: false,
      schema: { type: "integer" },
      description: "Limit number of records",
    },
    offset: {
      name: "offset",
      in: "query",
      required: false,
      schema: { type: "integer" },
      description: "Offset for records",
    },
  };

  return components;
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
    components: buildComponents(schema),
  };
}
