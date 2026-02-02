import { pgTable, text, integer, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

// Use crypto.randomUUID() for Cloudflare Workers compatibility
const generateId = () => crypto.randomUUID();

// Generate summaryId: few-XYZ (7 chars total)
const generateSummaryId = () => `few-${nanoid(3)}`;

// Enum for essence types
export const essenceEnum = ["article", "youtube", "reddit"] as const;
export type Essence = (typeof essenceEnum)[number];

// Enum for status
export const statusEnum = ["pending", "processing", "completed", "failed"] as const;
export type SummaryStatus = (typeof statusEnum)[number];

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
    summary: text("summary"),  // Made optional for pending records
    model: text("model"),
    promptId: text("promptId"),  // Track which prompt version was used
    reasoning: text("reasoning"),  // Classifier's reasoning for category selection (article only)
    promptTokens: integer("promptTokens"),
    completionTokens: integer("completionTokens"),
    totalTokens: integer("totalTokens"),
    isPublic: boolean("isPublic").notNull().default(true),
    responseTimeMs: integer("responseTimeMs"),
    status: text("status", { enum: statusEnum }).notNull().default("pending"),
    errorMessage: text("errorMessage"),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completedAt", { withTimezone: true }),
  },
  (table) => ({
    essenceIdx: index("Summary_essence_idx").on(table.essence),
    createdAtIdx: index("Summary_createdAt_idx").on(table.createdAt),
    statusIdx: index("Summary_status_idx").on(table.status),
  }),
);

// Types
export type Summary = typeof summaries.$inferSelect;
export type NewSummary = typeof summaries.$inferInsert;
