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
• Seed admin user: `bun run db:seed:admin`
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

Fewwords follows a modular service-oriented architecture within a Nuxt 4 framework. The core logic centers on a **URL → Summary** pipeline that detects content types and applies specialized summarization strategies.

1. **Request Flow:** A `POST /api/summarize` request triggers content detection. Articles are fetched via Jina AI, while YouTube metadata comes from the YouTube Data API.
2. **Article Classification:** Articles are classified into three strategies: `v1 (Structured)`, `v2 (Data Shot)`, or `v3 (Decision Brief)`.
3. **YouTube 3-Stage Pipeline:** YouTube videos follow a distinct Metadata → AI Classifying → Type-Specific Summarization flow, with progress updates streamed via Server-Sent Events (SSE).
4. **Data Layer:** Drizzle ORM manages a PostgreSQL database (port 5433). A singleton `useDb(event)` pattern handles connection pooling in Nitro routes.
5. **Background Processing:** Long-running tasks (YouTube) are offloaded to BullMQ workers via `nuxt-processor`.

## Development Patterns & Constraints

### Writing Rules (STRICT MANDATE)
• **Banned AI Words:** NEVER use: delve, realm, harness, unlock, tapestry, paradigm, cutting-edge, revolutionize, landscape, potential, findings, intricate, showcasing, crucial, pivotal, surpass, meticulously, vibrant, unparalleled, underscore, leverage, synergy, innovative, game-changer, testament, commendable, highlight, emphasize, boast, groundbreaking, align, foster, showcase, enhance, holistic, garner, accentuate, pioneering, trailblazing, unleash, versatile, transformative, redefine, seamless, optimize, scalable, robust, breakthrough, empower, streamline, intelligent, smart, next-gen, frictionless, elevate, adaptive, effortless, data-driven, insightful, proactive, mission-critical, visionary, disruptive, reimagine, agile.
• **Pattern Constraints:** Avoid "In a world where...", "Most people vs few who...", "Stop doing X. Start doing Y."
• **Formatting:** Replace em-dashes ("—") with periods or commas.
• **Style:** Natural, warm, conversational. Short sentences. No jargon. Be direct.

### Coding Style
• **Language:** TypeScript strict mode. Use `import type` for all type-only imports.
• **Naming:** Files and folders MUST use `KEBAB_CASE` (except Nuxt dynamic routes).
• **Components:** Vue 3 Composition API with `<script setup>`. Shadcn components have **no prefix**.
• **Auto-imports:** Nuxt auto-imports components, composables, and utils. Do not add manual imports for these.
• **Path Aliases:** Use `~~/` for root, `@/` or `~/` for `app/`.

### Error Handling
• **API:** Use H3 `createError` for structured error responses.
• **UI:** Use `nuxt-toastify` for user feedback (colored theme, top-center).

## Security

• **Authentication:** `nuxt-auth-utils` session-based auth with magic links.
• **Authorization:** Role-based (`user` | `admin`). Admin routes protected by `admin.ts` middleware.
• **Secrets:** Strictly managed via `runtimeConfig`. Never log or commit `.env` values.
• **Session:** Rolling 7-day session window.

## Git Workflows

• **Commit Conventions:** Follow existing repository style (typically concise and descriptive).
• **Branching:** Master branch triggers automatic deployment via GitHub Actions.
• **PR Requirements:** Must pass `bun run check` (linting + type checking).

## Evidence Required for Every PR

• `bun run check` must pass without errors.
• New features must include relevant test cases (if applicable) or verification logic.
• AI-generated summaries must adhere to the `WRITING_GUIDELINES` in `server/prompts/system.ts`.
• No regressions in the 3-stage YouTube pipeline or article classification.

## External Services

• **Jina AI** - `JINA_AI_API_KEY` - Article content extraction.
• **OpenRouter** - `OPENROUTER_API_KEY` - Default LLM provider (multi-model).
• **OpenAI** - `OPENAI_API_KEY` - Article classification (GPT-5 Mini).
• **YouTube API** - `YOUTUBE_DATA_API_KEY` - Video metadata fetching.
• **Resend** - `RESEND_API_KEY` - Magic link email delivery.
• **Upstash Redis** - `REDIS_URL` - Real-time progress updates (SSE).

## Gotchas & Common Pitfalls

• **Database Port:** PostgreSQL runs on **5433** via Docker to avoid conflicts with system PG.
• **Package Manager:** Use **Bun only**. Never use npm/yarn/pnpm.
• **YouTube Shorts:** Immediately rejected with a specific user message.
• **SSE Race Condition:** Stage updates to Redis must happen **after** DB writes to prevent client-side desync.
• **Type Aliases:** Always use `~~/db/schema` when importing database types to avoid circular dependencies.
