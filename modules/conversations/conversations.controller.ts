import type { Request, Response } from "express";
import {
  createConversation,
  getConversationById,
  getConversationsForUser,
  updateConversationById,
} from "./conversations.service.js";
import type {
  ConversationParams,
  CreateConversationInput,
  UpdateConversationInput,
} from "./conversations.schema.js";

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

export async function getConversation(req: Request, res: Response) {
  const { id: userId } = req.user;
  const { id: conversationId } = req.params as unknown as ConversationParams;
  const conversationData = await getConversationById(userId, conversationId);

  return res.status(200).json({ data: conversationData });
}

export async function updateConversation(req: Request, res: Response) {
  const { id: userId } = req.user;
  const { id: conversationId } = req.params as unknown as ConversationParams;
  const { name, avatarUrl } = req.body as unknown as UpdateConversationInput;
  const updatedConversation = await updateConversationById(
    userId,
    conversationId,
    name,
    avatarUrl,
  );

  return res.status(200).json({
    message: "Conversation updated successfully",
    data: updatedConversation,
  });
}
