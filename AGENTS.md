# Fewwords

AI-powered content summarization service for articles, YouTube videos, and Reddit threads. Users paste URLs and get concise, actionable summaries using intelligent content classification and type-specific prompts.

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
│  ├─ composables/ → Auto-imported composables (use-auth, use-tab-count)
│  ├─ middleware/ → Route guards (admin.ts, auth.ts)
│  └─ pages/ → File-based routing (kebab-case)
├─ server/ → Nitro backend (API, services, workers, prompts)
│  ├─ api/ → REST API endpoints
│  ├─ services/ → Core business logic (article, youtube, reddit, shared/llm)
│  ├─ prompts/ → Strategy-specific LLM prompts (v[Major].[Minor].ts)
│  ├─ queues/ → BullMQ queue definitions
│  ├─ workers/ → Background job processors
│  └─ db/ → useDb(event) singleton for connection pooling
├─ db/ → Drizzle schema, seeds, and migrations
├─ layers/admin/ → Admin panel UI layer (extends main app via nuxt.config)
└─ database/ → Docker Compose for local PostgreSQL (port 5433)

## Architecture Overview

Fewwords follows a modular service-oriented architecture within a Nuxt 4 framework. The core logic centers on a **URL to Summary** pipeline that detects content types and applies specialized summarization strategies.

1. **Request Flow:** A `POST /api/summarize` request triggers content detection. Articles are fetched via Jina AI Reader API, while YouTube metadata comes from the YouTube Data API.
2. **Article Classification:** Articles are classified into three strategies: `v1 (Structured)` for essays/research, `v2 (Data Shot)` for specs/tutorials, `v3 (Decision Brief)` for news/time-sensitive content. Classification uses GPT-5 Mini via OpenAI.
3. **YouTube 3-Stage Pipeline:** Videos follow Metadata to AI Classifying to Summarization flow. Stage updates stream to the client via SSE (Redis polling every 500ms). If the classifier determines a video is not worth watching, it exits early with reasoning.
4. **Prompt Versioning:** Prompts live in `server/prompts/<type>/` with major/minor versioning (e.g., v1.2, v2.4). The `getLatestVersions()` function auto-detects the latest minor version. Each prompt file exports `ARTICLE_PROMPT` and `PROMPT_META`.
5. **LLM Integration:** Uses official SDKs (not Vercel AI SDK) at `server/services/shared/llm/`. Three providers: OpenRouter (default, multi-model), OpenAI, and Anthropic. Each exports a `call<Provider>()` function with unified interface.
6. **Background Processing:** Long-running YouTube summaries use BullMQ workers via `nuxt-processor`. Two processes: `fewwords-web` (port 3000) and `fewwords-worker`.
7. **Data Layer:** Drizzle ORM manages PostgreSQL (port 5433). The `useDb(event)` singleton handles connection pooling in Nitro routes.

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
• **Linting:** ESLint with `eslint-plugin-check-file` for kebab-case enforcement. Import order enforced (builtin, external, internal, parent, sibling, index). `dev-docs/` excluded from lint.

### Error Handling
• **API:** Use H3 `createError` for structured error responses.
• **UI:** Use `nuxt-toastify` for user feedback (colored theme, top-center, 4s auto-close).

### Design System
• **Colors:** Pink/purple theme with dark mode support (color-mode module).
• **Fonts:** Poppins (sans), Playfair Display (serif), Space Mono (mono).
• **UI Library:** Shadcn Vue (New York style) with Reka UI primitives, Tailwind CSS v4.
• **Validation:** VeeValidate + Zod for form validation.

## Security

• **Authentication:** `nuxt-auth-utils` session-based auth with magic links (Resend email). No JWT or refresh tokens, session cookie IS the auth.
• **Authorization:** Role-based (`user` | `admin`). Admin routes protected by `admin.ts` middleware using `useUserSession()` composable.
• **Secrets:** Strictly managed via `runtimeConfig` in `nuxt.config.ts`. Never log or commit `.env` values.
• **Session:** Rolling 7-day session window. Logout clears `nuxt-session` and `nuxt-session.token` cookies.

## Git Workflows

• **Commit Conventions:** Follow existing repository style (typically concise and descriptive).
• **Branching:** `master` is the default branch. Push to `master` triggers automatic deployment via GitHub Actions.
• **PR Requirements:** Must pass `bun run check` (linting + type checking).
• **Deployment:** GitHub Actions builds Docker image, pushes to GHCR, SSHs into VPS to pull and run via Docker Compose.

## Evidence Required for Every PR

• `bun run check` must pass without errors.
• New features must include relevant test cases (if applicable) or verification logic.
• AI-generated summaries must adhere to the `WRITING_GUIDELINES` in `server/prompts/system.ts`.
• No regressions in the 3-stage YouTube pipeline or article classification.
• If DB schema changes, run `bun run db:push` and include migration evidence.

## External Services

• **Jina AI** - `JINA_AI_API_KEY` - Article content extraction via Reader API.
• **OpenRouter** - `OPENROUTER_API_KEY` - Default LLM provider (multi-model).
• **OpenAI** - `OPENAI_API_KEY` - Article classification (GPT-5 Mini).
• **Anthropic** - `ANTHROPIC_API_KEY` - Optional LLM provider.
• **YouTube API** - `YOUTUBE_DATA_API_KEY` - Video metadata fetching.
• **Resend** - `RESEND_API_KEY` - Magic link email delivery.
• **Upstash Redis** - `REDIS_URL` - Real-time progress updates (SSE) and BullMQ job queue.

## Deployment

• **CI/CD:** GitHub Actions on push to `master`. Builds Docker image, pushes to `ghcr.io/alwaisy/fewwords-website:latest`.
• **Production:** Docker Compose on VPS runs two containers: `fewwords-web` (port 3000) and `fewwords-worker`.
• **Process Manager:** PM2 with `deploy/ecosystem.config.cjs` (alternative to Docker). Logs to `./logs/`.
• **Reverse Proxy:** Caddy handles SSL automatically. Config: `fewwords.app www.fewwords.app { reverse_proxy localhost:3000 }`.
• **Migrations:** Run via `docker compose run --rm web bun run db:push` during deploy.

## Gotchas & Common Pitfalls

• **Database Port:** PostgreSQL runs on **5433** via Docker to avoid conflicts with system PG on 5432.
• **Package Manager:** Use **Bun only**. Never use npm/yarn/pnpm.
• **YouTube Shorts:** Immediately rejected with a specific user message.
• **SSE Race Condition:** Stage updates to Redis must happen **after** DB writes to prevent client-side desync.
• **Type Aliases:** Always use `~~/database/orm/schema` when importing database types to avoid circular dependencies.
• **Singleton Pattern:** Always use `useDb(event)` in API routes. Never import the DB client directly.
• **ID Formats:** Public IDs use `few-XYZ` format (nanoid 3 chars). Internal IDs are UUIDs.
• **Idempotency:** `POST /api/summarize` checks if a record is already processing or completed to prevent duplicate work.
• **Prompt Files:** When adding new prompt versions, create the file and add to barrel index. `getLatestVersions()` auto-detects it.
• **Admin Middleware:** Use `useUserSession()` composable in route middleware, not `getUserSession(event)` which does not auto-import.
