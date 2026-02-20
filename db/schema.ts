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

// User roles enum
export const userRoleEnum = ["user", "admin"] as const;
export type UserRole = (typeof userRoleEnum)[number];

// Users table for authentication
export const users = pgTable(
  "User",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    username: text("username").unique(),
    role: text("role", { enum: userRoleEnum }).notNull().default("user"),
    magicLinkToken: text("magic_link_token"),
    magicLinkExpiresAt: timestamp("magic_link_expires_at", {
      withTimezone: true,
    }),
    // Email change verification
    pendingEmail: text("pending_email"),
    emailChangeToken: text("email_change_token"),
    emailChangeExpiresAt: timestamp("email_change_expires_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailIdx: index("User_email_idx").on(table.email),
    magicLinkTokenIdx: index("User_magic_link_token_idx").on(
      table.magicLinkToken,
    ),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

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
    stage: text("stage"), // Temporary field for multi-stage loading (metadata, classifying, summarizing)
    errorMessage: text("error_message"),
    userId: text("user_id").references(() => users.id),
    isBackgroundJob: boolean("is_background_job").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => ({
    essenceIdx: index("Summary_essence_idx").on(table.essence),
    createdAtIdx: index("Summary_created_at_idx").on(table.createdAt),
    statusIdx: index("Summary_status_idx").on(table.status),
    userIdIdx: index("Summary_user_id_idx").on(table.userId),
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

    // Stage 3: Transcript cache (LLM-generated)
    transcriptText: text("transcript_text"),
    transcriptModel: text("transcript_model"),
    transcriptReasoningEffort: text("transcript_reasoning_effort"),
    transcriptPromptTokens: integer("transcript_prompt_tokens"),
    transcriptCompletionTokens: integer("transcript_completion_tokens"),
    transcriptTotalTokens: integer("transcript_total_tokens"),
    transcriptReasoningTokens: integer("transcript_reasoning_tokens"),
    transcriptTimeMs: integer("transcript_time_ms"),
    transcriptCachedAt: timestamp("transcript_cached_at", {
      withTimezone: true,
    }),

    // Total cycle time (from user submit to completed/failed)
    totalTimeMs: integer("total_time_ms"),

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

// Article table (one-to-one with summaries)
export const articles = pgTable(
  "Article",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    summaryId: text("summary_id")
      .notNull()
      .unique()
      .references(() => summaries.id), // One-to-one relation using internal ID

    // Stage 1: SEO metadata (from page/OpenGraph tags)
    metaTitle: text("meta_title"), // <title> or og:title
    metaDescription: text("meta_description"), // <meta name="description"> or og:description

    // Stage 1: Source info (for analytics)
    domain: text("domain"), // nytimes.com, blog.posthog.com, etc.
    author: text("author"), // If available in article
    publishedAt: timestamp("published_at", { withTimezone: true }), // Article date if available

    // Stage 1: Content stats (for dashboard)
    wordCount: integer("word_count"), // Raw content word count
    readingTimeMinutes: integer("reading_time_minutes"), // ~200 words/min

    // Stage 2: Classifier stats (token usage tracking)
    classifierModel: text("classifier_model"),
    classifierPromptTokens: integer("classifier_prompt_tokens"),
    classifierCompletionTokens: integer("classifier_completion_tokens"),
    classifierTotalTokens: integer("classifier_total_tokens"),
    classifierTimeMs: integer("classifier_time_ms"),

    // Total cycle time (from user submit to completed/failed)
    totalTimeMs: integer("total_time_ms"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    summaryIdIdx: index("Article_summary_id_idx").on(table.summaryId),
    domainIdx: index("Article_domain_idx").on(table.domain),
  }),
);

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;

// Relations
export const summariesRelations = relations(summaries, ({ one }) => ({
  youtube: one(youtube, {
    fields: [summaries.id],
    references: [youtube.summaryId],
  }),
  article: one(articles, {
    fields: [summaries.id],
    references: [articles.summaryId],
  }),
}));

export const youtubeRelations = relations(youtube, ({ one }) => ({
  summary: one(summaries, {
    fields: [youtube.summaryId],
    references: [summaries.id],
  }),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  summary: one(summaries, {
    fields: [articles.summaryId],
    references: [summaries.id],
  }),
}));

// Saved summaries table (junction table for user bookmarked summaries)
export const savedSummaries = pgTable(
  "SavedSummary",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    summaryId: text("summary_id")
      .notNull()
      .references(() => summaries.summaryId), // Use public ID (few-XYZ)
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userSummaryIdx: index("SavedSummary_user_summary_idx").on(
      table.userId,
      table.summaryId,
    ),
  }),
);

export type SavedSummary = typeof savedSummaries.$inferSelect;
export type NewSavedSummary = typeof savedSummaries.$inferInsert;
