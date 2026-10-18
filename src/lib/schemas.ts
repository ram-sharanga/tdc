import { z } from "zod";

export const TemplateInput = z.object({
  name: z.string().trim().min(1).max(60),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(4000),
});
