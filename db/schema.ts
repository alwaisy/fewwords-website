import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  index,
  numeric,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";

// Use crypto.randomUUID() for Cloudflare Workers compatibility
const generateId = () => crypto.randomUUID();

// Generate summaryId: few-XYZ (7 chars total)
const generateSummaryId = () => `few-${nanoid(3)}`;

// Enum for essence types
export const essenceEnum = ["article", "youtube", "reddit"] as const;
export type Essence = (typeof essenceEnum)[number];

// Enum for status
export const statusEnum = [
  "pending",
  "processing",
  "completed",
  "failed",
] as const;
export type SummaryStatus = (typeof statusEnum)[number];

// Summaries table
export const summaries = pgTable(
  "Summary",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    summaryId: text("summary_id")
      .notNull()
      .unique()
      .$defaultFn(() => generateSummaryId()),
    source: text("source").notNull(),
    essence: text("essence", { enum: essenceEnum }).notNull(),
    title: text("title"),
    summary: text("summary"),
    model: text("model"),
    promptId: text("prompt_id"),
    reasoning: text("reasoning"),
    reasoningEffort: text("reasoning_effort"), // "high", "medium", "low" - for reasoning models
    reasoningTokens: integer("reasoning_tokens"), // Actual reasoning tokens if available
    promptTokens: integer("prompt_tokens"),
    completionTokens: integer("completion_tokens"),
    totalTokens: integer("total_tokens"),
    isPublic: boolean("is_public").notNull().default(true),
    responseTimeMs: integer("response_time_ms"),
    status: text("status", { enum: statusEnum }).notNull().default("pending"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => ({
    essenceIdx: index("Summary_essence_idx").on(table.essence),
    createdAtIdx: index("Summary_created_at_idx").on(table.createdAt),
    statusIdx: index("Summary_status_idx").on(table.status),
  }),
);

// Types
export type Summary = typeof summaries.$inferSelect;
export type NewSummary = typeof summaries.$inferInsert;

// YouTube table (one-to-one with summaries)
export const youtube = pgTable(
  "YouTube",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    summaryId: text("summary_id")
      .notNull()
      .unique()
      .references(() => summaries.id), // One-to-one relation using internal ID

    // Stage 1: Video metadata from YouTube Data API
    videoId: text("video_id").notNull(),
    originalTitle: text("original_title").notNull(),
    description: text("description"),
    duration: numeric("duration", { precision: 5, scale: 2 }), // Duration in minutes (supports decimals like 26.5)
    tags: text("tags"), // JSON array of tags
    isAgeRestricted: boolean("is_age_restricted"),
    viewCount: text("view_count"),
    likeCount: text("like_count"),
    commentCount: text("comment_count"),

    // Stage 1: Channel metadata
    channelTitle: text("channel_title"),
    channelDescription: text("channel_description"),
    channelSubscriberCount: text("channel_subscriber_count"),
    channelVideoCount: text("channel_video_count"),
    channelKeywords: text("channel_keywords"),

    // Stage 2: Classifier results (LLM-generated)
    cleanTitle: text("clean_title"),
    channelBio: text("channel_bio"),
    category: text("category"), // TUTORIAL, REVIEW, INTERVIEW, etc.
    trueIntent: text("true_intent"),
    focusPoints: text("focus_points"), // JSON array
    isWorthIt: boolean("is_worth_it"),
    classifierReasoning: text("classifier_reasoning"),

    // Stage 2: Classifier model & usage stats
    classifierModel: text("classifier_model"),
    classifierReasoningEffort: text("classifier_reasoning_effort"), // "medium", "high", "low"
    classifierReasoningTokens: integer("classifier_reasoning_tokens"),
    classifierPromptTokens: integer("classifier_prompt_tokens"),
    classifierCompletionTokens: integer("classifier_completion_tokens"),
    classifierTotalTokens: integer("classifier_total_tokens"),
    classifierTimeMs: integer("classifier_time_ms"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    summaryIdIdx: index("YouTube_summary_id_idx").on(table.summaryId),
    videoIdIdx: index("YouTube_video_id_idx").on(table.videoId),
    categoryIdx: index("YouTube_category_idx").on(table.category),
  }),
);

export type YouTube = typeof youtube.$inferSelect;
export type NewYouTube = typeof youtube.$inferInsert;

// Relations
export const summariesRelations = relations(summaries, ({ one }) => ({
  youtube: one(youtube, {
    fields: [summaries.id],
    references: [youtube.summaryId],
  }),
}));

export const youtubeRelations = relations(youtube, ({ one }) => ({
  summary: one(summaries, {
    fields: [youtube.summaryId],
    references: [summaries.id],
  }),
}));
