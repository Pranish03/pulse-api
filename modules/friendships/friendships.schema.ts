import z from "zod";

export const sendFriendRequestSchema = z.object({
  addresseeId: z.string().min(1, "addresseeId is required"),
});
