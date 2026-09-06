import z from "zod";

export const createConversationSchema = z
  .object({
    participantIds: z
      .array(z.string().min(1))
      .min(1, "At least one participant is required"),
    isGroup: z.boolean(),
    name: z.string().min(1).max(100).optional(),
  })
  .refine((data) => !data.isGroup || (data.isGroup && data.name), {
    message: "Group conversations require a name",
    path: ["name"],
  })
  .refine((data) => data.isGroup || data.participantIds.length === 1, {
    message: "Direct messages must have exactly one other participant",
    path: ["participantIds"],
  });

export type CreateConversationInput = z.infer<typeof createConversationSchema>;

export const conversationParamsSchema = z.object({
  id: z.uuid("Invalid conversation ID"),
});

export type ConversationParams = z.infer<typeof conversationParamsSchema>;

export const updateConversationSchema = z
  .object({
    name: z.string().min(1).max(100),
    avatarUrl: z.string().url(),
  })
  .partial();

export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
