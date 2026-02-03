export interface DbSchema {
  tables: DbTable[];
  views: DbView[];
  procedures: DbProcedure[];
}

export type DbColumn = {
  name: string;
  pgType: string;
};

export type DbTable = {
  schema: string;
  name: string;
  columns: DbColumn[];
  primaryKey: string[];
};

export type DbView = {
  schema: string;
  name: string;
  columns: DbColumn[];
};

export type DbProcedure = {
  schema: string;
  name: string;
};
