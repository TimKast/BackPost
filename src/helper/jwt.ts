import { create, verify } from "@emrahcom/jwt";

const secret = Deno.env.get("JWT_SECRET")!;
const encoder = new TextEncoder();
const keyData = encoder.encode(secret);
const key = await crypto.subtle.importKey(
  "raw",
  keyData,
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);

export async function createToken(userId: string): Promise<string> {
  const payload = {
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours expiration
  };
  const jwt = await create({ alg: "HS512", typ: "JWT" }, payload, key);

  return jwt;
}

export async function verifyToken(token: string) {
  try {
    const payload = await verify(token, key);
    return payload;
  } catch (error) {
    if (error instanceof Error && error.message.includes("exp")) {
      throw new Error("Token expired");
    }
    throw new Error("Invalid token");
  }
}
