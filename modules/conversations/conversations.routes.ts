import { Router } from "express";
import {
  createNewConversation,
  getAllConversations,
  getConversation,
} from "./conversations.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  conversationParamsSchema,
  createConversationSchema,
} from "./conversations.schema.js";

export const conversationRouter = Router();

conversationRouter.get("/", requireAuth, getAllConversations);
conversationRouter.post(
  "/",
  requireAuth,
  validate(createConversationSchema),
  createNewConversation,
);
conversationRouter.get(
  "/:id",
  requireAuth,
  validate(conversationParamsSchema, "params"),
  getConversation,
);

/**
 * Todo:
 * GET	    /api/conversations/:id	                        Get one conversation's details + participants
 * PATCH	/api/conversations/:id	                        Update group name/avatar
 * DELETE	/api/conversations/:id	                        Delete/leave a conversation
 * POST	    /api/conversations/:id/participants	            Add member(s) to a group
 * DELETE	/api/conversations/:id/participants/:userId	    Remove a member / leave
 */
