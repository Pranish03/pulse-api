import z from "zod";

export const messageQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});

export type MessageQuery = z.infer<typeof messageQuerySchema>;
