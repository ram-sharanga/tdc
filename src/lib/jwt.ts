import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "session";
export const SESSION_SECONDS = 60 * 60 * 8; // 8 hours; the cookie lifetime should match the token's

export interface SessionPayload {
  matchmakerId: string;
  name: string;
}

function secretKey(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16)
    throw new Error("AUTH_SECRET is missing or too short");
  return new TextEncoder().encode(s);
}

export async function signSession(p: SessionPayload): Promise<string> {
  return new SignJWT({ name: p.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(p.matchmakerId)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secretKey());
}

export async function verifySession(
  token: string,
): Promise<SessionPayload | null> {
  const key = secretKey();
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string" || typeof payload.name !== "string")
      return null;
    return { matchmakerId: payload.sub, name: payload.name };
  } catch {
    return null;
  }
}
