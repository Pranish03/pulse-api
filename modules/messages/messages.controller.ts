import type { Request, Response } from "express";
import type { ConversationParams } from "../conversations/conversations.schema.js";
import {
  deleteMessageById,
  editMessageById,
  getMessageHistory,
  markConversationAsRead,
  sendMessageToConversation,
} from "./messages.service.js";
import type {
  MessageParams,
  MessageQuery,
  SendMessageInput,
} from "./messages.schema.js";

export async function getMessages(req: Request, res: Response) {
  const { id: userId } = req.user;
  const { id: conversationId } = req.params as unknown as ConversationParams;
  const { limit, cursor } = req.query as unknown as MessageQuery;
  const data = await getMessageHistory(userId, conversationId, limit, cursor);

  return res.status(200).json({ data });
}

export async function sendMessage(req: Request, res: Response) {
  const { id: userId } = req.user;
  const { id: conversationId } = req.params as unknown as ConversationParams;
  const { content } = req.body as unknown as SendMessageInput;
  const data = await sendMessageToConversation(userId, conversationId, content);

  return res.status(201).json({ message: "Message sent successfully", data });
}

export async function editMessage(req: Request, res: Response) {
  const { id: userId } = req.user;
  const { id: messageId } = req.params as unknown as MessageParams;
  const { content } = req.body as unknown as SendMessageInput;
  const data = await editMessageById(userId, messageId, content);

  return res
    .status(200)
    .json({ message: "Message updated successfully", data });
}

export async function deleteMessage(req: Request, res: Response) {
  const { id: userId } = req.user;
  const { id: messageId } = req.params as unknown as MessageParams;
  const data = await deleteMessageById(userId, messageId);

  return res
    .status(200)
    .json({ message: "Message deleted successfully", data });
}

export async function markAsRead(req: Request, res: Response) {
  const { id: userId } = req.user;
  const { id: conversationId } = req.params as unknown as ConversationParams;
  const data = await markConversationAsRead(userId, conversationId);

  return res.status(200).json({ data });
}
