import { and, eq, or } from "drizzle-orm";
import { db } from "../../drizzle/db.js";
import { friendship, user } from "../../drizzle/schema.js";

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
