# Fewwords

AI-powered content summarization service for articles, YouTube videos, and Reddit threads. It uses intelligent content classification and type-specific prompts to deliver concise, actionable insights.

## Build & Test

• Install dependencies: `bun install`
• Development server (web + worker): `bun run dev:full`
• Web server only: `bun run dev`
• Build for production: `bun run build`
• Preview production: `bun run preview`
• Lint code: `bun run lint`
• Auto-fix lint issues: `bun run lint:fix`
• Type check: `bun run type`
• Full check (lint + type): `bun run check`
• Start local services (PG + Redis): `bun run db:start:pg`
• Stop local services: `bun run db:stop:pg`
• Push DB schema: `bun run db:push`
• Seed database: `bun run db:seed`
• Add shadcn component: `bun run shadcn <name>`

## Project Layout

├─ app/ → Nuxt frontend (pages, components, composables)
│  ├─ components/ui/ → Shadcn components (no prefix)
│  ├─ components/app/ → App-specific UI components
│  └─ pages/ → File-based routing (kebab-case)
├─ server/ → Nitro backend (API, services, workers, prompts)
│  ├─ api/ → REST API endpoints
│  ├─ services/ → Core business logic (article, youtube, reddit)
│  ├─ prompts/ → Strategy-specific LLM prompts (v[Major].[Minor].ts)
│  ├─ queues/ → BullMQ queue definitions
│  └─ workers/ → Background job processors
├─ db/ → Drizzle schema, seeds, and migrations
├─ layers/admin/ → Admin panel UI and logic
└─ database/ → Docker Compose for local development

## Architecture Overview

Fewwords follows a modular service-oriented architecture within a Nuxt 4 framework. The core logic centers on a URL to Summary pipeline that detects content types and applies specialized summarization strategies.

1. Request Flow: A POST /api/summarize request triggers content detection. Articles are fetched via Jina AI, while YouTube metadata comes from the YouTube Data API.
2. Article Classification: Articles are classified into three strategies: v1 (Structured), v2 (Data Shot), or v3 (Decision Brief).
3. YouTube 3-Stage Pipeline:
   • Stage 1: Metadata - Fetch video/channel data from YouTube Data API.
   • Stage 2: Classifying - AI analyzes thumbnail + metadata to determine category and worth watching.
   • Stage 3: Summarizing - Full video analysis with type-specific prompt.
4. Data Layer: Drizzle ORM manages a PostgreSQL database (port 5433). A singleton useDb(event) pattern handles connection pooling in Nitro routes.
5. Background Processing: Long-running tasks like YouTube summaries are offloaded to BullMQ workers via nuxt-processor.
6. Real-time Updates: Progress updates are streamed via Server-Sent Events (SSE) using Redis for stage tracking.

## Development Patterns & Constraints

### Coding Style
• Language: TypeScript strict mode. Use `import type` for all type-only imports.
• Naming: Files and folders MUST use KEBAB_CASE (except Nuxt dynamic routes).
• Components: Vue 3 Composition API with `<script setup>`. Shadcn components have no prefix.
• Auto-imports: Nuxt auto-imports components, composables, and utils. Do not add manual imports for these.
• Path Aliases: Use `~~/` for root, `@/` or `~/` for `app/`.
• Prompt Versioning: Strategy-specific prompts are versioned (e.g., v1.1, v1.2). getLatestVersions() auto-detects the latest minor version.

### Error Handling
• API: Use H3 `createError` for structured error responses.
• UI: Use `nuxt-toastify` for user feedback (colored theme, top-center).

### Security
• Authentication: `nuxt-auth-utils` session-based auth with magic links via Resend.
• Authorization: Role-based (user or admin). Admin routes are protected by admin.ts middleware.
• Secrets: Strictly managed via runtimeConfig. Never log or commit .env values.
• Session: Rolling 7-day session window.

### Git Workflows
• Branching: master is the default branch. Use descriptive feature branches.
• Commits: Conventional Commits (feat:, fix:, refactor:, chore:).
• Deployment: Push to master triggers GitHub Actions deployment to production VPS.
• Migrations: Run `bun run db:push` before deploying schema changes.

## Evidence Required for Every PR

• All checks passing: `bun run check` (lint + type check).
• Linting: No violations in app/, server/, or layers/.
• Proof artifact:
  - Bug fix → Failing test/case identified, now resolved.
  - Feature → Screenshots or logs demonstrating the new functionality.
• Documentation: Update README.md or GEMINI.md if architectural changes were made.

## External Services

• Jina AI - `JINA_AI_API_KEY` - Article content extraction.
• OpenRouter - `OPENROUTER_API_KEY` - Default LLM provider (multi-model).
• OpenAI - `OPENAI_API_KEY` - Article classification (GPT-5 Mini).
• YouTube API - `YOUTUBE_DATA_API_KEY` - Video metadata fetching.
• Resend - `RESEND_API_KEY` - Magic link email delivery.
• Upstash Redis - `REDIS_URL` - Real-time progress updates (SSE) and BullMQ.

## Gotchas & Common Pitfalls

• Database Port: PostgreSQL runs on 5433 via Docker to avoid conflicts with system PG.
• Package Manager: Use Bun only. Never use npm, yarn, or pnpm.
• YouTube Shorts: Immediately rejected with a specific user message.
• SSE Race Condition: Stage updates to Redis must happen after DB writes to prevent client-side desync.
• Type Aliases: Always use `~~/database/orm/schema` when importing database types to avoid circular dependencies.
• Singleton Pattern: Always use `useDb(event)` in API routes. Never import the DB client directly.
• ID Formats: Public IDs use `few-XYZ` (nanoid 3 chars), while internal IDs are UUIDs.
• Idempotency: `POST /api/summarize` checks if a record is already processing or completed to prevent duplicate work.
