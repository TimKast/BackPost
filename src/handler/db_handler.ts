import { db } from "../db/db.ts";
import type { Handler } from "../server/router.ts";

export const getHandler: Handler = async (_req, params, filters) => {
  const fullName = `${params.schema}.${params.tableName}`;

  const data = await db.find(fullName!, filters);

  return new Response(
    JSON.stringify({
      table: fullName,
      rowCount: data.rows.length,
      data: data.rows,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};

export const postHandler: Handler = async (req, params) => {
  const fullName = `${params.schema}.${params.tableName}`;
  const body = await req.json();

  const result = await db.create(fullName!, body);
  return new Response(JSON.stringify({ success: true, result }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};

export const patchHandler: Handler = async (req, params, filters) => {
  const fullName = `${params.schema}.${params.tableName}`;
  const body = await req.json();

  const result = await db.update(fullName!, filters, body);
  return new Response(JSON.stringify({ success: true, result }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const deleteHandler: Handler = async (_req, params, filters) => {
  const fullName = `${params.schema}.${params.tableName}`;

  const result = await db.delete(fullName!, filters);
  return new Response(JSON.stringify({ success: true, result }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const rpcHandler: Handler = async (req, params) => {
  const fullName = `${params.schema}.${params.procedure}`;
  const body = await req.json();

  const result = await db.callProcedure(fullName!, body);
  return new Response(JSON.stringify({ success: true, result }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
