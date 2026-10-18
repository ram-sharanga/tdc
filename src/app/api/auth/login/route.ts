import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { z } from "zod";
import { getMatchmakerByUsername } from "@/lib/repo";
import { COOKIE_NAME, SESSION_SECONDS, signSession } from "@/lib/jwt";
import { err } from "@/lib/http";

const Body = z.object({
  username: z.string().trim().min(1).max(50),
  password: z.string().min(1).max(200),
});

// A real bcrypt hash of a throwaway string. When the username doesn't exist we still run a comparison against it,
// so "unknown user" and "wrong password" take the same time and can't be told apart by timing.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return err("Enter your username and password", 400);

  const { username, password } = parsed.data;
  const mm = await getMatchmakerByUsername(username.toLowerCase());

  // bcrypt.compare re-hashes `password` using the salt stored INSIDE the stored hash, then compares.
  const ok = await bcrypt.compare(password, mm?.passwordHash ?? DUMMY_HASH);
  if (!mm || !ok) return err("That username or password doesn't match", 401); // one message for both cases: no user enumeration

  const token = await signSession({ matchmakerId: mm.id, name: mm.name });
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true, // JavaScript can't read it (XSS protection)
    secure: process.env.NODE_ENV === "production", // HTTPS only on the live site (localhost is plain http)
    sameSite: "lax", // not sent on cross-site POSTs (CSRF protection)
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return Response.json({ ok: true });
}
