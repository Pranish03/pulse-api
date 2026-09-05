import type { auth } from "../lib/auth.ts";

declare global {
  namespace Express {
    interface Request {
      user: typeof auth.$Infer.Session.user;
    }
  }
}
