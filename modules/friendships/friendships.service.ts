import { and, eq, or } from "drizzle-orm";
import { db } from "../../drizzle/db.js";
import { friendship, user } from "../../drizzle/schema.js";
import { AppError } from "../../lib/errors.js";

export async function getAllFriendsForUser(userId: string) {
  return db
    .select({ id: user.id, name: user.name, image: user.image })
    .from(friendship)
    .innerJoin(
      user,
      or(
        and(
          eq(friendship.requesterId, userId),
          eq(user.id, friendship.addresseeId),
        ),
        and(
          eq(friendship.addresseeId, userId),
          eq(user.id, friendship.requesterId),
        ),
      ),
    )
    .where(eq(friendship.status, "accepted"));
}

export async function getAllIncomingRequestsForUser(userId: string) {
  return db
    .select({
      friendshipId: friendship.id,
      requesterId: user.id,
      name: user.name,
      image: user.image,
    })
    .from(friendship)
    .innerJoin(user, eq(user.id, friendship.requesterId))
    .where(
      and(eq(friendship.addresseeId, userId), eq(friendship.status, "pending")),
    );
}

export async function getAllOutgoingRequestsFromUser(userId: string) {
  return db
    .select({
      friendshipId: friendship.id,
      addresseeId: user.id,
      name: user.name,
      image: user.image,
    })
    .from(friendship)
    .innerJoin(user, eq(user.id, friendship.addresseeId))
    .where(
      and(eq(friendship.requesterId, userId), eq(friendship.status, "pending")),
    );
}

export async function createFriendRequest(
  requesterId: string,
  addresseeId: string,
) {
  if (requesterId === addresseeId) {
    throw new AppError("You cannot send a friend request to yourself", 400);
  }

  const [addressee] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, addresseeId))
    .limit(1);

  if (!addressee) {
    throw new AppError("User not found", 404);
  }

  const [existingFriendship] = await db
    .select()
    .from(friendship)
    .where(
      or(
        and(
          eq(friendship.requesterId, requesterId),
          eq(friendship.addresseeId, addresseeId),
        ),
        and(
          eq(friendship.requesterId, addresseeId),
          eq(friendship.addresseeId, requesterId),
        ),
      ),
    )
    .limit(1);

  if (existingFriendship) {
    throw new AppError("Friendship already exists", 400);
  }

  const [newFriendship] = await db
    .insert(friendship)
    .values({ requesterId, addresseeId, status: "pending" })
    .returning();

  return newFriendship;
}

export async function updateFriendshipStatus(
  userId: string,
  friendshipId: string,
  action: "accept" | "reject",
) {
  const status = action === "accept" ? "accepted" : "rejected";

  const [newFriendship] = await db
    .update(friendship)
    .set({ status })
    .where(
      and(
        eq(friendship.id, friendshipId),
        eq(friendship.addresseeId, userId),
        eq(friendship.status, "pending"),
      ),
    )
    .returning();

  if (!newFriendship) throw new AppError("Friend request not found", 404);

  return newFriendship;
}

export async function removeFriendOrCancelRequest(
  userId: string,
  friendshipId: string,
) {
  const [friendshipExists] = await db
    .select()
    .from(friendship)
    .where(eq(friendship.id, friendshipId))
    .limit(1);

  if (!friendshipExists) throw new AppError("Friendship not found", 404);

  if (
    friendshipExists.status === "accepted" &&
    (friendshipExists.requesterId === userId ||
      friendshipExists.addresseeId === userId)
  ) {
    await db.delete(friendship).where(eq(friendship.id, friendshipId));
    return { message: "Friend removed" };
  }

  if (
    friendshipExists.status === "pending" &&
    friendshipExists.requesterId === userId
  ) {
    await db.delete(friendship).where(eq(friendship.id, friendshipId));
    return { message: "Friend request cancelled" };
  }

  throw new AppError("You are not allowed to delete this friendship", 403);
}
