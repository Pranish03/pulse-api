import type { Request, Response } from "express";
import { db } from "../../drizzle/db.js";
import { friendship, user } from "../../drizzle/schema.js";
import { and, eq, or } from "drizzle-orm";
import type {
  FriendshipParams,
  UpdateFriendRequest,
} from "./friendships.schema.js";
import {
  createFriendRequest,
  getAllFriendsForUser,
  getAllIncomingRequestsForUser,
  getAllOutgoingRequestsFromUser,
  removeFriendOrCancelRequest,
  updateFriendshipStatus,
} from "./friendships.service.js";

export async function getAllFriends(req: Request, res: Response) {
  const { id: userId } = req.user;
  const friends = await getAllFriendsForUser(userId);

  return res.status(200).json({ data: friends });
}

export async function getIncomingFriendRequests(req: Request, res: Response) {
  const { id: userId } = req.user;
  const incomingRequests = await getAllIncomingRequestsForUser(userId);

  return res.status(200).json({ data: incomingRequests });
}

export async function getOutgoingFriendRequests(req: Request, res: Response) {
  const { id: userId } = req.user;
  const outgoingRequests = await getAllOutgoingRequestsFromUser(userId);

  return res.status(200).json({ data: outgoingRequests });
}

export async function sendFriendRequest(req: Request, res: Response) {
  const { id: requesterId } = req.user;
  const { addresseeId } = req.body;
  const newFriendship = await createFriendRequest(requesterId, addresseeId);

  return res
    .status(201)
    .json({ message: "Friend request sent", data: newFriendship });
}

export async function updateFriendRequest(req: Request, res: Response) {
  const { id: userId } = req.user;
  const { id: friendshipId } = req.params as unknown as FriendshipParams;
  const { action } = req.body as unknown as UpdateFriendRequest;
  const newFriendship = await updateFriendshipStatus(
    userId,
    friendshipId,
    action,
  );

  return res.status(200).json({
    message:
      newFriendship.status === "accepted"
        ? "Friend request accepted"
        : "Friend request rejected",
    data: newFriendship,
  });
}

export async function deleteFriendship(req: Request, res: Response) {
  const { id: userId } = req.user;
  const { id: friendshipId } = req.params as unknown as FriendshipParams;
  const { message } = await removeFriendOrCancelRequest(userId, friendshipId);

  return res.status(200).json({ message });
}
