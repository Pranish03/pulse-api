import { and, eq, inArray, ne, sql } from "drizzle-orm";
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

export async function updateConversationById(
  userId: string,
  conversationId: string,
  name?: string,
  avatarUrl?: string,
) {
  const [membership] = await db
    .select({
      role: conversationParticipant.role,
      isGroup: conversation.isGroup,
    })
    .from(conversationParticipant)
    .innerJoin(
      conversation,
      eq(conversationParticipant.conversationId, conversation.id),
    )
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        eq(conversationParticipant.userId, userId),
      ),
    )
    .limit(1);

  if (!membership) throw new AppError("Conversation not found", 404);

  if (!membership.isGroup)
    throw new AppError("Only group conversations can be updated", 400);

  if (membership.role !== "admin")
    throw new AppError("Only group admins can update the conversation", 403);

  if (name === undefined && avatarUrl === undefined)
    throw new AppError("Nothing to update", 400);

  const [updatedConversation] = await db
    .update(conversation)
    .set({
      ...(name !== undefined && { name }),
      ...(avatarUrl !== undefined && { avatarUrl }),
    })
    .where(eq(conversation.id, conversationId))
    .returning({
      id: conversation.id,
      isGroup: conversation.isGroup,
      name: conversation.name,
      avatarUrl: conversation.avatarUrl,
      createdBy: conversation.createdBy,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    });

  return updatedConversation;
}

export async function deleteOrLeaveConversation(
  userId: string,
  conversationId: string,
) {
  const [membership] = await db
    .select({
      participantId: conversationParticipant.id,
      role: conversationParticipant.role,
      isGroup: conversation.isGroup,
    })
    .from(conversationParticipant)
    .innerJoin(
      conversation,
      eq(conversationParticipant.conversationId, conversation.id),
    )
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        eq(conversationParticipant.userId, userId),
      ),
    )
    .limit(1);

  if (!membership) throw new AppError("Conversation not found", 404);

  if (!membership.isGroup) {
    throw new AppError("You cannot leave a direct message conversation", 400);
  }

  const remainingParticipants = await db
    .select({
      id: conversationParticipant.id,
      userId: conversationParticipant.userId,
      role: conversationParticipant.role,
      joinedAt: conversationParticipant.joinedAt,
    })
    .from(conversationParticipant)
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        ne(conversationParticipant.userId, userId),
      ),
    );

  if (remainingParticipants.length === 0) {
    await db.delete(conversation).where(eq(conversation.id, conversationId));
    return { message: "Conversation deleted" };
  }

  if (membership.role === "admin") {
    const hasOtherAdmin = remainingParticipants.some((p) => p.role === "admin");

    if (!hasOtherAdmin) {
      const nextAdmin = remainingParticipants.reduce((earliest, current) =>
        current.joinedAt < earliest.joinedAt ? current : earliest,
      );

      await db
        .update(conversationParticipant)
        .set({ role: "admin" })
        .where(eq(conversationParticipant.id, nextAdmin.id));
    }
  }

  await db
    .delete(conversationParticipant)
    .where(eq(conversationParticipant.id, membership.participantId));

  return { message: "Left conversation successfully" };
}

export async function addParticipantsToConversation(
  requesterId: string,
  conversationId: string,
  participantIds: string[],
) {
  const [membership] = await db
    .select({
      role: conversationParticipant.role,
      isGroup: conversation.isGroup,
    })
    .from(conversationParticipant)
    .innerJoin(
      conversation,
      eq(conversationParticipant.conversationId, conversation.id),
    )
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        eq(conversationParticipant.userId, requesterId),
      ),
    )
    .limit(1);

  if (!membership) throw new AppError("Conversation not found", 404);
  if (!membership.isGroup)
    throw new AppError("Cannot add participants to a direct message", 400);
  if (membership.role !== "admin")
    throw new AppError("Only group admins can add participants", 403);

  const existing = await db
    .select({ userId: conversationParticipant.userId })
    .from(conversationParticipant)
    .where(eq(conversationParticipant.conversationId, conversationId));

  const existingIds = new Set(existing.map((p) => p.userId));
  const newIds = participantIds.filter((id) => !existingIds.has(id));

  if (newIds.length === 0)
    throw new AppError("All users are already participants", 400);

  const inserted = await db
    .insert(conversationParticipant)
    .values(
      newIds.map((userId) => ({ conversationId, userId, role: "member" })),
    )
    .returning();

  return inserted;
}

export async function removeParticipantFromConversation(
  requesterId: string,
  conversationId: string,
  targetUserId: string,
) {
  const [membership] = await db
    .select({
      role: conversationParticipant.role,
      isGroup: conversation.isGroup,
    })
    .from(conversationParticipant)
    .innerJoin(
      conversation,
      eq(conversationParticipant.conversationId, conversation.id),
    )
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        eq(conversationParticipant.userId, requesterId),
      ),
    )
    .limit(1);

  if (!membership) throw new AppError("Conversation not found", 404);
  if (!membership.isGroup)
    throw new AppError("Cannot remove participants from a direct message", 400);

  const isSelfRemoval = requesterId === targetUserId;

  if (!isSelfRemoval && membership.role !== "admin") {
    throw new AppError("Only group admins can remove other participants", 403);
  }

  if (isSelfRemoval) {
    return deleteOrLeaveConversation(requesterId, conversationId);
  }

  const [target] = await db
    .select({ id: conversationParticipant.id })
    .from(conversationParticipant)
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        eq(conversationParticipant.userId, targetUserId),
      ),
    )
    .limit(1);

  if (!target) throw new AppError("User is not a participant", 404);

  await db
    .delete(conversationParticipant)
    .where(eq(conversationParticipant.id, target.id));

  return { message: "Participant removed" };
}
