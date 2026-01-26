/*
BackPost Query Schema

projection:
select=<column1>,<column2>,...

filtering:
where=<column>.<operator>:<value>, <column>.<operator>:<value>, ...
    supported operators:
    eq    = equals
    neq   = not equals
    gt    = greater
    gte   = greater or equal
    lt    = less
    lte   = less or equal
    like  = like
    notlike = not like
    ilike = iLike
    notilike = not iLike

sorting:
order=<column>:<asc|desc>, <column>:<asc|desc>, ...

pagination:
limit=<number>
offset=<number>

logic operators:
AND: default and:<filter1>,<filter2>,...

?select=id,task,due&where=id.gt:3,task.like:%entry,task.like:first%&order=id:desc&limit=10&offset=20


*/

export const OperatorMap = {
  eq: "=",
  neq: "!=",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
  like: "LIKE",
  notlike: "NOT LIKE",
  ilike: "ILIKE",
  notilike: "NOT ILIKE",
  in: "IN",
  notin: "NOT IN",
  is: "IS",
  not: "IS NOT",
} as const;

export type Operator = keyof typeof OperatorMap;

export const UrlSegments = {
  select: "SELECT",
  where: "WHERE",
  order: "ORDER BY",
  limit: "LIMIT",
  offset: "OFFSET",
} as const;

export type UrlSegment = keyof typeof UrlSegments;

export type Filter = {
  column: string;
  operator: Operator | UrlSegment;
  value: string;
};

export type LogicGroup = {
  logic: "AND" | "OR" | "NOT";
  filters: (Filter | LogicGroup)[];
};

export function parseUrlSearchParams(
  searchParams: URLSearchParams,
): Filter[] {
  const filters: Filter[] = [];

  console.log("Parsing search params:", searchParams);

  for (const [key, value] of searchParams.entries()) {
    switch (key) {
      case "select":
        filters.push({
          column: value,
          operator: "select",
          value: "",
        });
        break;
      case "where": {
        value.split(",").forEach((clause) => {
          const [fieldOp, val] = clause.split(":");
          const [column, op] = fieldOp.split(".");
          if (column && op && val !== undefined) {
            filters.push({
              column: column,
              operator: op as Operator,
              value: val,
            });
          } else {
            throw new Error(`Invalid where clause: ${clause}`);
          }
        });

        break;
      }
      case "order":
        value.split(",").forEach((clause) => {
          const [column, dir] = clause.split(":");
          filters.push({
            column: column,
            operator: "order",
            value: dir,
          });
        });
        break;
      case "limit":
        filters.push({
          column: "",
          operator: "limit",
          value: value,
        });
        break;
      case "offset":
        filters.push({
          column: "",
          operator: "offset",
          value: value,
        });
        break;
      default:
        throw new Error(`Unknown query parameter: ${key}`);
    }
  }
  return filters;
}

export function filtersToSql(
  tableName: string,
  filters: Filter[],
): { query: string[]; values: unknown[] } {
  const query: string[] = ["SELECT "];
  const values: unknown[] = [];

  if (filters[0].operator === "select") {
    query.push(filters[0].column);
  } else {
    query.push("*");
  }

  query.push(` FROM "${tableName}" `);

  for (const filter of filters) {
    query.push(``);
  }
  return { query, values };
}
