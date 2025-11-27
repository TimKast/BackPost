import { Client } from "@db/postgres";

const client = new Client({
  user: "postgres",
  password: "postgrespassword",
  hostname: "localhost",
  port: 5432,
  database: "testdb",
});

export async function connectDB(): Promise<Client> {
  try {
    await client.connect();
    console.log("Connected to the database");
    return client;
  } catch (error) {
    throw error;
  }
}
