import z from "zod";

export const sendFriendRequestSchema = z.object({
  addresseeId: z.string().min(1, "addresseeId is required"),
});

export const updateFriendRequestSchema = z.object({
  action: z.enum(["accept", "reject"]),
});

export type UpdateFriendRequest = z.infer<typeof updateFriendRequestSchema>;

export const friendshipParamsSchema = z.object({
  id: z.uuid("Invalid friendship ID"),
});

export type FriendshipParams = z.infer<typeof friendshipParamsSchema>;
