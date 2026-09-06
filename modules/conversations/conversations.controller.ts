import type { Request, Response } from "express";
import { db } from "../../drizzle/db.js";
import { conversation, conversationParticipant } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";
import {
  createConversation,
  getConversationsForUser,
} from "./conversations.service.js";
import type { CreateConversationInput } from "./conversations.schema.js";

export async function getAllConversations(req: Request, res: Response) {
  const { id: userId } = req.user;
  const conversations = await getConversationsForUser(userId);

  return res.status(200).json({ data: conversations });
}

export async function createNewConversation(req: Request, res: Response) {
  const { id: creatorId } = req.user;
  const { participantIds, isGroup, name } =
    req.body as unknown as CreateConversationInput;
  const { conversation, created } = await createConversation(
    creatorId,
    participantIds,
    isGroup,
    name,
  );

  return res.status(created ? 201 : 200).json({ data: conversation });
}
