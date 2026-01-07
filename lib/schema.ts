import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const deployLogs = pgTable("deploy_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  message: text("message").notNull(),
  source: text("source").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type DeployLog = typeof deployLogs.$inferSelect;
export type NewDeployLog = typeof deployLogs.$inferInsert;
