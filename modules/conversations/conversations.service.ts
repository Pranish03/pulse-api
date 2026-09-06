import { eq } from "drizzle-orm";
import { db } from "../../drizzle/db.js";
import { conversation, conversationParticipant } from "../../drizzle/schema.js";

export async function getConversationsForUser(userId: string) {
  return db
    .select({
      id: conversation.id,
      isGroup: conversation.isGroup,
      name: conversation.name,
      avatarUrl: conversation.avatarUrl,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    })
    .from(conversationParticipant)
    .innerJoin(
      conversation,
      eq(conversationParticipant.conversationId, conversation.id),
    )
    .where(eq(conversationParticipant.userId, userId));
}
