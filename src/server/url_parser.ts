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

export type Filter = {
  select: string[];
  where: string[];
  order: string[];
  limit: number;
  offset: number;
};

export function parseUrlSearchParams(
  searchParams: URLSearchParams,
): Filter {
  const filters: Filter = {
    select: [],
    where: [],
    order: [],
    limit: 0,
    offset: 0,
  };

  for (const [key, value] of searchParams.entries()) {
    switch (key) {
      case "select":
        filters.select = value.split(",");
        break;
      case "where": {
        value.split(",").forEach((clause) => {
          const [column, cond] = clause.split(".");
          const [op, val] = cond.split(":");
          if (column && OperatorMap[op as Operator] && val !== undefined) {
            filters.where.push(
              `${column} ${OperatorMap[op as Operator]} '${val}'`,
            );
          } else {
            throw new Error(`Invalid where clause: ${clause}`);
          }
        });
        break;
      }
      case "order":
        value.split(",").forEach((clause) => {
          const [column, dir] = clause.split(":");
          filters.order.push(`${column} ${dir.toUpperCase()}`);
        });
        break;
      case "limit":
        filters.limit = Number(value);
        break;
      case "offset":
        filters.offset = Number(value);
        break;
      default:
        throw new Error(`Unknown query parameter: ${key}`);
    }
  }
  return filters;
}
