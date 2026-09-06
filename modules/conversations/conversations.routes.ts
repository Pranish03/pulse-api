import { Router } from "express";
import {
  createNewConversation,
  getAllConversations,
  getConversation,
  updateConversation,
} from "./conversations.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  conversationParamsSchema,
  createConversationSchema,
  updateConversationSchema,
} from "./conversations.schema.js";
import { uploadToCloudinary } from "../../middlewares/upload.middleware.js";
import { upload } from "../../lib/multer.js";

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

conversationRouter.patch(
  "/:id",
  requireAuth,
  validate(conversationParamsSchema, "params"),
  upload.single("avatarUrl"),
  uploadToCloudinary,
  validate(updateConversationSchema, "body"),
  updateConversation,
);

/**
 * Todo:
 * PATCH	/api/conversations/:id	                        Update group name/avatar
 * DELETE	/api/conversations/:id	                        Delete/leave a conversation
 * POST	    /api/conversations/:id/participants	            Add member(s) to a group
 * DELETE	/api/conversations/:id/participants/:userId	    Remove a member / leave
 */
