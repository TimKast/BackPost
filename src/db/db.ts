import type { QueryObjectResult } from "@db/postgres";
import { Credentials } from "../handler/auth_handler.ts";
import { Filter } from "../server/url_parser.ts";
import { getClient } from "./connection.ts";

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
    if (filters.limit > 0) {
      query += ` LIMIT ${filters.limit}`;
    }
    if (filters.offset > 0) {
      query += ` OFFSET ${filters.offset}`;
    }

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
      const values = Object.values(data);

      const setClause = keys.map((key, index) => `"${key}" = $${index + 1}`)
        .join(", ");

      let whereClause = "";
      if (
        filters.where.length > 0 && filters.select.length == 0 &&
        filters.order.length == 0 && filters.limit == 0 && filters.offset == 0
      ) {
        whereClause = ` WHERE ${filters.where.join(" AND ")}`;
      }
      const query = `UPDATE "${tableName}" SET ${setClause} ${whereClause}`;

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
      let whereClause = "";
      if (
        filters.where.length > 0 && filters.select.length == 0 &&
        filters.order.length == 0 && filters.limit == 0 && filters.offset == 0
      ) {
        whereClause = ` WHERE ${filters.where.join(" AND ")}`;
      }

      const result = await client.queryObject(
        `DELETE FROM "${tableName}"${whereClause}`,
      );
      return result;
    } finally {
      client.release();
    }
  },

  async callProcedure(
    procedure: string,
    params: JSON,
  ): Promise<QueryObjectResult<unknown>> {
    const client = await getClient();
    try {
      const keys = Object.keys(params);
      const values = Object.values(params);
      const placeholders = keys.map((_value, index) => `$${index + 1}`).join(
        ", ",
      );

      const query = `CALL "${procedure}"(${placeholders})`;

      return await client.queryObject(query, values);
    } finally {
      client.release();
    }
  },
};

export const dbAuth = {
  async login(
    schema: string,
    userTable: string,
    credentials: Credentials,
  ): Promise<unknown> {
    const client = await getClient();
    try {
      const values = Object.values(credentials);

      const query =
        `SELECT * FROM ${schema}.${userTable} WHERE username = $1 AND password = $2 LIMIT 1`;

      const result = await client.queryObject(query, values);
      if (result.rowCount === 0) {
        return null;
      }
      return result.rows[0];
    } finally {
      client.release();
    }
  },
};
