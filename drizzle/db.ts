import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";
import { DATABASE_URL } from "../config/constants.js";

export const db = drizzle(DATABASE_URL, { schema });
