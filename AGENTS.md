# Fewwords

AI-powered content summarization service. Users paste URLs (articles, YouTube, Reddit) and get concise, actionable summaries using intelligent content classification and optimal summarization strategies.

## Build & Test

• Install dependencies: `bun install`
• Development server: `bun run dev` (http://localhost:3000)
• Development with worker: `bun run dev:full` (server + background processor)
• Build: `bun run build`
• Preview: `bun run preview`
• Type check: `bun run type` (or `nuxt typecheck`)
• Lint: `bun run lint`
• Auto-fix lint: `bun run lint:fix`
• Full check: `bun run check` (lint + type + fix)
• Add Shadcn component: `bun run shadcn <component-name>`

## Database Commands

• Start PostgreSQL: `bun run db:start:pg`
• Stop PostgreSQL: `bun run db:stop:pg`
• Reset database: `bun run db:reset` (down -v + up)
• Push schema: `bun run db:push`
• Generate migrations: `bun run db:generate`
• Run migrations: `bun run db:migrate`
• Open Drizzle Studio: `bun run db:studio`
• Seed database: `bun run db:seed`
• Seed admin user: `bun run db:seed:admin`

## Project Layout

├─ app/ → Nuxt app directory (auto-imports enabled)
│ ├─ components/ → Vue components (auto-imported)
│ │ ├─ home/ → Landing page sections
│ │ ├─ layout/ → Header, footer
│ │ ├─ app/ → App-specific components
│ │ └─ ui/ → Shadcn Vue components (no prefix)
│ ├─ composables/ → Vue composables (auto-imported)
│ ├─ layouts/ → Nuxt layout components
│ ├─ pages/ → File-based routing
│ └─ pages/app/ → Main app pages (input, processing, results)
├─ server/ → Nitro server code
│ ├─ api/ → API routes (REST conventions)
│ ├─ db/ → Database singleton (`useDb(event)`)
│ ├─ lib/ → Shared utilities (Redis, etc.)
│ ├─ queues/ → BullMQ queue definitions
│ ├─ workers/ → Background job processors
│ ├─ services/ → Business logic layer
│ │ ├─ article/ → Article summarization
│ │ ├─ youtube/ → YouTube 3-stage pipeline
│ │ ├─ reddit/ → Reddit summarization
│ │ └─ shared/ → LLM provider SDKs
│ └─ prompts/ → Prompt templates with versioning
│ ├─ article/ → v1, v2, v3 strategies
│ └─ youtube/ → Type-specific prompts
├─ db/ → Database schema and migrations (Drizzle ORM)
├─ layers/admin/ → Admin layer (extends main app)
└─ database/ → Docker Compose for local PostgreSQL (port 5433)

Path aliases: `@/` and `~/` resolve to `app/`, `~~/` resolves to project root.

## Architecture Overview

Nuxt 4 full-stack application with service-oriented architecture. Each content type (article, YouTube, Reddit) has dedicated service modules. Request flow: URL submission → content type detection → content fetching → LLM classification → summarization with type-specific prompts → PostgreSQL storage.

**Prompt Versioning:** Dynamic version detection without hardcoding. Add new versions to `server/prompts/article/` or `server/prompts/youtube/type/` - `getLatestVersions()` automatically detects latest patch version.

**Article Classification:** GPT-5 Mini reasoning selects optimal strategy: v1 structured (essays, research), v2 data-shot (tutorials, specs), v3 decision brief (news, time-sensitive). Falls back to v1 on failure.

**YouTube Pipeline:** 3-stage pipeline with real-time progress via SSE: (1) Metadata fetch, (2) Classification (worth watching?), (3) Summarization. Early exit if not worth it. Stage updates via Redis (`summary:{id}:stage`), SSE polls every 500ms.

**Database:** Singleton pattern via `useDb(event)`. Public IDs: `few-XYZ` (nanoid 3 chars), internal UUIDs. Long-running summaries use pending flow.

**LLM Integration:** Official SDKs (OpenRouter default, OpenAI, Anthropic). Multi-provider with reasoning (high/medium/low effort).

## Development Patterns & Constraints

### Coding Style
• TypeScript strict mode enabled
• Nuxt auto-imports: components, composables, utilities (no manual imports)
• Type imports: `import type { ... }`
• Shadcn components: no prefix, in `app/components/ui/`
• Function components with `<script setup>` syntax
• VeeValidate + Zod for form validation
• Naming: camelCase (vars/funcs), PascalCase (components/types), KEBAB_CASE (files)
• **File naming:** KEBAB_CASE enforced by ESLint (except Nuxt dynamic routes like `[id].vue`)

### File Organization
• Colocation: components near usage
• Barrel exports: `server/prompts/*/index.ts`
• Services: index.ts orchestrators per content type
• API routes: REST conventions (`/api/summarize`, `/api/summary/:id`)
• YouTube prompts: `type/v-1.ts`, `type/index.ts` exports `PROMPT`

### Styling
• Tailwind CSS v4 via @tailwindcss/vite
• Pink/purple theme, dark mode support
• Shadcn Vue (New York style), Reka UI primitives
• Fonts: Poppins (sans), Playfair Display (serif), Space Mono (mono)
• Toast: nuxt-toastify (colored, top-center, 4s auto-close, slide)

### Error Handling
• Zod schemas for runtime validation
• Toast notifications for user feedback
• Database errors → 500 responses
• Edge cases throw errors (not completed results): live streams, <5min, >3hr videos

### Async Patterns
• Async/await preferred
• Pending summary flow for long LLM calls
• SSE for YouTube stage updates (Redis-polling)
• Connection pooling: Drizzle (max 10 connections)

## Security

• Session-based auth (nuxt-auth-utils, encrypted HttpOnly cookies)
• `maxAge: 7 days`, `rolling: true`
• Magic link auth (15 min token expiry)
• Roles: `user` (default) | `admin`
• Admin middleware: `app/middleware/admin.ts` uses `useUserSession()`
• Server routes: `getUserSession(event)` directly
• API keys in environment variables
• DOMPurify for HTML sanitization
• Jina AI for content extraction
• SQL injection protection via Drizzle
• No auth on public summaries (few-XYZ IDs)

## Git Workflows

• Main branch: `master`
• Feature branches: `feature/add-llm-streaming` format
• Commit messages: Conventional commits (`feat:`, `fix:`, `chore:`)
• Droid Shield pre-commit hook checks for secrets
• Protected: `master` branch

## Evidence Required for Every PR

• All tests passing: `bun run check`
• Database migrations if schema changed: `bun run db:push`
• Diff confined to relevant directories
• **Proof artifact:**
  - Bug fix → reproduction case, fix explanation
  - Feature → working demo, type safety maintained
  - Prompt changes → test outputs showing improvement
• One-paragraph description covering intent and approach
• No unexplained dependencies added
• AGENTS.md updated if architecture changed

## External Services

• Jina AI - `JINA_AI_API_KEY` - Article content fetching
• OpenRouter - `OPENROUTER_API_KEY` - Default LLM provider
• OpenAI - `OPENAI_API_KEY` - Article classification (GPT-5 Mini)
• Anthropic - `ANTHROPIC_API_KEY` - Optional Claude access
• YouTube Data API v3 - `YOUTUBE_DATA_API_KEY` - Video metadata
• PostgreSQL - `DATABASE_URL` - Local on port 5433 (Docker)
• Redis - `REDIS_URL` - SSE stage updates (port 6380 local)
• Resend - `RESEND_API_KEY` - Magic link emails

## Gotchas & Common Pitfalls

• **Bun not npm/yarn/pnpm** - Project uses Bun
• **Auto-imports** - No manual imports for components/composables/utilities
• **Path aliases** - `~/` or `@/` for app, `~~/` for project root
• **Database singleton** - Access via `useDb(event)`, don't import directly
• **Prompt versioning** - Add to `server/prompts/`, update `index.ts`, auto-detected
• **YouTube prompts** - Folder structure: `type/v-1.ts`, `type/index.ts` exports `PROMPT`
• **dev-docs/** excluded from linting - See `--ignore-pattern 'dev-docs/**'`
• **Summary IDs** - Public: `few-XYZ` (nanoid 3), internal: UUID
• **PostgreSQL port 5433** - Docker uses 5433 to avoid system PG on 5432
• **YouTube Shorts rejected** - Immediate error, don't process
• **Classification defaults to v1** - Falls back if classifier fails
• **LLM response parsing** - Article summaries extract TITLE (supports `TITLE:` and `**TITLE:**`)
• **Admin middleware** - Use `useUserSession()` composable, NOT `getUserSession(event)`
• **Redis stage updates** - SSE polls every 500ms, sets `summary:{summaryId}:stage`
• **Layer architecture** - Admin in `layers/admin/` with `~admin` alias
• **YouTube SSE completed** - MUST call `setStage(summaryId, "completed")` after save or frontend stuck on loading
• **Library filtering** - Use `ne(summaries.status, 'failed')` with proper JOINs
• **Drizzle Studio shows pluralized names** - Table `"YouTube"` displays as `Youtubes` (same table)

## Performance Considerations

• Pending summary flow for long LLM calls
• Jina AI API for fast extraction
• Prompt classification reduces token usage
• Dynamic prompt versioning (no hardcoding)
• Database indexes on essence, created_at, status
• SSE for YouTube updates (less overhead than polling)
• Redis for ephemeral stage data (EX 3600)
• Streaming not yet implemented

## Deployment

• Build: `bun run build`
• Preview: `bun run preview`
• Set all .env variables before deployment
• Run migrations: `bun run db:push` or `bun run db:migrate`
• Hosting: Vercel, Netlify, Cloudflare, Node.js servers
