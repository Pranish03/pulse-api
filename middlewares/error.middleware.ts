import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error("Unhandled error: ", err);

  if (err instanceof MulterError)
    return res.status(400).json({ message: err.message });

  if (err instanceof Error)
    return res.status(400).json({ message: err.message });

  return res.status(500).json({ message: "Internal server error" });
}
