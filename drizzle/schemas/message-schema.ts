import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { conversation } from "./conversation-schema.js";
import { user } from "./auth-schema.js";

export const message = pgTable(
  "message",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("message_conversationId_createdAt_idx").on(
      table.conversationId,
      table.createdAt,
    ),
  ],
);
