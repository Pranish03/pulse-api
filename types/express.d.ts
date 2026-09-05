import type { auth } from "../lib/auth.ts";
import type { UploadApiResponse } from "cloudinary";

declare global {
  namespace Express {
    interface Request {
      user: typeof auth.$Infer.Session.user;
    }
    namespace Multer {
      interface File {
        cloudinary?: UploadApiResponse;
      }
    }
  }
}

export {};
