ALTER TABLE "Subscription" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "UsageTracking" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "Workflow" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "Subscription" CASCADE;--> statement-breakpoint
DROP TABLE "UsageTracking" CASCADE;--> statement-breakpoint
DROP TABLE "User" CASCADE;--> statement-breakpoint
DROP TABLE "Workflow" CASCADE;--> statement-breakpoint
ALTER TABLE "Summary" ALTER COLUMN "summary" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Summary" ALTER COLUMN "model" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Summary" ALTER COLUMN "completedAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Summary" ALTER COLUMN "completedAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Summary" ADD COLUMN "summaryId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "Summary" ADD COLUMN "promptId" text;--> statement-breakpoint
ALTER TABLE "Summary" ADD COLUMN "reasoning" text;--> statement-breakpoint
ALTER TABLE "Summary" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "Summary" ADD COLUMN "errorMessage" text;--> statement-breakpoint
CREATE INDEX "Summary_status_idx" ON "Summary" USING btree ("status");--> statement-breakpoint
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_summaryId_unique" UNIQUE("summaryId");