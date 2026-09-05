import type { Request, Response } from "express";

export function getProfile(req: Request, res: Response) {
  return res.status(200).json({ data: req.user });
}

export function updateProfile() {}

export function searchUser() {}
