export interface ConfigSchema {
  db: { url: string };
  auth?: {
    mode: "login" | "key";
    loginTable?: { schema: string; name: string };
  };
}

export const defaultConfig: Omit<ConfigSchema, "db"> = {
  auth: {
    mode: "key",
    loginTable: { schema: "auth", name: "users" },
  },
};
