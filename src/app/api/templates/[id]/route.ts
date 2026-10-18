import { getSession } from "@/lib/session";
import { updateTemplate, deleteTemplate } from "@/lib/repo";
import { TemplateInput } from "@/lib/schemas";
import { err } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const session = await getSession();
  if (!session) return err("Not signed in", 401);
  const { id } = await ctx.params;
  const parsed = TemplateInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return err("Name, subject and message are required", 400);
  const updated = await updateTemplate(id, session.matchmakerId, parsed.data);
  return updated ? Response.json(updated) : err("Template not found", 404);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await getSession();
  if (!session) return err("Not signed in", 401);
  const { id } = await ctx.params;
  return (await deleteTemplate(id, session.matchmakerId))
    ? Response.json({ ok: true })
    : err("Template not found", 404);
}
