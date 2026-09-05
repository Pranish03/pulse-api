import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema.js";
import { randomUUID } from "node:crypto";

export const friendshipStatusEnum = pgEnum("friendship_status", [
  "pending",
  "accepted",
  "rejected",
  "blocked",
]);

export const friendship = pgTable(
  "friendship",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    requesterId: text("requester_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    addresseeId: text("addressee_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: friendshipStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("friendship_requesterId_addresseeId_uidx").on(
      table.requesterId,
      table.addresseeId,
    ),
    index("friendship_addresseeId_idx").on(table.addresseeId),
  ],
);
