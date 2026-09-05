import { Router } from "express";
import { getProfile, searchUser, updateProfile } from "./user.controller.js";
import { requireAuth } from "../../middlewares/requireAuth.js";

export const userRouter = Router();

userRouter.get("/me", requireAuth, getProfile);
userRouter.patch("/me", requireAuth, updateProfile);
userRouter.get("/search", requireAuth, searchUser);
