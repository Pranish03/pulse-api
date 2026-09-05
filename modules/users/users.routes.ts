import { Router } from "express";
import { getProfile, searchUsers, updateProfile } from "./user.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { upload } from "../../lib/multer.js";
import { uploadToCloudinary } from "../../middlewares/upload.middleware.js";

export const userRouter = Router();

userRouter.get("/me", requireAuth, getProfile);
userRouter.patch(
  "/me",
  requireAuth,
  upload.single("image"),
  uploadToCloudinary,
  updateProfile,
);
userRouter.get("/search", requireAuth, searchUsers);
