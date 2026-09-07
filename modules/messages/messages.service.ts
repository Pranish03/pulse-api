import { and, desc, eq, isNull, lt } from "drizzle-orm";
import { db } from "../../drizzle/db.js";
import { conversationParticipant, message } from "../../drizzle/schema.js";
import { AppError } from "../../lib/errors.js";
import { randomUUID } from "node:crypto";

export async function getMessageHistory(
  userId: string,
  conversationId: string,
  limit: number,
  cursor?: string,
) {
  const [membership] = await db
    .select({
      id: conversationParticipant.id,
    })
    .from(conversationParticipant)
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        eq(conversationParticipant.userId, userId),
      ),
    )
    .limit(1);

  if (!membership) throw new AppError("Conversation not found", 404);

  const messages = await db
    .select({
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      deletedAt: message.deletedAt,
    })
    .from(message)
    .where(
      and(
        eq(message.conversationId, conversationId),
        cursor ? lt(message.createdAt, new Date(cursor)) : undefined,
      ),
    )
    .orderBy(desc(message.createdAt))
    .limit(limit + 1);

  const hasMore = messages.length > limit;
  const data = hasMore ? messages.slice(0, limit) : messages;
  const nextCursor =
    hasMore && data.length > 0
      ? data[data.length - 1].createdAt.toISOString()
      : null;

  return {
    data,
    pagination: {
      limit,
      hasMore,
      nextCursor,
    },
  };
}

export async function sendMessageToConversation(
  userId: string,
  conversationId: string,
  content: string,
) {
  const [membership] = await db
    .select({ id: conversationParticipant.id })
    .from(conversationParticipant)
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        eq(conversationParticipant.userId, userId),
      ),
    )
    .limit(1);

  if (!membership) throw new AppError("Conversation not found", 404);

  const [newMessage] = await db
    .insert(message)
    .values({
      id: randomUUID(),
      conversationId,
      senderId: userId,
      content,
    })
    .returning({
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    });

  return newMessage;
}

export async function editMessageById(
  userId: string,
  messageId: string,
  content: string,
) {
  const [updatedMessage] = await db
    .update(message)
    .set({
      content,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(message.id, messageId),
        eq(message.senderId, userId),
        isNull(message.deletedAt),
      ),
    )
    .returning({
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      deletedAt: message.deletedAt,
    });

  if (!updatedMessage) {
    throw new AppError(
      "Message not found or you cannot edit this message",
      404,
    );
  }

  return updatedMessage;
}

export async function deleteMessageById(userId: string, messageId: string) {
  const [deletedMessage] = await db
    .update(message)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(message.id, messageId),
        eq(message.senderId, userId),
        isNull(message.deletedAt),
      ),
    )
    .returning({
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      deletedAt: message.deletedAt,
    });

  if (!deletedMessage)
    throw new AppError(
      "Message not found or you cannot delete this message",
      404,
    );

  return { ...deletedMessage, content: "This message was deleted" };
}
