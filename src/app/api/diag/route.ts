import { getSession } from "@/lib/session";
import { db } from "@/lib/firebase";
import { err } from "@/lib/http";

// TEMPORARY: measures how long Firestore reads take from the deployed server. Delete after use.
export async function GET() {
  const session = await getSession(); // signed-in users only
  if (!session) return err("Not signed in", 401);

  // Times one async operation in milliseconds.
  const ms = async (fn: () => Promise<unknown>) => {
    const t = performance.now();
    await fn();
    return Math.round(performance.now() - t);
  };

  // Same read four times in a row: the first pays any connection setup, the rest show the steady-state cost.
  const docReads: number[] = [];
  for (let i = 0; i < 4; i++) {
    docReads.push(
      await ms(() =>
        db.collection("matchmakers").doc(session.matchmakerId).get(),
      ),
    );
  }
  // The same query the dashboard runs.
  const customerQuery = await ms(() =>
    db
      .collection("customers")
      .where("matchmakerId", "==", session.matchmakerId)
      .get(),
  );

  return Response.json({
    vercelRegion: process.env.VERCEL_REGION ?? "not on Vercel",
    docReadsMs: docReads,
    customerQueryMs: customerQuery,
  });
}
