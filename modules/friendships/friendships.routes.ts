import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import {
  deleteFriendship,
  getAllFriends,
  getIncomingFriendRequests,
  getOutgoingFriendRequests,
  sendFriendRequest,
  updateFriendRequest,
} from "./friendships.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  friendshipParamsSchema,
  sendFriendRequestSchema,
  updateFriendRequestSchema,
} from "./friendships.schema.js";

export const friendshipRouter = Router();

friendshipRouter.get("/", requireAuth, getAllFriends);
friendshipRouter.get("/requests", requireAuth, getIncomingFriendRequests);
friendshipRouter.get("/requests/sent", requireAuth, getOutgoingFriendRequests);
friendshipRouter.post(
  "/requests",
  requireAuth,
  validate(sendFriendRequestSchema),
  sendFriendRequest,
);
friendshipRouter.patch(
  "/requests/:id",
  requireAuth,
  validate(friendshipParamsSchema, "params"),
  validate(updateFriendRequestSchema, "body"),
  updateFriendRequest,
);
friendshipRouter.delete(
  "/:id",
  requireAuth,
  validate(friendshipParamsSchema, "params"),
  deleteFriendship,
);
