import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../drizzle/db.js";
import { BETTER_AUTH_URL, FRONTEND_URL } from "../config/constants.js";

export const auth = betterAuth({
  baseURL: BETTER_AUTH_URL,
  trustedOrigins: [FRONTEND_URL],
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
});
