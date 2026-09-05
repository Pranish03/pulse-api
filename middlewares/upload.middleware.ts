import type { Request, Response, NextFunction } from "express";
import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";
import type { UploadApiResponse } from "cloudinary";

export async function uploadToCloudinary(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "my-app/users",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error("Cloudinary upload returned no result"));
            return;
          }

          resolve(result);
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
