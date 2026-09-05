import type { Request, Response } from "express";
import { db } from "../../drizzle/db.js";
import {
  friendship,
  friendshipStatusEnum,
  user,
} from "../../drizzle/schema.js";
import { and, eq, or } from "drizzle-orm";

export async function getAllFriends(req: Request, res: Response) {
  const { id: userId } = req.user;

  const friends = await db
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

  return res.status(200).json({ data: friends });
}

export async function getIncomingFriendRequests(req: Request, res: Response) {
  const { id: userId } = req.user;

  const incomingRequests = await db
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

  return res.status(200).json({ data: incomingRequests });
}

export async function getOutgoingFriendRequests(req: Request, res: Response) {
  const { id: userId } = req.user;

  const outgoingRequests = await db
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

  return res.status(200).json({ data: outgoingRequests });
}
