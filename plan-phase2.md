# Phase 2 Implementation Plan — Sessions

## What We're Building

Phase 2 adds session CRUD: create sessions with a book + chapters, browse public sessions, view session details with member list, join sessions, and let the host toggle session status.

## Architecture (consistent with Phase 1)

- **Data fetching:** `@tanstack/react-query` hooks calling Supabase client directly
- **Auth gating:** `<ProtectedRoute>` wrapper for pages that need authentication
- **No server-side code** — everything is client-side Supabase calls
- **Existing patterns:** Button/Input/Card/Spinner UI primitives, `cn()` utility, amber color palette, Inter font

---

## New Supabase Migration

One RLS fix needed: members of public sessions should be viewable by everyone (currently memberships are only viewable by session members, which prevents showing the member list to visitors).

```sql
-- Allow anyone to see memberships of public sessions
CREATE POLICY "Memberships of public sessions are viewable by everyone"
  ON memberships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = memberships.session_id
      AND sessions.visibility = 'public'
    )
  );
```

---

## New Files

### `src/hooks/useSessions.ts`
React Query hooks for all session operations:
- `usePublicSessions()` — list public sessions with book, host, member count
- `useSession(id)` — single session with book + host
- `useSessionMembers(sessionId)` — members with profiles
- `useCreateSession()` — mutation: book insert → session insert → auto-join membership
- `useJoinSession(sessionId)` — mutation: insert membership
- `useUpdateSessionStatus(sessionId)` — mutation: host toggles status

### `src/pages/sessions/index.tsx` — SessionListPage
- Grid of `SessionCard` components
- Route: `/sessions`
- Public (no auth required)
- **States:** loading (skeleton grid), empty ("No sessions yet"), populated, error

### `src/pages/sessions/new.tsx` — CreateSessionPage
- Wraps `CreateSessionForm` in a `<ProtectedRoute>`
- Route: `/sessions/new`
- Auth required

### `src/pages/sessions/[id].tsx` — SessionDetailPage
- Full session view: book info, member list, host tools, join button
- Route: `/sessions/:id`
- Public viewable (join requires auth)
- **States:** loading (skeleton), not found (404), found (detail), error
- Status toggle visible only to host

### `src/components/sessions/session-card.tsx`
- Card in the browsing grid showing: session title, book title + author, host name, member count, chapter count, status badge
- Links to `/sessions/:id`
- Used on home page + sessions page

### `src/components/sessions/create-session-form.tsx`
- Form: session title, visibility selector (public/private), book title, book author, chapters textarea (one per line)
- Client-side validation + Supabase insert chain
- On success → navigate to `/sessions/:newId`
- **States:** default, validating, submitting, error

---

## Modified Files

### `src/App.tsx`
Add 3 new routes under `<RootLayout>`:
```
/sessions         → SessionListPage
/sessions/new     → <ProtectedRoute><CreateSessionPage /></ProtectedRoute>
/sessions/:id     → SessionDetailPage
```

### `src/pages/home.tsx`
- Replace the "Start a Reading Session" button link (already points to `/sessions/new`) — keep as-is
- Add a "Browse Sessions" link below the hero for unauthenticated visitors
- Below the "How it works" cards, show a small section of recent public sessions (3-4 `SessionCard` components)

### `src/components/layout/nav-bar.tsx`
- Add "Sessions" link to the nav for both authenticated and unauthenticated users

### `src/types/database.ts`
- Already has the correct types from Phase 1 — no changes needed

---

## Data Flow

### Create Session (sequential inserts)
```
User fills form
  → validate chapters textarea (non-empty, split by newline)
  → supabase.from('books').insert({title, author, chapters}) → returns book.id
  → supabase.from('sessions').insert({host_id, book_id, title, visibility}) → returns session.id
  → supabase.from('memberships').insert({session_id, member_id: host_id})
  → navigate to /sessions/:id
```

### Join Session
```
Click "Join" on session detail
  → supabase.from('memberships').insert({session_id, member_id})
  → invalidate session members query
```

### Status Toggle
```
Host clicks status button
  → supabase.from('sessions').update({status: newStatus}).eq('id', sessionId)
  → invalidate session query
```

---

## Component States Checklist

### SessionListPage
- **Loading:** 6 skeleton cards (pulsing gray rectangles)
- **Empty:** "No reading sessions yet" with illustration emoji + "Start one" CTA (if authenticated)
- **Populated:** Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- **Error:** "Could not load sessions" with retry button

### SessionCard
- **Default:** Book emoji, session title, book title, author, host name, member count chip, status badge
- **Hover:** Subtle shadow lift, primary border glow

### CreateSessionForm
- **Default:** Empty form, chapters textarea with placeholder example
- **Validating:** Inline field errors (title required, book title required, at least 1 chapter)
- **Submitting:** Button loading state, all fields disabled
- **Success:** Redirect to new session page
- **Error:** Banner with Supabase error message
- **Edge case:** Not authenticated → redirect to login (handled by ProtectedRoute)

### SessionDetailPage
- **Loading:** Full-page skeleton (title bar, content area, member list placeholders)
- **Not found:** 404-style message with "Back to Sessions" link
- **Found (visitor):** Book info, chapter list, member list, "Sign in to join" CTA
- **Found (member, not host):** All of above, progress display, comment area (Phase 3)
- **Found (host):** All of above, status toggle dropdown
- **Found (already joined):** Member list shows you, "Joined" badge instead of join button
- **Error:** Banner with retry

---

## Routes Summary

| Route | Page | Auth | Description |
|-------|------|------|-------------|
| `/` | HomePage | No | Hero + featured sessions |
| `/login` | LoginPage | No | Sign in |
| `/register` | RegisterPage | No | Sign up |
| `/sessions` | SessionListPage | No | Browse all public sessions |
| `/sessions/new` | CreateSessionPage | Yes | Create a session |
| `/sessions/:id` | SessionDetailPage | No* | Session detail (join needs auth) |
| `*` | NotFoundPage | No | 404 |

---

## Implementation Order

1. **Supabase:** Add RLS policy for public session memberships
2. **Hook:** `useSessions.ts` — all data fetching hooks
3. **Component:** `SessionCard`
4. **Page:** `SessionListPage` (`/sessions`)
5. **Component:** `CreateSessionForm`
6. **Page:** `CreateSessionPage` (`/sessions/new`)
7. **Page:** `SessionDetailPage` (`/sessions/:id`)
8. **Integration:** Update `App.tsx` routes, update `HomePage` with recent sessions, update `NavBar`
9. **Verify:** Build check, type check
