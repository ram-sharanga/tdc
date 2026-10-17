import { z } from "zod";
import { getSession } from "@/lib/session";
import { getCustomer, getMatches, recordSentMatch } from "@/lib/repo";
import { err } from "@/lib/http";

const Body = z.object({
  matchId: z.string().min(1).max(64),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(5000),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return err("Not signed in", 401);
  const { id } = await ctx.params;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return err("Subject and message are required", 400);

  const customer = await getCustomer(id, session.matchmakerId);
  if (!customer) return err("Customer not found", 404);

  // The browser says "send match fm1".
  // We verify that match really is one of THIS customer's suggestions.
  if (!getMatches(customer).some((m) => m.id === parsed.data.matchId))
    return err("Unknown match", 400);

  const result = await recordSentMatch(
    customer.id,
    session.matchmakerId,
    parsed.data,
  );
  if (!result.ok) {
    return result.reason === "duplicate"
      ? err("Already sent", 409)
      : err("Customer not found", 404); // 409 = conflict
  }
  return Response.json({ stage: result.stage }, { status: 201 });
}
