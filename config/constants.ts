import "dotenv/config";

export const PORT = process.env.PORT || 3000;
export const FRONTEND_URL = process.env.FRONTEND_URL!;
export const DATABASE_URL = process.env.DATABASE_URL!;
export const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET!;
export const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL!;
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!;
