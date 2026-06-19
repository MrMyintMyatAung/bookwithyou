# BooksWithYou 📚

A social reading tracker where you create reading sessions for books, invite others to join, log your chapter progress, and discuss the book in a flat comment thread with emoji reactions.

## Overview

BooksWithYou turns reading into a shared experience. Pick a book, start a session, invite friends, and read together — each at your own pace. Track progress chapter by chapter, share thoughts in the discussion, and react with emojis.

- **Public sessions** — anyone can browse, join, and read along
- **Private sessions** — invite-only via direct link
- **Real-time updates** — comments, reactions, and progress sync live across members

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript 5.9, Tailwind CSS 4 |
| **Build tool** | Vite 7 |
| **Routing** | React Router v7 |
| **Data fetching** | TanStack Query v5 |
| **Backend** | Supabase (Postgres, Auth, Realtime, Storage) |
| **Mobile** (planned) | React Native (Expo) |

## Features (v1)

### Authentication
- Email + password sign-up with username selection
- Sign-in, sign-out, password reset / forgot password flow
- Profile auto-created via database trigger on sign-up
- PKCE auth flow for secure token exchange

### Sessions
- Create a reading session with book title, author, chapter list, and a session title
- Choose public or private visibility
- Browse public sessions on the landing page and sessions page
- View session detail: book info, chapter list, member list, progress bars, discussion thread
- Join a session (one click for public; direct link for private)
- Host can toggle session status: Active → Paused → Completed
- Copy shareable link from any session card (hover to reveal)

### Progress Tracking
- Log your chapters completed with +/- controls
- View progress bars for every member in a session
- Client-side validation (chapters can't exceed total, can't go below zero)
- Stored as `chapters_completed / total_chapters`

### Discussion
- Post comments in a session's discussion thread
- Delete your own comments (with confirmation dialog)
- Flat chronological display (oldest first)
- 2,000 character limit per comment
- IME-safe Enter-to-submit (never cuts off composition)

### Emoji Reactions
- React to any comment with emojis (👍 ❤️ 😂 🎉 etc.)
- Multiple different emojis on the same comment
- Toggle behavior: click again to remove your reaction
- Emoji picker popover on every comment

### Profiles
- View your own profile with session list (hosting / joined)
- Edit your display name
- Upload / change / remove your profile avatar
- View other members' profiles with their public sessions
- Avatars render as images with initials fallback on error

### Real-time
- Comments appear live as they're posted
- Reactions update instantly across all members
- Progress changes sync in real time
- Subscriptions only active for authenticated users (saves quota)

## Project Structure

