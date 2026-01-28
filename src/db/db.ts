import type { QueryObjectResult } from "@db/postgres";
import { getClient } from "./connection.ts";
import { Filter } from "../server/url_parser.ts";

export const db = {
  async find(
    tableName: string,
    filters: Filter,
  ): Promise<QueryObjectResult<unknown>> {
    const client = await getClient();

    let query = `SELECT * FROM "${tableName}"`;
    if (filters.select.length > 0) {
      query = `SELECT ${filters.select.join(", ")} FROM "${tableName}"`;
    }
    if (filters.where.length > 0) {
      query += ` WHERE ${filters.where.join(" AND ")}`;
    }
    if (filters.order.length > 0) {
      query += ` ORDER BY ${filters.order.join(", ")}`;
    }
    query += ` LIMIT ${filters.limit} OFFSET ${filters.offset}`;

    try {
      const result = await client.queryObject(query.trim());
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

      return await client.queryObject(query, values);
    } finally {
      client.release();
    }
  },

  async update(
    tableName: string,
    filters: Filter,
    data: JSON,
  ): Promise<QueryObjectResult<unknown>> {
    const client = await getClient();
    try {
      const keys = Object.keys(data);
      console.log("Updating with data keys:", keys);
      const values = Object.values(data);
      console.log("Updating with data values:", values);
      const setClause = keys.map((key, index) => `"${key}" = $${index + 1}`)
        .join(", ");
      console.log("Set clause:", setClause);
      let whereClause = "";
      if (
        filters.where.length > 0 && filters.select.length == 0 &&
        filters.order.length == 0 && filters.limit == 0 && filters.offset == 0
      ) {
        whereClause = ` WHERE ${filters.where.join(" AND ")}`;
        console.log("Where clause:", whereClause);
      }
      const query = `UPDATE "${tableName}" SET ${setClause} ${whereClause}`;
      console.log("Update query:", query);

      return await client.queryObject(query, [...values]);
    } finally {
      client.release();
    }
  },

  async delete(
    tableName: string,
    filters: Filter,
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
