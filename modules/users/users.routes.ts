import { Router } from "express";
import { getProfile, searchUser, updateProfile } from "./user.controller.js";

export const userRouter = Router();

userRouter.get("/me", getProfile);
userRouter.patch("/me", updateProfile);
userRouter.get("/search", searchUser);