```
bookswithyou/
├── src/
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Router + providers setup
│   ├── index.css                 # Tailwind imports
│   │
│   ├── components/
│   │   ├── auth/                 # Auth-related components
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   ├── sign-out-button.tsx
│   │   │   └── protected-route.tsx
│   │   │
│   │   ├── layout/               # App shell
│   │   │   ├── root-layout.tsx   # Nav + main + footer
│   │   │   └── nav-bar.tsx       # Sticky nav with auth state
│   │   │
│   │   ├── profile/              # Profile-specific components
│   │   │   ├── profile-card.tsx  # Avatar + username + join date
│   │   │   └── avatar-upload.tsx # Upload / preview / remove widget
│   │   │
│   │   ├── sessions/             # Session feature components
│   │   │   ├── session-card.tsx      # Card with share button
│   │   │   ├── create-session-form.tsx
│   │   │   ├── comment-list.tsx      # Comment input + thread
│   │   │   ├── comment-item.tsx      # Single comment + reactions
│   │   │   ├── progress-bar.tsx      # Horizontal progress bar
│   │   │   ├── progress-log.tsx      # +/- chapter controls
│   │   │   ├── reaction-chip.tsx     # Emoji + count pill
│   │   │   └── reaction-picker.tsx   # Emoji popover
│   │   │
│   │   └── ui/                   # Generic reusable primitives
│   │       ├── avatar.tsx        # Image with initials fallback
│   │       ├── button.tsx        # Variants: primary, secondary, ghost
│   │       ├── card.tsx          # Rounded container
│   │       ├── input.tsx         # Labeled input with error state
│   │       ├── spinner.tsx       # Loading indicator
│   │       └── skip-link.tsx     # Accessibility skip-to-content
│   │
│   ├── hooks/                    # Data access layer (TanStack Query + Supabase)
│   │   ├── useAuth.tsx           # AuthProvider context + onAuthStateChange
│   │   ├── useSessions.ts        # Sessions CRUD, members, join, status toggle
│   │   ├── useComments.ts        # Comments list, create, delete, realtime
│   │   ├── useProgress.ts        # Progress read, update, realtime
│   │   ├── useReactions.ts       # Reaction toggle, realtime
│   │   └── useProfile.ts         # Profile read, update, avatar upload/remove
│   │
│   ├── lib/                      # Shared utilities
│   │   ├── supabase.ts           # Supabase client (PKCE, detectSessionInUrl)
│   │   ├── constants.ts          # STATUS_CLASSES, STATUS_CYCLE, STATUS_LABEL
│   │   ├── avatars.ts            # getAvatarUrl, file validation constants
│   │   └── cn.ts                 # Tailwind classname merge helper
│   │
│   ├── pages/                    # Route-level page components
│   │   ├── home.tsx              # Landing page
│   │   ├── login.tsx             # Sign-in
│   │   ├── register.tsx          # Sign-up
│   │   ├── not-found.tsx         # 404
│   │   ├── auth/
│   │   │   ├── forgot-password.tsx
│   │   │   └── reset-password.tsx
│   │   ├── sessions/
│   │   │   ├── index.tsx         # Browse public sessions
│   │   │   ├── new.tsx           # Create a session (auth required)
│   │   │   └── detail.tsx        # Session detail + members + discussion
│   │   └── profile/
│   │       ├── me.tsx            # Own profile / settings
│   │       └── view.tsx          # Other member's public profile
│   │
│   └── types/
│       └── database.ts           # Supabase-generated Database type + enums
│
├── supabase/
│   └── migrations/
│       ├── 20260619000000_initial_schema.sql   # Tables, RLS, triggers, realtime
│       └── 20260619000001_avatars_storage.sql  # Storage bucket + policies
│
├── public/
│   └── book.svg                  # Favicon
│
├── index.html                    # HTML shell
├── package.json
├── vite.config.ts                # Vite + React + Tailwind + path alias
├── tsconfig.json                 # Strict TypeScript config
├── eslint.config.js
├── SPEC.md                       # Full project specification
├── CLAUDE.md                     # Claude Code instructions
└── README.md                     # This file
```

## Routes

| Path | Page | Auth Required |
|------|------|:---:|
| `/` | Landing page with hero + recent public sessions | No |
| `/login` | Sign-in form | No |
| `/register` | Sign-up form | No |
| `/forgot-password` | Request password reset email | No |
| `/reset-password` | Set new password (from email link) | No |
| `/sessions` | Browse all public sessions | No |
| `/sessions/new` | Create a new reading session | Yes |
| `/sessions/:id` | Session detail (members, progress, discussion) | Join requires auth |
| `/profile` | Own profile — edit name, avatar, view sessions | Yes |
| `/profile/:username` | Other member's public profile | No |

## Database Schema

```
profiles ──1:N── memberships ──N:1── sessions ──1:1── books
   │                                     │
   │                               ┌─────┼─────┬──────┐
   │                               │     │     │      │
   └───────────────────────────────┤     │     │      │
                                   │     │     │      │
                              memberships progress comments reactions
```

### Tables (7)

