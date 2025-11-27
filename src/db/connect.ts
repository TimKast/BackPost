import { Client } from "@db/postgres";

const client = new Client({}); // Uses environment variables for configuration

export async function connectDB(): Promise<Client> {
  try {
    await client.connect();
    console.log("Connected to the database");
    return client;
  } catch (error) {
    throw error;
  }
}
