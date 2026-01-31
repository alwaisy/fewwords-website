import { pgTable, text, integer, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

// Use crypto.randomUUID() for Cloudflare Workers compatibility
const generateId = () => crypto.randomUUID();

// Generate summaryId: few-XYZ (7 chars total)
const generateSummaryId = () => `few-${nanoid(3)}`;

// Enum for essence types
export const essenceEnum = ["article", "youtube", "reddit"] as const;
export type Essence = (typeof essenceEnum)[number];

// Summaries table
export const summaries = pgTable(
  "Summary",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    summaryId: text("summaryId")
      .notNull()
      .unique()
      .$defaultFn(() => generateSummaryId()),
    source: text("source").notNull(),
    essence: text("essence", { enum: essenceEnum }).notNull(),
    title: text("title"),
    summary: text("summary").notNull(),
    model: text("model").notNull(),
    promptTokens: integer("promptTokens"),
    completionTokens: integer("completionTokens"),
    totalTokens: integer("totalTokens"),
    isPublic: boolean("isPublic").notNull().default(true),
    responseTimeMs: integer("responseTimeMs"),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completedAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    essenceIdx: index("Summary_essence_idx").on(table.essence),
    createdAtIdx: index("Summary_createdAt_idx").on(table.createdAt),
  }),
);

// Types
export type Summary = typeof summaries.$inferSelect;
export type NewSummary = typeof summaries.$inferInsert;
