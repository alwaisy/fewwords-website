# Fewwords

AI-powered content summarization. Get the insight from any article or video in 60 seconds.

## Features

- **Article & Video Summaries** - Paste any URL, get a concise summary
- **Reader Mode** - Clean, distraction-free reading experience
- **Magic Link Auth** - Passwordless authentication
- **Shareable Links** - Send summaries to friends, no account needed

## Tech Stack

- **Framework:** Nuxt 4 + Vue 3
- **UI:** shadcn-vue (New York style) + Tailwind CSS v4
- **Icons:** Nuxt Icon (Lucide)
- **Database:** SQLite (better-sqlite3)
- **Styling:** Custom warm color theme

## Getting Started

Install dependencies:

```bash
bun install
```

Run development server:

```bash
bun run dev
```

Visit `http://localhost:3000`

## Project Structure

```
app/
├── components/
│   ├── home/          # Landing page sections
│   ├── layout/        # Header, footer
│   ├── app/           # App-specific components
│   └── ui/            # shadcn-vue components
├── composables/
│   └── use-auth.ts    # Auth state management
├── layouts/
│   ├── default.vue    # Main layout
│   └── auth.vue       # Auth pages layout
└── pages/
    ├── index.vue      # Landing page
    ├── about.vue      # About page
    ├── auth/          # Auth pages (login, register, etc.)
    └── app/           # App pages
```

## Pages

- `/` - Landing page (SLAY copywriting framework)
- `/about` - About page
- `/app` - URL input page
- `/app/processing` - Processing with step-by-step feedback
- `/app/[id]` - Summary view
- `/auth/login` - Sign in with magic link
- `/auth/register` - Create account
- `/auth/check-email` - Email verification prompt
- `/auth/verify` - Verify magic link
- `/auth/link-expired` - Handle expired links
- `/settings` - Account settings (read-only for MVP)

## Development

Build for production:

```bash
bun run build
```

Preview production build:

```bash
bun run preview
```

## To-Do

- [ ] Backend API integration
- [ ] Real email sending (Resend/Brevo)
- [ ] WebSocket for processing updates
- [ ] Edit account settings
- [ ] Billing & subscription
