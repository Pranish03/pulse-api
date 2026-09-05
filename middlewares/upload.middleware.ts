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
    const file = req.file;
    if (!file) return next();

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "my-app/users",
          resource_type: "image",
        },
        (error, result) => {
          if (error) return reject(error);

          if (!result)
            return reject(new Error("Cloudinary upload returned no result"));

          resolve(result);
        },
      );

      Readable.from(file.buffer).pipe(stream);
    });

    req.body.image = result.secure_url;
    next();
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    return res.status(500).json({ message: "Failed to upload file" });
  }
}
