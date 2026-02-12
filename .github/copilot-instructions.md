# Copilot instructions — Fewwords

Purpose
- Short guide for GitHub Copilot CLI / AI assistants to quickly understand how to build, run, test, and reason about this repository.

Build, test & lint (how to run)
- Install dependencies: `bun install`
- Dev server: `bun run dev` (http://localhost:3000)
- Build: `bun run build`
- Preview production build: `bun run preview`
- Type check: `bun run type` (alias: `nuxt typecheck`)
- Lint: `bun run lint`
- Fix lint issues: `bun run lint:fix`
- Full project check (lint + types): `bun run check`

Notes on tests
- There is no test runner configured in package.json currently (no `test` script).
- To run a single script: `bun run <script>` (e.g. `bun run db:seed`).
- If tests are added (Vitest/Jest), run a single test with the test runner's flags (e.g., `bun run test -- -t "pattern"`).

High-level architecture (big picture)
- Frontend: `app/` — Nuxt 4 + Vue 3 app. Auto-imports are used for components, composables, and utilities.
- Backend: `server/` — Nitro server routes and service layer. API surface includes `POST /api/summarize`, `GET /api/summary/:id` and streaming endpoint for processing updates.
- Services: `server/services/` — Service-oriented modules per content type: `article/`, `youtube/`, `reddit/`, and `shared/` for LLM integrations. Each content type has an orchestrator (`index.ts`) and helpers (classifier, fetcher, summarizer).
- Prompts: `server/prompts/` — Prompt versioning system (major/minor versions) that auto-detects latest prompt files; prompts are organized per content type and versioned.
- Database: `db/` (Drizzle ORM) + `database/` Docker compose for local PostgreSQL. The app uses a DB singleton accessed via `useDb(event)` in server routes.
- Admin layer: `layers/admin/` — separate admin UI layer that extends the main app (alias `~admin`).
- Long-running flows: pending-summary pattern (create pending record → return `summaryId` → background processing → frontend polls or uses SSE for updates).

Key conventions and repo-specific patterns
- Package manager: Bun (NOT npm/yarn/pnpm). Use `bun` and `bunx` for scripts and tasks.
- Path aliases: `~/` and `@/` resolve to `app/`; `~~/` resolves to project root.
- Auto-imports: Nuxt auto-imports components/composables/utilities — avoid manual imports when possible.
- DB access: Use `useDb(event)` in server routes; do NOT import DB connection directly (singleton pattern).
- Prompt versioning: Add new prompt files under `server/prompts/<type>/` and update barrel index if needed; code picks latest minor version automatically.
- YouTube pipeline: 3 stages (metadata → classify → summarize) with SSE updates; backend writes Redis key `summary:{summaryId}:stage` during processing for frontend SSE polling.
- IDs: Public IDs use `few-XYZ` format; internal IDs are UUIDs.
- Auth: Magic-link session-based auth using `nuxt-auth-utils`. Session secret in runtime config (`NUXT_SESSION_PASSWORD`), `maxAge: 7 days` with rolling extension.
- UI: shadcn-vue components live in `app/components/ui/` and intentionally have no prefix.
- Lint exceptions: `dev-docs/` is excluded from linting (see lint script `--ignore-pattern 'dev-docs/**'`).
- Local Postgres: Docker compose binds Postgres to port 5433 (avoid conflict with system Postgres).
- LLM providers: official SDKs for OpenRouter, OpenAI, Anthropic are used via `server/services/shared/llm/`.

Where to look for additional AI-assistant guidance
- CLAUDE.md — detailed guidance for Claude-based assistants (already in repo).
- AGENTS.md — agent guidance and custom agents in this workspace.
- README.md — quickstart commands and project overview.

Environment variables (major)
- See CLAUDE.md and README for full list. Important ones: `DATABASE_URL`, `NUXT_SESSION_PASSWORD`, `JINA_AI_API_KEY`, `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `YOUTUBE_DATA_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

PR & CI expectations
- PRs should pass `bun run check` (lint + types). If DB schema changes, run `bun run db:push` and include migration evidence.

Other assistant configs
- Present: `CLAUDE.md` and `AGENTS.md`. No .cursorrules, .windsurfrules, or other assistant-rule files detected.

Quick pointers for Copilot sessions
- Prefer `grep`/`glob` to find code locations, inspect `server/services/*` when asked about summarization behavior, and check `server/prompts/` for current prompt versions.
- When making code changes, run `bun run type` and `bun run lint:fix` locally before pushing.

