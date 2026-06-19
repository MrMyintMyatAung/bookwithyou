# Phase 1 Implementation Plan — Foundation (React + Vite)

## Stack

| Layer | Choice |
|-------|--------|
| Build | Vite 9 (`react-ts` template) |
| UI | React 19 + TypeScript (strict) |
| Routing | react-router-dom v7 |
| Styling | Tailwind CSS v4 |
| Data fetching | @tanstack/react-query v5 |
| Backend | Supabase (hosted project `ogyucvkubmicmlbhlawx`) |
| Auth | @supabase/supabase-js (browser client, PKCE flow) |
| Package manager | npm |

## Architecture Overview

```
bookwithyou/
├── public/
├── src/
│   ├── main.tsx                     # Entry point, providers wrapper
│   ├── App.tsx                      # Router layout
│   ├── index.css                    # Tailwind imports + global styles
│   ├── lib/
│   │   └── supabase.ts              # Supabase client singleton
│   ├── hooks/
│   │   ├── useAuth.ts               # Auth context + provider
│   │   └── useProfile.ts            # React Query: fetch/create profile
│   ├── components/
│   │   ├── ui/                      # Shared UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── spinner.tsx
│   │   ├── layout/
│   │   │   ├── root-layout.tsx      # App shell: nav + outlet
│   │   │   └── nav-bar.tsx          # Auth-aware top navigation
│   │   └── auth/
│   │       ├── login-form.tsx
│   │       ├── register-form.tsx
│   │       └── sign-out-button.tsx
│   ├── pages/
│   │   ├── home.tsx                 # Landing / public sessions (shell for now)
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── not-found.tsx
│   └── types/
│       └── database.ts              # Generated Supabase types
├── supabase/
│   └── migrations/
│       └── 20260619000000_initial_schema.sql
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── .env                              # VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
├── .env.example
├── index.html
└── package.json
```

## Key Architecture Differences from Next.js Plan

- **No server-side rendering** — everything is client-side. Auth state lives in React Context + React Query.
- **`@supabase/supabase-js`** directly (not `@supabase/ssr`). Sessions persist in localStorage via the Supabase client.
- **No middleware** — route protection done via `<ProtectedRoute>` wrapper component.
- **No API routes** — data operations call Supabase client directly from components/hooks.
- **Vite environment variables** use `VITE_` prefix (not `NEXT_PUBLIC_`).

---

## Implementation Steps

### Step 1: Scaffold Vite project
```bash
npm create vite@latest . -- --template react-ts
npm install
```
- Clean up boilerplate (delete `App.css`, demo content in `App.tsx`)
- Configure `vite.config.ts` if needed (defaults are fine)

### Step 2: Install dependencies
```bash
npm install @supabase/supabase-js react-router-dom @tanstack/react-query
npm install tailwindcss @tailwindcss/vite
```
- Configure Tailwind v4 via Vite plugin in `vite.config.ts`
- Import Tailwind in `src/index.css`

### Step 3: Environment & Supabase client
- Create `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Create `.env.example` template
- Create `src/lib/supabase.ts` with `createClient()` singleton

### Step 4: Database schema (via MCP)
- Use MCP `execute_sql` to run the full schema from SPEC.md:
  - Enums (`session_visibility`, `session_status`)
  - Tables (`profiles`, `books`, `sessions`, `memberships`, `progress`, `comments`, `reactions`)
  - Indexes
  - Profile auto-creation trigger function
  - RLS policies (all 7 tables)
  - Enable Realtime for `comments`, `reactions`, `progress`
- Use MCP `get_advisors` to validate schema

### Step 5: UI primitives
- `Button` — variants (primary, secondary, ghost), sizes (sm, md, lg), loading spinner state
- `Input` — label, error message, disabled state
- `Card` — simple container with padding + shadow
- `Spinner` — CSS-animated loading indicator

### Step 6: Auth system
- `AuthProvider` (React Context) wrapping the app
  - Holds `user`, `profile`, `isLoading`, `isAuthenticated`
  - Subscribes to `supabase.auth.onAuthStateChange()`
  - Fetches profile via React Query when user changes
- `useAuth()` hook consuming the context
- `LoginForm` — email + password → `supabase.auth.signInWithPassword()`
- `RegisterForm` — email + password + username → `supabase.auth.signUp()` with `email_confirm: false` and `user_metadata: { username }`
- `SignOutButton` — calls `supabase.auth.signOut()`

### Step 7: Routing
- `react-router-dom` `createBrowserRouter`
- Routes:
  - `/` → Home (landing page, will show public sessions in Phase 2)
  - `/login` → Login page
  - `/register` → Register page
  - `*` → 404 page
- `<ProtectedRoute>` wrapper: redirects to `/login` if not authenticated

### Step 8: Navigation
- `NavBar` with:
  - Logo / app name (links to `/`)
  - Unauthenticated: "Sign In" + "Join" buttons
  - Authenticated: username display + "Sign Out"
  - Mobile: hamburger menu for nav links

### Step 9: Type generation
- Generate types from the live Supabase schema for type-safe queries

---

## All States Per Component

### AuthProvider
- **Loading**: Auth state initializing (session check) — show full-page spinner/skeleton
- **Unauthenticated**: `user` is `null`, expose methods for login/register
- **Authenticated**: `user` + `profile` populated, expose signOut
- **Error**: Auth observer error — retry with backoff, show banner if persistent

### LoginForm
- **Default**: Empty email + password fields, "Sign In" button enabled
- **Loading**: Button shows spinner + "Signing in…", fields disabled
- **Error**: Inline error banner (invalid credentials, network error, rate limit)
- **Edge cases**: Already logged in → redirect to `/`

### RegisterForm
- **Default**: Empty username + email + password fields
- **Loading**: Button spinner + "Creating account…", fields disabled
- **Validation error**: Username too short/contains invalid chars, weak password — inline hints
- **Server error**: Username taken → highlight username field; generic error otherwise
- **Success**: Auto-sign-in → redirect to `/`
- **Edge cases**: Already logged in → redirect to `/`

### NavBar
- **Loading (auth)**: Placeholder skeleton for nav links
- **Logged out**: "Sign In" + "Join" visible
- **Logged in**: Username + "Sign Out" visible
- **Mobile**: Condensed hamburger menu, smooth slide-in nav

### SignOutButton
- **Default**: "Sign Out" text or icon
- **Loading**: Spinner, "Signing out…"
- **Error**: Force-clear local state, redirect to `/` (fail-safe)

### Input
- **Default**: Label, placeholder, value
- **Focused**: Ring highlight, label slightly emphasized
- **Error**: Red border, error message below
- **Disabled**: Muted background, not-allowed cursor

---

## Design Notes (Simple but Lovely)

- **Color palette**: Warm, inviting — amber/gold accent on neutral backgrounds
- **Typography**: System font stack, generous line-height (1.6), clear hierarchy
- **Spacing**: Breathable — consistent 4px scale, lots of white space
- **Cards**: Subtle rounded corners (0.5rem), soft shadows, light borders
- **Forms**: Centered on page, max 420px width, clean vertical flow
- **Animations**: Subtle — hover transitions on buttons (200ms), fade-in on page mounts
- **Responsive**: Works from 320px mobile to 1440px desktop. Nav collapses at 640px. Cards stack vertically on small screens, grid on larger.
- **Font**: Inter as the primary font (clean, readable)

---

## Not in Phase 1
- Session CRUD, progress, comments, reactions (Phases 2-3)
- Profile pages (Phase 4)
- Password reset (Supabase-built-in works; custom UI in later phase)
- Mobile app
