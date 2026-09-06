import type { Request, Response } from "express";
import { db } from "../../drizzle/db.js";
import { friendship, user } from "../../drizzle/schema.js";
import { and, eq, or } from "drizzle-orm";
import type {
  FriendshipParams,
  UpdateFriendRequest,
} from "./friendships.schema.js";

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

export async function sendFriendRequest(req: Request, res: Response) {
  const { id: requesterId } = req.user;
  const { addresseeId } = req.body;

  if (requesterId === addresseeId)
    return res
      .status(400)
      .json({ message: "You cannot send a friend request to yourself" });

  const [addressee] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, addresseeId))
    .limit(1);

  if (!addressee) return res.status(404).json({ message: "User not found" });

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

  if (existingFriendship)
    return res.status(400).json({ message: "Friendship already exists" });

  const [newFriendship] = await db
    .insert(friendship)
    .values({ requesterId, addresseeId, status: "pending" })
    .returning();

  return res
    .status(201)
    .json({ message: "Friend request sent", data: newFriendship });
}

export async function updateFriendRequest(req: Request, res: Response) {
  const { id: userId } = req.user;
  const { id: friendshipId } = req.params as unknown as FriendshipParams;
  const { action } = req.body as unknown as UpdateFriendRequest;

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

  if (!newFriendship) {
    return res.status(404).json({ message: "Friend request not found" });
  }

  return res.status(200).json({
    message:
      status === "accepted"
        ? "Friend request accepted"
        : "Friend request rejected",
    data: newFriendship,
  });
}
