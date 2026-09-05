import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from "./config/constants.js";

export default defineConfig({
  out: "./drizzle/migrations",
  schema: "./drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
