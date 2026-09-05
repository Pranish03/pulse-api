import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import {
  getAllFriends,
  getIncomingFriendRequests,
  getOutgoingFriendRequests,
} from "./friendships.controller.js";

export const friendshipRouter = Router();

friendshipRouter.get("/", requireAuth, getAllFriends);
friendshipRouter.get("/requests", requireAuth, getIncomingFriendRequests);
friendshipRouter.get("/requests/sent", requireAuth, getOutgoingFriendRequests);
