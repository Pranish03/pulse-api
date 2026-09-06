import type { Request, Response } from "express";
import { type UserQuery } from "./user.schema.js";
import { fromNodeHeaders } from "better-auth/node";
import { findUsers, updateUserProfile } from "./users.service.js";

export function getProfile(req: Request, res: Response) {
  return res.status(200).json({ data: req.user });
}

export async function updateProfile(req: Request, res: Response) {
  const { name, image } = req.body;
  const updatedUser = await updateUserProfile(
    fromNodeHeaders(req.headers),
    name,
    image,
  );

  return res.status(200).json({ data: updatedUser });
}

export async function searchUsers(req: Request, res: Response) {
  const { id: userId } = req.user;
  const { q, limit } = req.query as unknown as UserQuery;
  const users = await findUsers(userId, q, limit);

  return res.status(200).json({ data: users });
}
