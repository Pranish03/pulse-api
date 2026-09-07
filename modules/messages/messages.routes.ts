import { Router } from "express";
import { deleteMessage, editMessage } from "./messages.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { messageParamsSchema, sendMessageSchema } from "./messages.schema.js";

export const messageRouter = Router();

/**
 * TODO
 * GET	    /api/conversations/:id/messages	    Paginated message history [*]
 * POST	    /api/conversations/:id/messages	    Send a message (you may end up moving this to Socket.io later, per our earlier discussion) [*]
 * PATCH	/api/messages/:id	                Edit a message [*]
 * DELETE	/api/messages/:id	                Soft-delete a message [*]
 * POST	    /api/conversations/:id/read	        Mark conversation as read (updates lastReadAt)
 */

messageRouter.patch(
  "/:id",
  requireAuth,
  validate(messageParamsSchema, "params"),
  validate(sendMessageSchema, "body"),
  editMessage,
);

messageRouter.delete(
  "/:id",
  requireAuth,
  validate(messageParamsSchema, "params"),
  deleteMessage,
);
