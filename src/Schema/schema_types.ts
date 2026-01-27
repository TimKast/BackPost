export interface DbSchema {
  tables: DbTable[];
  views: string[];
  procedures: string[];
}

export type DbColumn = {
  name: string;
  //pgType: string;
};

export type DbTable = {
  name: string;
  columns: DbColumn[];
  primaryKey: string[];
};
