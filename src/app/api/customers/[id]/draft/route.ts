import { z } from "zod";
import { getSession } from "@/lib/session";
import { getCustomer, getMatches, getTemplate } from "@/lib/repo";
import { DEFAULT_TEMPLATE } from "@/lib/templates";
import { generateDraft } from "@/lib/ai-draft";
import { err } from "@/lib/http";

// The browser sends ids only, never text. The server looks up the template itself.
const Body = z.object({
  matchId: z.string().min(1).max(64),
  templateId: z.string().min(1).max(64),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return err("Not signed in", 401);
  const { id } = await ctx.params;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return err("Invalid request", 400);

  const customer = await getCustomer(id, session.matchmakerId);
  if (!customer) return err("Customer not found", 404);
  const match = getMatches(customer).find((m) => m.id === parsed.data.matchId);
  if (!match) return err("Unknown match", 400);

  const template =
    parsed.data.templateId === "default"
      ? DEFAULT_TEMPLATE
      : await getTemplate(parsed.data.templateId, session.matchmakerId); // someone else's template looks like a missing one
  if (!template) return err("Template not found", 404);

  return Response.json(
    await generateDraft(customer, match, template, session.name),
  );
}
