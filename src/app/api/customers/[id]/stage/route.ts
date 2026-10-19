import { z } from "zod";
import { STAGES } from "@/types/profile";
import { getSession } from "@/lib/session";
import { updateStage } from "@/lib/repo";
import { err } from "@/lib/http";

const Body = z.object({ stage: z.enum(STAGES) });

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return err("Not Signed in", 401);

  const { id } = await ctx.params;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return err("Invalid stage", 400);

  const ok = await updateStage(id, session.matchmakerId, parsed.data.stage);
  if (!ok) return err("Customer not found", 404);
  return Response.json({ stage: parsed.data.stage });
}
