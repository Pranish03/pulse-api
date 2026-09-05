import type { Request, Response } from "express";
import { profileUpdateSchema, userQuerySchema } from "./user.schema.js";
import z from "zod";
import { auth } from "../../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { db } from "../../drizzle/db.js";
import { user } from "../../drizzle/schema.js";
import { and, ilike, ne, or } from "drizzle-orm";

export function getProfile(req: Request, res: Response) {
  return res.status(200).json({ data: req.user });
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const parsedData = z.safeParse(profileUpdateSchema, req.body);

    if (!parsedData.success)
      return res.status(400).json({
        message: "Validation error",
        error: z.prettifyError(parsedData.error),
      });

    const { name, image } = parsedData.data;

    const updateBody: Record<string, unknown> = {};
    if (name !== undefined) updateBody.name = name;
    if (image !== undefined) updateBody.image = image;

    const updatedUser = await auth.api.updateUser({
      body: updateBody,
      headers: fromNodeHeaders(req.headers),
    });

    return res.status(200).json({ data: updatedUser });
  } catch (error) {
    console.error("Update profile failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function searchUsers(req: Request, res: Response) {
  try {
    const parsedQuery = z.safeParse(userQuerySchema, req.query);

    if (!parsedQuery.success)
      return res.status(400).json({
        message: "Validation error",
        error: z.prettifyError(parsedQuery.error),
      });

    const { q, limit } = parsedQuery.data;
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
  } catch (error) {
    console.error("Search user failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
