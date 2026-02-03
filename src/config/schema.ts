export interface ConfigSchema {
  db: { url: string };
  auth: authConfig;
}

export interface authConfig {
  schema?: string;
  key_table?: string;
  login_table?: string;
}

export const defaultAuth: authConfig = {
  schema: "auth",
  key_table: "keys",
  login_table: "users",
};
