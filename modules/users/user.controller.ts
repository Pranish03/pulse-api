import type { Request, Response } from "express";
import { profileUpdateSchema, type UpdateProfile } from "./user.schema.js";
import z from "zod";
import { auth } from "../../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

export function getProfile(req: Request, res: Response) {
  return res.status(200).json({ data: req.user });
}

export async function updateProfile(
  req: Request<{}, {}, UpdateProfile>,
  res: Response,
) {
  try {
    const data = req.body;
    const parsedData = z.safeParse(profileUpdateSchema, data);

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

export function searchUser() {}
