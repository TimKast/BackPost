import { connectDB } from "./db/connect.ts";

const client = await connectDB();

const result = await client.queryArray(
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'",
);
console.log("Tables in the database:", result.rows);
