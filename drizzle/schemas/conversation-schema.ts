import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema.js";

export const conversation = pgTable("conversation", {
  id: text("id").primaryKey(),
  isGroup: boolean("is_group").notNull().default(false),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  createdBy: text("created_by").references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const conversationParticipant = pgTable(
  "conversation_participant",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
    lastReadAt: timestamp("last_read_at"),
  },
  (table) => [
    uniqueIndex("conversation_participant_conversationId_userId_uidx").on(
      table.conversationId,
      table.userId,
    ),
    index("conversation_participant_userId_idx").on(table.userId),
  ],
);
