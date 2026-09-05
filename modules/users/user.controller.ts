import type { Request, Response } from "express";
import { type UserQuery } from "./user.schema.js";
import { auth } from "../../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { db } from "../../drizzle/db.js";
import { user } from "../../drizzle/schema.js";
import { and, ilike, ne, or } from "drizzle-orm";

export function getProfile(req: Request, res: Response) {
  return res.status(200).json({ data: req.user });
}

export async function updateProfile(req: Request, res: Response) {
  const { name, image } = req.body;

  const updateBody: Record<string, unknown> = {};
  if (name !== undefined) updateBody.name = name;
  if (image !== undefined) updateBody.image = image;

  const updatedUser = await auth.api.updateUser({
    body: updateBody,
    headers: fromNodeHeaders(req.headers),
  });

  return res.status(200).json({ data: updatedUser });
}

export async function searchUsers(req: Request, res: Response) {
  const { q, limit } = req.query as unknown as UserQuery;
  const searchPattern = `%${q}%`;
  const users = await db
    .select({ id: user.id, name: user.name, image: user.image })
    .from(user)
    .where(
      and(
        or(ilike(user.name, searchPattern), ilike(user.email, searchPattern)),
        ne(user.id, req.user.id),
      ),
    )
    .limit(limit);

  return res.status(200).json({ data: users });
}
