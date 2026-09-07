import z from "zod";

export const messageQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});

export type MessageQuery = z.infer<typeof messageQuerySchema>;

export const sendMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(5000, "Message is too long"),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const messageParamsSchema = z.object({
  id: z.uuid("Invalid message ID"),
});

export type MessageParams = z.infer<typeof messageParamsSchema>;
