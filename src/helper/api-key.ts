import { encodeBase64Url } from "@std/encoding/base64url";

const SECRET = Deno.env.get("API_KEY_SECRET");

export function createApiKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return `bpk_${encodeBase64Url(bytes)}`;
}

export async function hashApiKey(apiKey: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(apiKey),
  );

  return encodeBase64Url(new Uint8Array(signature));
}
