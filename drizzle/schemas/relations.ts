import { relations } from "drizzle-orm";
import { friendship } from "./friendship-schema.js";
import { account, session, user } from "./auth-schema.js";
import {
  conversation,
  conversationParticipant,
} from "./conversation-schema.js";
import { message } from "./message-schema.js";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  conversationParticipants: many(conversationParticipant),
  sentMessages: many(message),
  sentFriendRequests: many(friendship, { relationName: "sentFriendRequests" }),
  receivedFriendRequests: many(friendship, {
    relationName: "receivedFriendRequests",
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const conversationRelations = relations(
  conversation,
  ({ one, many }) => ({
    creator: one(user, {
      fields: [conversation.createdBy],
      references: [user.id],
    }),
    participants: many(conversationParticipant),
    messages: many(message),
  }),
);

export const conversationParticipantRelations = relations(
  conversationParticipant,
  ({ one }) => ({
    conversation: one(conversation, {
      fields: [conversationParticipant.conversationId],
      references: [conversation.id],
    }),
    user: one(user, {
      fields: [conversationParticipant.userId],
      references: [user.id],
    }),
  }),
);

export const messageRelations = relations(message, ({ one }) => ({
  conversation: one(conversation, {
    fields: [message.conversationId],
    references: [conversation.id],
  }),
  sender: one(user, { fields: [message.senderId], references: [user.id] }),
}));

export const friendshipRelations = relations(friendship, ({ one }) => ({
  requester: one(user, {
    fields: [friendship.requesterId],
    references: [user.id],
    relationName: "sentFriendRequests",
  }),
  addressee: one(user, {
    fields: [friendship.addresseeId],
    references: [user.id],
    relationName: "receivedFriendRequests",
  }),
}));
