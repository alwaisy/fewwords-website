CREATE TABLE "Subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"tier" text DEFAULT 'FREE' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"quotaMonthly" integer DEFAULT 10 NOT NULL,
	"quotaUsed" integer DEFAULT 0 NOT NULL,
	"currentPeriodStart" timestamp with time zone,
	"currentPeriodEnd" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Summary" (
	"id" text PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"essence" text NOT NULL,
	"title" text,
	"summary" text NOT NULL,
	"model" text NOT NULL,
	"promptTokens" integer,
	"completionTokens" integer,
	"totalTokens" integer,
	"isPublic" boolean DEFAULT true NOT NULL,
	"responseTimeMs" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"completedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "UsageTracking" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"workflowId" text,
	"apiProvider" text NOT NULL,
	"action" text NOT NULL,
	"tokensUsed" integer,
	"costUsd" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"firstName" text,
	"lastName" text,
	"role" text DEFAULT 'USER' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "Workflow" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"sourceUrl" text NOT NULL,
	"sourceTitle" text,
	"summary" text NOT NULL,
	"aiProvider" text NOT NULL,
	"tokensUsed" integer,
	"processingTimeMs" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UsageTracking" ADD CONSTRAINT "UsageTracking_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UsageTracking" ADD CONSTRAINT "UsageTracking_workflowId_Workflow_id_fk" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "Subscription_userId_idx" ON "Subscription" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "Summary_essence_idx" ON "Summary" USING btree ("essence");--> statement-breakpoint
CREATE INDEX "Summary_createdAt_idx" ON "Summary" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "UsageTracking_userId_idx" ON "UsageTracking" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "UsageTracking_workflowId_idx" ON "UsageTracking" USING btree ("workflowId");--> statement-breakpoint
CREATE INDEX "UsageTracking_createdAt_idx" ON "UsageTracking" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "User_email_idx" ON "User" USING btree ("email");--> statement-breakpoint
CREATE INDEX "Workflow_userId_idx" ON "Workflow" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "Workflow_createdAt_idx" ON "Workflow" USING btree ("createdAt");