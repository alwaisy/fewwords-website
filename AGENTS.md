# Fewwords

AI-powered content summarization service. Users paste URLs (articles, YouTube, Reddit) and get concise, actionable summaries using intelligent content classification and optimal summarization strategies.

## Build & Test

• Install dependencies: `bun install`
• Start development server: `bun run dev` (http://localhost:3000)
• Build for production: `bun run build`
• Preview production build: `bun run preview`
• Type check: `bun run type` (or `nuxt typecheck`)
• Lint: `bun run lint`
• Auto-fix lint issues: `bun run lint:fix`
• Full check (lint + type): `bun run check`
• Add Shadcn component: `bun run shadcn <component-name>`

## Database Commands

• Start PostgreSQL: `bun run db:start:pg`
• Stop PostgreSQL: `bun run db:stop:pg`
• Reset database: `bun run db:reset`
• Push schema changes: `bun run db:push`
• Generate migration files: `bun run db:generate`
• Run migrations: `bun run db:migrate`
• Open Drizzle Studio: `bun run db:studio`
• Seed database: `bun run db:seed`

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
└─ local-database/ → Docker Compose for local PostgreSQL (port 5433)

Path aliases: `@/` and `~/` resolve to `app/`, `~~/` resolves to project root.

## Architecture Overview

**Nuxt 4 full-stack application** with intelligent content classification and multi-provider LLM integration. The system follows a service-oriented architecture where each content type (article, YouTube, Reddit) has dedicated service modules. Request flow: URL submission → content type detection → content fetching → classification → LLM summarization with type-specific prompts → PostgreSQL storage.

**Prompt versioning system** dynamically detects latest versions without hardcoding. The classifier uses GPT-5 Mini reasoning to select optimal summarization strategy based on content type (essays → v1 structured, tutorials → v2 data-shot, news → v3 decision brief).

**Multi-stage pipeline for YouTube**: metadata fetch → classification (worth watching?) → summarization with enriched context. Early exit if not worth watching.

**Database uses singleton pattern** accessed via `useDb(event)` in API routes. Summaries have public IDs (few-XYZ) and internal UUIDs. Long-running summaries use pending flow: create record → return summaryId → background processing → frontend polling.

**LLM integration**: Official SDKs for OpenRouter (default), OpenAI, and Anthropic. Migrated from Vercel AI SDK for direct provider control and reasoning support.

## Development Patterns & Constraints

### Coding Style

• TypeScript strict mode enabled
• Nuxt auto-imports for components, composables, utilities
• Use type imports: `import type { ... }`
• Shadcn components use no prefix, live in `app/components/ui/`
• All imports from `~/` or `@/` (resolve to `app/`)
• Function components with `<script setup>` syntax
• Composables for reusable logic (auto-imported)

### Component Patterns

• Functional Vue 3 Composition API with `<script setup>`
• Reactive refs using `ref()` and `computed()` from Vue
• Props defined with TypeScript interfaces
• Emits defined with `const emit = defineEmits<{ ... }>()`
• VeeValidate + Zod for form validation

### Styling

• Tailwind CSS v4 with custom theme via @tailwindcss/vite
• Pink/purple color scheme with dark mode support
• Shadcn Vue (New York style) for UI primitives, Reka UI underneath
• Custom CSS variables in `app/css/global.css`
• Fonts: Poppins (sans), Playfair Display (serif), Space Mono (mono)
• Custom scrollbar styling

### Error Handling

• Zod schemas for runtime validation
• Error boundaries via Vue error handling
• Toast notifications via nuxt-toastify (colored theme, top-center, 4s auto-close)
• Console.error logging with structured error objects
• Database errors caught and returned as 500 responses

### Type Safety

• TypeScript with strict mode
• Drizzle ORM for type-safe database queries
• Zod for request/response validation
• Type imports preferred: `import type { ... }`

### LLM Integration Patterns

• OpenRouter for multi-model support (default provider)
• OpenAI for classification (GPT-5 Mini reasoning model)
• Anthropic for Claude-specific requests
• Reasoning support: `reasoning: { effort: "high" | "medium" | "low" }`
• Tool calling for Google Search and URL context (YouTube)
• Streaming: Not yet implemented (see dev-docs/streaming-implementation-plan.md)

## Security

• Session-based auth via Nuxt Session (`NUXT_SESSION_PASSWORD` min 32 chars)
• Environment variables for all API keys (no hardcoded secrets)
• Input validation via Zod schemas
• DOMPurify for HTML sanitization (@radya/nuxt-dompurify)
• Jina AI for content extraction (bypasses Cloudflare protection)
• Public summary IDs (few-XYZ) separate from internal UUIDs
• No authentication on public summaries
• SQL injection protection via Drizzle ORM parameterized queries

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

## Gotchas & Common Pitfalls

• **Bun not npm/yarn/pnpm** - Project uses Bun as package manager
• **Auto-imports** - Components, composables, utilities auto-imported (no manual imports needed)
• **Path aliases** - Use `~/` or `@/` for app imports, `~~/` for project root
• **Database singleton** - Access via `useDb(event)` in API routes, don't import directly
• **Prompt versioning** - Add new versions to `server/prompts/` and update `index.ts` - auto-detected
• **dev-docs/** excluded from linting - See package.json lint script: `--ignore-pattern 'dev-docs/**'`
• **Summary IDs** - Public IDs use `few-XYZ` format, internal IDs are UUIDs
• **Type imports** - Use `import type { ... }` for type-only imports
• **Shadcn components** - No prefix, directly use `<Button>`, `<Card>`, etc.
• **PostgreSQL on port 5433** - Docker Compose uses 5433 to avoid conflict with system PostgreSQL on 5432
• **YouTube Shorts rejected** - Immediately return error, don't process
• **Classification defaults to v1** - If classifier fails, article defaults to v1 (structured)
• **LLM response parsing** - Article summaries extract TITLE from response (supports both `TITLE:` and `**TITLE:**` formats)

## Performance Considerations

• Pending summary flow for long-running LLM calls (background processing + polling)
• Jina AI API for fast content extraction (bypasses scraping challenges)
• Prompt classification routes to optimal strategy (reduces token usage)
• Dynamic prompt version detection (no hardcoding, easy A/B testing)
• Database indexes on essence, created_at, status columns
• PostgreSQL connection pooling via Drizzle
• Streaming not yet implemented (plan exists in dev-docs/)

## Deployment

• Build: `bun run build` (Nuxt generates optimized production build)
• Preview: `bun run preview` (test production build locally)
• Environment: Set all .env variables before deployment
• Database: Run migrations via `bun run db:push` or `bun run db:migrate`
• Hosting: Nuxt supports Vercel, Netlify, Cloudflare, Node.js servers
