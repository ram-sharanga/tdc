import { getSession } from "@/lib/session";
import { createTemplate, listTemplates } from "@/lib/repo";
import { TemplateInput } from "@/lib/schemas";
import { err } from "@/lib/http";

export async function GET() {
  const session = await getSession();
  if (!session) return err("Not signed in", 401);
  return Response.json(await listTemplates(session.matchmakerId));
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return err("Not signed in", 401);
  const parsed = TemplateInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return err(
      "Name, subject and message are required (message up to 4000 characters)",
      400,
    );

  const result = await createTemplate(session.matchmakerId, parsed.data);
  if (result === "limit") return err("You can keep up to 20 templates", 409);
  return Response.json(result, { status: 201 });
}
