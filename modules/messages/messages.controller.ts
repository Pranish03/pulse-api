import type { Request, Response } from "express";
import type { ConversationParams } from "../conversations/conversations.schema.js";
import { getMessageHistory } from "./messages.service.js";
import type { MessageQuery } from "./messages.schema.js";

export async function getMessages(req: Request, res: Response) {
  const { id: userId } = req.user;
  const { id: conversationId } = req.params as unknown as ConversationParams;
  const { limit, cursor } = req.query as unknown as MessageQuery;
  const data = await getMessageHistory(userId, conversationId, limit, cursor);

  return res.status(200).json({ data });
}
