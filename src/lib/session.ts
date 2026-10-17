import "server-only";

export interface SessionPayload {
  matchmakerId: string;
  name: string;
}

// temporary (auth is implemented in next feat)
const STUB: SessionPayload = { matchmakerId: "m1", name: "Asha" };

// null = not signed in - err 401
export async function getSession(): Promise<SessionPayload | null> {
  return STUB;
}

export async function requireSession(): Promise<SessionPayload> {
  return STUB;
}
