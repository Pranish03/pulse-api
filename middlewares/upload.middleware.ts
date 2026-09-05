import type { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

export async function uploadToCloudinary(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.file)
      return res.status(400).json({
        message: "No file uploaded",
      });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          floder: "queek/users",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      Readable.from(req.file!.buffer).pipe(stream);
    });

    req.file.cloudinary = result;

    next();
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    return res.status(500).json({ message: "Failed to upload file" });
  }
}
