import type { QueryObjectResult } from "@db/postgres";
import { getClient } from "./connection.ts";
import { Filter } from "../server/url_parser.ts";

export const db = {
  async find(
    tableName: string,
    filters: Filter[],
  ): Promise<QueryObjectResult<unknown>> {
    const client = await getClient();

    try {
      const result = await client.queryObject(`SELECT * FROM "${tableName}" `);
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
      const placeholders = keys.map((_value, index) => `$${index + 1}`).join(
        ", ",
      );

      const query = `INSERT INTO "${tableName}" (${
        keys.join(
          ", ",
        )
      }) VALUES (${placeholders})`;

      console.log("Create query:", query);

      return await client.queryObject(query, values);
    } finally {
      client.release();
    }
  },

  async update(
    tableName: string,
    filters: Filter[],
    data: JSON,
  ): Promise<QueryObjectResult<unknown>> {
    const client = await getClient();
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const setClause = keys.map((key, index) => `"${key}" = $${index + 1}`)
        .join(", ");

      const query = `UPDATE "${tableName}" SET ${setClause} WHERE id = $${
        keys.length + 1
      }`;

      return await client.queryObject(query, [...values]);
    } finally {
      client.release();
    }
  },

  async delete(
    tableName: string,
    filters: Filter[],
  ): Promise<QueryObjectResult<unknown>> {
    const client = await getClient();
    try {
      const result = await client.queryObject(`DELETE FROM ${tableName} `);
      return result;
    } finally {
      client.release();
    }
  },
};
