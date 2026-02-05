-- Rename camelCase columns to snake_case for SQL convention compliance
ALTER TABLE "Summary" RENAME COLUMN "summaryId" TO "summary_id";-->statement-breakpoint
ALTER TABLE "Summary" RENAME COLUMN "promptId" TO "prompt_id";-->statement-breakpoint
ALTER TABLE "Summary" RENAME COLUMN "promptTokens" TO "prompt_tokens";-->statement-breakpoint
ALTER TABLE "Summary" RENAME COLUMN "completionTokens" TO "completion_tokens";-->statement-breakpoint
ALTER TABLE "Summary" RENAME COLUMN "totalTokens" TO "total_tokens";-->statement-breakpoint
ALTER TABLE "Summary" RENAME COLUMN "isPublic" TO "is_public";-->statement-breakpoint
ALTER TABLE "Summary" RENAME COLUMN "responseTimeMs" TO "response_time_ms";-->statement-breakpoint
ALTER TABLE "Summary" RENAME COLUMN "errorMessage" TO "error_message";-->statement-breakpoint
ALTER TABLE "Summary" RENAME COLUMN "createdAt" TO "created_at";-->statement-breakpoint
ALTER TABLE "Summary" RENAME COLUMN "completedAt" TO "completed_at";-->statement-breakpoint
-- Update index names to match new column names
DROP INDEX IF EXISTS "Summary_createdAt_idx";-->statement-breakpoint
CREATE INDEX "Summary_created_at_idx" ON "Summary" USING btree ("created_at");
