import { sql } from "drizzle-orm";
import { boolean, index, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  hasPaid: varchar("has_paid").default("false").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Magic link tokens table
export const magicTokens = pgTable(
  "magic_tokens",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    email: varchar("email").notNull(),
    tokenHash: varchar("token_hash").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("IDX_magic_tokens_email").on(table.email),
    index("IDX_magic_tokens_expires").on(table.expiresAt)
  ]
);

// Payment events table for debugging
export const paymentEvents = pgTable("payment_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  stripeSessionId: varchar("stripe_session_id"),
  stripeCustomerId: varchar("stripe_customer_id"),
  amount: varchar("amount"),
  status: varchar("status").notNull(), // "pending", "completed", "failed"
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type MagicToken = typeof magicTokens.$inferSelect;
export type PaymentEvent = typeof paymentEvents.$inferSelect;
