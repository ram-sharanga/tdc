import { getSession } from "@/lib/session";
import { getCustomer, getMatches } from "@/lib/repo";
import { explainMatches } from "@/lib/explain";
import { err } from "@/lib/http";

export const maxDuration = 30; // the AI call can take a few seconds

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return err("Not signed in", 401);
  const { id } = await ctx.params;

  const customer = await getCustomer(id, session.matchmakerId); // ownership first
  if (!customer) return err("Customer not found", 404);

  // The SERVER recomputes the matches, so the browser can't inject data the model will see.
  return Response.json(await explainMatches(customer, getMatches(customer)));
}
