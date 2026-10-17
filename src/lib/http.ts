export const err = (message: string, status: number) =>
  Response.json({ error: message }, { status });
