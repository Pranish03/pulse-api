import { Router } from "express";

const messageRouter = Router();

/**
 * TODO
 * GET	    /api/conversations/:id/messages	    Paginated message history [*]
 * POST	    /api/conversations/:id/messages	    Send a message (you may end up moving this to Socket.io later, per our earlier discussion)
 * PATCH	/api/messages/:id	                Edit a message
 * DELETE	/api/messages/:id	                Soft-delete a message
 * POST	    /api/conversations/:id/read	        Mark conversation as read (updates lastReadAt)
 */
