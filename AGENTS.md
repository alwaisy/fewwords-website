# Fewwords

AI-powered content summarization service. Users paste URLs (articles, YouTube, Reddit) and get concise, actionable summaries using intelligent content classification and optimal summarization strategies.

## Build & Test

• Install dependencies: `bun install`
• Development server: `bun run dev` (http://localhost:3000)
• Build: `bun run build`
• Preview: `bun run preview`
• Type check: `bun run type` (or `nuxt typecheck`)
• Lint: `bun run lint`
• Auto-fix lint: `bun run lint:fix`
• Full check: `bun run check` (lint + type)
• Add Shadcn component: `bun run shadcn <component-name>`

## Database Commands

• Start PostgreSQL: `bun run db:start:pg`
• Stop PostgreSQL: `bun run db:stop:pg`
• Reset database: `bun run db:reset`
• Push schema: `bun run db:push`
• Generate migrations: `bun run db:generate`
• Run migrations: `bun run db:migrate`
• Open Drizzle Studio: `bun run db:studio`
• Seed database: `bun run db:seed`
• Seed admin user: `bun run db:seed:admin`

## Project Layout

├─ app/ → Nuxt app directory (auto-imports, components, pages, composables)
│ ├─ components/ → Vue components (auto-imported)
│ │ ├─ home/ → Landing page sections
│ │ ├─ layout/ → Header, footer
│ │ ├─ app/ → App-specific components
│ │ └─ ui/ → Shadcn Vue components (no prefix)
│ ├─ composables/ → Vue composables (auto-imported)
│ ├─ layouts/ → Nuxt layout components
│ ├─ pages/ → File-based routing
│ └─ pages/app/ → Main app pages (summary input, processing, results)
├─ server/ → Nitro server code
│ ├─ api/ → API routes (POST /api/summarize, GET /api/summary/:id)
│ ├─ db/ → Database singleton and utilities
│ ├─ services/ → Business logic layer
│ │ ├─ article/ → Article summarization (fetcher, classifier, orchestrator)
│ │ ├─ youtube/ → YouTube summarization (metadata, classifier, summarizer)
│ │ ├─ reddit/ → Reddit summarization
│ │ └─ shared/ → LLM integration (OpenRouter, OpenAI, Anthropic official SDKs)
│ └─ prompts/ → Prompt templates with versioning
│ ├─ article/ → v1, v2, v3 strategies (v1.1, v2.3, etc. for improvements)
│ └─ youtube/ → Type-specific prompts (tutorial, review, news, opinion, etc.)
├─ db/ → Database schema and migrations (Drizzle ORM)
├─ layers/admin/ → Admin layer (extends main app)
│ └─ app/ → Admin-specific pages and components
└─ database/ → Docker Compose for local PostgreSQL (port 5433)

Path aliases: `@/` and `~/` resolve to `app/`, `~~/` resolves to project root.

## Architecture Overview

Nuxt 4 full-stack application with service-oriented architecture. Each content type (article, YouTube, Reddit) has dedicated service modules. Request flow: URL submission → content type detection → content fetching → classification → LLM summarization with type-specific prompts → PostgreSQL storage.

Prompt versioning system dynamically detects latest versions without hardcoding. Classifier uses GPT-5 Mini reasoning to select optimal summarization strategy (essays → v1 structured, tutorials → v2 data-shot, news → v3 decision brief).

YouTube uses distinct 3-stage pipeline: metadata fetch → classification (worth watching?) → summarization with enriched context. Early exit if not worth watching.

Database uses singleton pattern accessed via `useDb(event)` in API routes. Summaries have public IDs (few-XYZ) and internal UUIDs. Long-running summaries use pending flow: create record → return summaryId → background processing → frontend polling/SSE.

LLM integration via official SDKs for OpenRouter (default), OpenAI, and Anthropic. Multi-provider support with reasoning capabilities.

## Development Patterns & Constraints

### Coding Style
• TypeScript strict mode enabled
• Nuxt auto-imports: components, composables, utilities (no manual imports needed)
• Type imports: `import type { ... }`
• Shadcn components use no prefix, live in `app/components/ui/`
• Function components with `<script setup>` syntax
• VeeValidate + Zod for form validation
• Naming: camelCase for variables/functions, PascalCase for components/types

### File Organization
• Colocation: components near their usage (home/sections, app/components)
• Barrel exports for prompts: `server/prompts/article/index.ts`
• Services organized by content type with index.ts orchestrators
• API routes follow REST conventions: `/api/summarize`, `/api/summary/:id`

### Styling
• Tailwind CSS v4 with custom theme via @tailwindcss/vite
• Pink/purple color scheme with dark mode support
• Shadcn Vue (New York style) for UI primitives, Reka UI underneath
• CSS variables in `app/css/global.css`
• Fonts: Poppins (sans), Playfair Display (serif), Space Mono (mono)
• Toast: nuxt-toastify (colored, top-center, 4s auto-close)

### Error Handling
• Zod schemas for runtime validation
• Error boundaries via Vue error handling
• Toast notifications for user feedback
• Console.error logging with structured error objects
• Database errors caught and returned as 500 responses

### Async Patterns
• Async/await preferred (no callbacks)
• Pending summary flow for long-running LLM calls
• SSE for YouTube stage updates (Redis-polling implementation)
• Connection pooling via Drizzle singleton

## Security

• Session-based auth via nuxt-auth-utils (encrypted HttpOnly cookies)
• `maxAge: 7 days` with `rolling: true` (extends on activity)
• Magic link authentication (15 min token expiry)
• Role-based access: `user` (default) | `admin` (admin panel)
• Admin middleware: `app/middleware/admin.ts` uses `useUserSession()` composable
• Server-side routes use `getUserSession(event)` directly
• API keys in environment variables (no hardcoded secrets)
• DOMPurify for HTML sanitization (@radya/nuxt-dompurify)
• Jina AI for content extraction (bypasses Cloudflare)
• SQL injection protection via Drizzle ORM parameterized queries
• No authentication on public summaries (few-XYZ IDs)

## Git Workflows

• Main branch: `master`
• Feature branches: `feature/add-llm-streaming` format
• Commit messages: Conventional commits (`feat:`, `fix:`, `chore:`)
• Droid Shield pre-commit hook checks for secrets
• Protected: `master` branch

## Evidence Required for Every PR

A pull request is reviewable when it includes:

• All tests passing: `bun run check` (lint + type check)
• Database migrations run if schema changed: `bun run db:push`
• Diff confined to relevant directories (app/, server/, db/)
• **Proof artifact**:
  - Bug fix → reproduction case, fix explanation
  - Feature → working demo, type safety maintained
  - Prompt changes → test outputs showing improvement
• One-paragraph description covering intent and approach
• No unexplained dependencies added to package.json
• AGENTS.md updated if architecture changed

## External Services

• Jina AI - `JINA_AI_API_KEY` - Article content fetching and extraction
• OpenRouter - `OPENROUTER_API_KEY` - Default LLM provider (multi-model support)
• OpenAI - `OPENAI_API_KEY` - Required for article classification (GPT-5 Mini)
• Anthropic - `ANTHROPIC_API_KEY` - Optional, for Claude model access
• YouTube Data API v3 - `YOUTUBE_DATA_API_KEY` - Video metadata fetching
• PostgreSQL (Docker) - `DATABASE_URL` - Local development database on port 5433
• Redis (Docker) - `REDIS_URL` - Real-time stage updates via SSE (port 6380)
• Resend - `RESEND_API_KEY` - Email service for magic links

## Gotchas & Common Pitfalls

• **Bun not npm/yarn/pnpm** - Project uses Bun as package manager
• **Auto-imports** - Components, composables, utilities auto-imported (no manual imports needed)
• **Path aliases** - Use `~/` or `@/` for app imports, `~~/` for project root
• **Database singleton** - Access via `useDb(event)` in API routes, don't import directly
• **Prompt versioning** - Add new versions to `server/prompts/` and update `index.ts` - auto-detected
• **dev-docs/** excluded from linting - See package.json lint script: `--ignore-pattern 'dev-docs/**'`
• **Summary IDs** - Public IDs use `few-XYZ` format, internal IDs are UUIDs
• **PostgreSQL on port 5433** - Docker Compose uses 5433 to avoid conflict with system PostgreSQL on 5432
• **YouTube Shorts rejected** - Immediately return error, don't process
• **Classification defaults to v1** - If classifier fails, article defaults to v1 (structured)
• **LLM response parsing** - Article summaries extract TITLE from response (supports both `TITLE:` and `**TITLE:**` formats)
• **Admin middleware** - Use `useUserSession()` composable in middleware, NOT `getUserSession(event)`
• **Redis stage updates** - SSE endpoint polls Redis every 500ms, sets `summary:{summaryId}:stage` key
• **Layer architecture** - Admin lives in `layers/admin/` with `~admin` alias, extends main app via `nuxt.config.ts`

## Performance Considerations

• Pending summary flow for long-running LLM calls (background processing + polling)
• Jina AI API for fast content extraction (bypasses scraping challenges)
• Prompt classification routes to optimal strategy (reduces token usage)
• Dynamic prompt version detection (no hardcoding, easy A/B testing)
• Database indexes on essence, created_at, status columns
• PostgreSQL connection pooling via Drizzle (max: 10 connections)
• SSE for YouTube updates (less overhead than polling)
• Redis for ephemeral stage data (EX 3600 auto-cleanup)
• Streaming not yet implemented (plan exists in dev-docs/)

## Deployment

• Build: `bun run build` (Nuxt generates optimized production build)
• Preview: `bun run preview` (test production build locally)
• Environment: Set all .env variables before deployment
• Database: Run migrations via `bun run db:push` or `bun run db:migrate`
• Hosting: Nuxt supports Vercel, Netlify, Cloudflare, Node.js servers
