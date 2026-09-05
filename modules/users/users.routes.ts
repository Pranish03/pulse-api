import { Router } from "express";
import { getProfile, searchUsers, updateProfile } from "./user.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { upload } from "../../lib/multer.js";
import { uploadToCloudinary } from "../../middlewares/upload.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { profileUpdateSchema, userQuerySchema } from "./user.schema.js";

export const userRouter = Router();

userRouter.get("/me", requireAuth, getProfile);

userRouter.patch(
  "/me",
  requireAuth,
  upload.single("image"),
  uploadToCloudinary,
  validate(profileUpdateSchema),
  updateProfile,
);

userRouter.get(
  "/search",
  requireAuth,
  validate(userQuerySchema, "query"),
  searchUsers,
);
