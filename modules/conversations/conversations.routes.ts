import { Router } from "express";
import {
  addParticipants,
  createNewConversation,
  deleteConversation,
  getAllConversations,
  getConversation,
  removeParticipant,
  updateConversation,
} from "./conversations.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  addParticipantsSchema,
  conversationParamsSchema,
  conversationParticipantParamsSchema,
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

conversationRouter.delete(
  "/:id",
  requireAuth,
  validate(conversationParamsSchema, "params"),
  deleteConversation,
);

conversationRouter.post(
  "/:id/participants",
  requireAuth,
  validate(conversationParamsSchema, "params"),
  validate(addParticipantsSchema, "body"),
  addParticipants,
);

conversationRouter.delete(
  "/:id/participants/:userId",
  requireAuth,
  validate(conversationParticipantParamsSchema, "params"),
  removeParticipant,
);
