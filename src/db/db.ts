import type { QueryObjectResult } from "@db/postgres";
import { getClient } from "./connection.ts";

export const db = {
  async getTableNames(): Promise<string[]> {
    const client = await getClient();
    try {
      const tables = await client.queryArray(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'",
      );
      return tables.rows.map((row) => row[0] as string);
    } finally {
      client.release();
    }
  },

  async findAll(tableName: string): Promise<QueryObjectResult<unknown>> {
    const client = await getClient();
    try {
      const result = await client.queryObject(`SELECT * FROM "${tableName}"`);
      return result;
    } finally {
      client.release();
    }
  },

  async find(
    tableName: string,
    id: number,
  ): Promise<QueryObjectResult<unknown>> {
    const client = await getClient();
    try {
      const result = await client.queryObject(
        `SELECT * FROM "${tableName}" WHERE id = $1`,
        [id],
      );
      return result;
    } finally {
      client.release();
    }
  },

  async create(
    tableName: string,
    data: JSON,
  ): Promise<QueryObjectResult<unknown>> {
    const client = await getClient();
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");

      const query = `INSERT INTO "${tableName}" (${
        keys.join(
          ", ",
        )
      }) VALUES (${placeholders})`;

      return await client.queryObject(query, values);
    } finally {
      client.release();
    }
  },
};
