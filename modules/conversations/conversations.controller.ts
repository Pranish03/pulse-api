import type { Request, Response } from "express";
import { db } from "../../drizzle/db.js";
import { conversation, conversationParticipant } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";
import { getConversationsForUser } from "./conversations.service.js";

export async function getAllConversations(req: Request, res: Response) {
  const { id: userId } = req.user;
  const conversations = await getConversationsForUser(userId);

  return res.status(200).json({ data: conversations });
}
