import { isAbsolute, resolve } from "@std/path";
import { ConfigSchema, defaultConfig } from "./schema.ts";

export async function loadConfig(configPath: string): Promise<ConfigSchema> {
  let config: ConfigSchema;
  try {
    const path = isAbsolute(configPath)
      ? configPath
      : resolve(Deno.cwd(), configPath);

    let stat: Deno.FileInfo;
    try {
      stat = await Deno.stat(path);
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
        throw new Error(`Config file not found: ${path}`);
      }
      throw new Error(`Cannot access config file: ${path} (${String(err)})`);
    }

    if (!stat.isFile) {
      throw new Error(`Config is not a file: ${path}`);
    }

    let text: string;
    try {
      text = await Deno.readTextFile(path);
    } catch (err) {
      throw new Error(`Failed to read config file: ${path} (${String(err)})`);
    }

    try {
      config = JSON.parse(text);
    } catch (err) {
      throw new Error(`Invalid JSON in config file: ${path} (${String(err)})`);
    }

    if (typeof config !== "object" || config === null) {
      throw new Error(
        `Config file does not contain a valid JSON object: ${path}`,
      );
    }
    if (
      config.db === undefined || typeof config.db.url !== "string" ||
      config.db.url.trim() === ""
    ) {
      throw new Error(
        `Config file requires a valid db.url string: ${path}`,
      );
    }
  } catch (error) {
    console.error("Error loading config:", error);
    Deno.exit(1);
  }

  if (!config.auth) {
    config.auth = defaultConfig.auth;
  } else {
    if (config.auth.mode === undefined) {
      config.auth.mode = defaultConfig.auth!.mode;
    } else if (config.auth.mode === "login" && !config.auth.loginTable) {
      config.auth.loginTable = defaultConfig.auth!.loginTable;
      console.warn("Warning: auth.loginTable not specified, using default: auth.users.");
    }
  }

  return config;
}
