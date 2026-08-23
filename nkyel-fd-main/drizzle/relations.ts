import { relations } from "drizzle-orm/relations";
import { users, conversations, messages, agentSessions, rendus, creditsLedger, auditLogs } from "./schema";

export const conversationsRelations = relations(conversations, ({one, many}) => ({
	user: one(users, {
		fields: [conversations.userId],
		references: [users.id]
	}),
	messages: many(messages),
	agentSessions: many(agentSessions),
	renduses: many(rendus),
}));

export const usersRelations = relations(users, ({many}) => ({
	conversations: many(conversations),
	messages: many(messages),
	agentSessions: many(agentSessions),
	renduses: many(rendus),
	creditsLedgers: many(creditsLedger),
	auditLogs: many(auditLogs),
}));

export const messagesRelations = relations(messages, ({one, many}) => ({
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.id]
	}),
	user: one(users, {
		fields: [messages.userId],
		references: [users.id]
	}),
	renduses: many(rendus),
}));

export const agentSessionsRelations = relations(agentSessions, ({one}) => ({
	user: one(users, {
		fields: [agentSessions.userId],
		references: [users.id]
	}),
	conversation: one(conversations, {
		fields: [agentSessions.conversationId],
		references: [conversations.id]
	}),
}));

export const rendusRelations = relations(rendus, ({one}) => ({
	conversation: one(conversations, {
		fields: [rendus.conversationId],
		references: [conversations.id]
	}),
	message: one(messages, {
		fields: [rendus.messageId],
		references: [messages.id]
	}),
	user: one(users, {
		fields: [rendus.userId],
		references: [users.id]
	}),
}));

export const creditsLedgerRelations = relations(creditsLedger, ({one}) => ({
	user: one(users, {
		fields: [creditsLedger.userId],
		references: [users.id]
	}),
}));

export const auditLogsRelations = relations(auditLogs, ({one}) => ({
	user: one(users, {
		fields: [auditLogs.userId],
		references: [users.id]
	}),
}));