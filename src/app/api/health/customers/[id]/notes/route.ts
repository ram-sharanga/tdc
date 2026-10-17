import { z } from "zod";
import { getSession } from "@/lib/session";
import { getCustomer, addNote } from "@/lib/repo";
import { err } from "@/lib/http";

const Body = z.object({ text: z.string().trim().min(1).max(2000) });

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return err("Not signed in", 401);
  const { id } = await ctx.params;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return err("Write a note between 1 and 2000 characters", 400);

  // Ownership check BEFORE writing anything under this customer.
  const customer = await getCustomer(id, session.matchmakerId);
  if (!customer) return err("Customer not found", 404);

  const note = await addNote(
    customer.id,
    session.matchmakerId,
    parsed.data.text,
  );
  return Response.json(note, { status: 201 });
}
