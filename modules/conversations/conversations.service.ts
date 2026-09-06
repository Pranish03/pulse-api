import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../drizzle/db.js";
import {
  conversation,
  conversationParticipant,
  user,
} from "../../drizzle/schema.js";
import { AppError } from "../../lib/errors.js";

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

export async function createConversation(
  creatorId: string,
  participantIds: string[],
  isGroup: boolean,
  name?: string,
): Promise<{
  conversation: typeof conversation.$inferSelect;
  created: boolean;
}> {
  if (participantIds.length === 0) {
    throw new AppError("At least one participant is required", 400);
  }

  if (!isGroup) {
    if (participantIds.length !== 1) {
      throw new AppError(
        "Direct messages must have exactly one other participant",
        400,
      );
    }

    const otherUserId = participantIds[0];
    const existing = await findExistingDirectConversation(
      creatorId,
      otherUserId,
    );
    if (existing) {
      const [existingConversation] = await db
        .select()
        .from(conversation)
        .where(eq(conversation.id, existing.conversationId))
        .limit(1);
      return { conversation: existingConversation, created: false };
    }
  }

  if (isGroup && !name) {
    throw new AppError("Group conversations require a name", 400);
  }

  const [newConversation] = await db
    .insert(conversation)
    .values({ isGroup, name: isGroup ? name : null, createdBy: creatorId })
    .returning();

  const allParticipantIds = [creatorId, ...participantIds];

  await db.insert(conversationParticipant).values(
    allParticipantIds.map((userId) => ({
      conversationId: newConversation.id,
      userId,
      role: userId === creatorId ? "admin" : "member",
    })),
  );

  return { conversation: newConversation, created: true };
}

async function findExistingDirectConversation(
  userId: string,
  otherUserId: string,
) {
  const existing = await db
    .select({ conversationId: conversationParticipant.conversationId })
    .from(conversationParticipant)
    .innerJoin(
      conversation,
      eq(conversation.id, conversationParticipant.conversationId),
    )
    .where(
      and(
        eq(conversation.isGroup, false),
        inArray(conversationParticipant.userId, [userId, otherUserId]),
      ),
    )
    .groupBy(conversationParticipant.conversationId)
    .having(sql`count(*) = 2`);

  return existing[0] ?? null;
}

export async function getConversationById(
  userId: string,
  conversationId: string,
) {
  const result = await db
    .select({
      conversation: {
        id: conversation.id,
        isGroup: conversation.isGroup,
        name: conversation.name,
        avatarUrl: conversation.avatarUrl,
        createdBy: conversation.createdBy,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
      participant: {
        id: conversationParticipant.id,
        userId: user.id,
        name: user.name,
        image: user.image,
        role: conversationParticipant.role,
        joinedAt: conversationParticipant.joinedAt,
        lastReadAt: conversationParticipant.lastReadAt,
      },
    })
    .from(conversationParticipant)
    .innerJoin(
      conversation,
      eq(conversationParticipant.conversationId, conversation.id),
    )
    .innerJoin(user, eq(conversationParticipant.userId, user.id))
    .where(eq(conversation.id, conversationId));

  if (result.length === 0) throw new AppError("Conversation not found", 404);

  const isParticipant = result.some((row) => row.participant.userId === userId);
  if (!isParticipant) throw new AppError("Conversation not found", 404);

  return {
    ...result[0].conversation,
    participants: result.map((row) => row.participant),
  };
}
