import { getClient } from "../db/connection.ts";
import {
  DbColumn,
  DbProcedure,
  DbSchema,
  DbTable,
  DbView,
} from "./schema_types.ts";

export const schema: DbSchema = {
  tables: [],
  views: [],
  procedures: [],
};

export async function initSchema() {
  schema.tables = await getTables();
  schema.views = await getViews();
  schema.procedures = await getProcedures();
}

async function getTables(): Promise<DbTable[]> {
  const client = await getClient();
  try {
    const tables = await client.queryArray(
      "SELECT table_schema, table_name FROM information_schema.tables WHERE table_type = 'BASE TABLE' AND table_schema != 'information_schema' AND table_schema != 'pg_catalog';",
    );
    const result = tables.rows.map(async (row) => ({
      schema: row[0] as string,
      name: row[1] as string,
      columns: await getColumns(row[1] as string),
      primaryKey: await getPrimaryKey(row[1] as string),
    }));

    return Promise.all(result);
  } finally {
    client.release();
  }
}

async function getViews(): Promise<DbView[]> {
  const client = await getClient();
  try {
    const views = await client.queryArray(
      "SELECT table_schema, table_name FROM information_schema.tables WHERE table_type = 'VIEW' AND table_schema != 'information_schema' AND table_schema != 'pg_catalog';",
    );
    return Promise.all(views.rows.map(async (row) => ({
      schema: row[0] as string,
      name: row[1] as string,
      columns: await getColumns(row[1] as string),
    })));
  } finally {
    client.release();
  }
}

async function getProcedures(): Promise<DbProcedure[]> {
  const client = await getClient();
  try {
    const procedures = await client.queryArray(
      "SELECT routine_schema, routine_name FROM information_schema.routines WHERE routine_type = 'PROCEDURE' AND routine_schema != 'information_schema' AND routine_schema != 'pg_catalog';",
    );
    return Promise.all(procedures.rows.map((row) => ({
      schema: row[0] as string,
      name: row[1] as string,
    })));
  } finally {
    client.release();
  }
}

async function getColumns(tableName: string): Promise<DbColumn[]> {
  const client = await getClient();
  try {
    const columns = await client.queryArray(
      "SELECT table_schema, table_name, column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1;",
      [tableName],
    );
    return columns.rows.map((row) => ({
      name: row[2] as string,
      pgType: row[3] as string,
    }));
  } finally {
    client.release();
  }
}

async function getPrimaryKey(tableName: string): Promise<string[]> {
  const client = await getClient();
  try {
    const pk = await client.queryArray(
      "SELECT tc.table_schema, tc.table_name, kcu.column_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.table_schema = 'public' AND tc.table_name = $1 AND tc.constraint_type = 'PRIMARY KEY';",
      [tableName],
    );
    return pk.rows.map((row) => row[2] as string);
  } finally {
    client.release();
  }
}
