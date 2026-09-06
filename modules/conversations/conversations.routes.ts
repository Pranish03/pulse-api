import { Router } from "express";
import { getAllConversations } from "./conversations.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

export const conversationRouter = Router();

conversationRouter.get("/", requireAuth, getAllConversations);