| Table | Purpose | Key constraints |
|-------|---------|----------------|
| `profiles` | Extended user data linked to `auth.users` | PK = `auth.users.id`, username UNIQUE |
| `books` | One book per session (title, author, chapter array) | `total_chapters` is a generated column from JSON array length |
| `sessions` | Reading group around a book | FK → profiles, FK → books |
| `memberships` | Member ↔ Session junction | UNIQUE(session_id, member_id) |
| `progress` | Member's chapters completed per session | UNIQUE(session_id, member_id) |
| `comments` | Flat discussion per session | FK → sessions, FK → profiles |
| `reactions` | Emoji on a comment | UNIQUE(comment_id, member_id, emoji) |

### Storage

| Bucket | Purpose | Access |
|--------|---------|--------|
| `avatars` | Profile photos | Public read, auth-only write, owner-only delete |

## Architecture Decisions

### Client-side data access (no API routes)

Instead of Next.js API routes or server actions, this project calls Supabase directly from the browser using the `@supabase/supabase-js` client. This is possible because of **Row-Level Security (RLS)** — every database table has granular policies that enforce who can read, insert, update, or delete each row. The client talks to PostgREST directly.

**Why:** Removes an entire layer of boilerplate (no `fetch`/`axios` calls, no API route handlers, no request validation middleware). The database itself enforces authorization.

### TanStack Query for server state

All data fetching goes through TanStack Query hooks (`useQuery` / `useMutation`). This gives us:

- **Caching** with configurable `staleTime` per query
- **Automatic refetching** on cache invalidation
- **Loading / error / success states** without manual booleans
- **Optimistic cache updates** via `queryClient.invalidateQueries`

### Hooks layer = data access layer

Every Supabase query lives in a dedicated hook under `src/hooks/`. Pages and components never call `supabase.from(...)` directly — they call hooks. This keeps the data layer swappable and testable.

### Real-time via Supabase Realtime

Comments, reactions, and progress tables are added to the `supabase_realtime` publication. Custom hooks (`useCommentsRealtime`, `useProgressRealtime`, `useReactionsRealtime`) subscribe to Postgres changes and invalidate TanStack Query caches when data changes. Subscriptions are scoped to the current session ID and only active for authenticated users.

### Route-based code organization

Pages are thin — they fetch data via hooks, derive a few booleans (`isHost`, `isMember`), and delegate rendering to feature components. Business logic lives in hooks. UI primitives live in `src/components/ui/`.

### Accessibility

- Skip-to-content link for keyboard users
- ARIA attributes throughout (`role="alert"`, `aria-expanded`, `aria-invalid`, `aria-label`, `aria-describedby`)
- Mobile menu closes on outside click and Escape
- Delete confirmation traps focus and responds to Escape
- IME-safe keyboard handlers (composition start/end tracking)
- Semantic HTML (`<main>`, `<nav>`, `<header>`, `<footer>`, `<fieldset>`, `<legend>`)

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier works)

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd bookswithyou
npm install

# 2. Set environment variables
cp .env.example .env
# Edit .env with your Supabase project URL and anon key:
#   VITE_SUPABASE_URL=https://your-project.supabase.co
#   VITE_SUPABASE_ANON_KEY=your-anon-key

# 3. Run migrations (via Supabase CLI or dashboard SQL editor)
# Apply supabase/migrations/20260619000000_initial_schema.sql
# Apply supabase/migrations/20260619000001_avatars_storage.sql

# 4. Start dev server
npm run dev
# → http://localhost:5173
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (publishable) key |

Both are validated at app startup — missing values throw a clear error.

## Development Phases

| Phase | Status |
|-------|--------|
| Phase 1: Foundation (Auth, DB schema, RLS) | ✅ Complete |
| Phase 2: Sessions (CRUD, listing, join, status) | ✅ Complete |
| Phase 3: Progress & Discussion (comments, reactions, realtime) | ✅ Complete |
| Phase 4: Polish (Profiles, avatars, responsive, a11y) | ✅ Complete |

## License

MIT
