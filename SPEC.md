# BooksWithYou — Project Specification

## Overview

**BooksWithYou** is a social reading tracker where members create and join reading sessions for specific books, log their chapter progress, and discuss the book in a flat comment thread with emoji reactions.

- **Backend:** Supabase (Postgres, Auth, Realtime, Storage)
- **Web:** Next.js (React)
- **Mobile:** React Native (Expo)

---

## User Roles & Auth

| Role | Capabilities |
|------|-------------|
| **Visitor** | View public sessions (read-only), cannot interact |
| **Member** (registered) | Create sessions, join sessions, log progress, comment, react |

- Authentication via Supabase Auth (email/password as primary; social OAuth as future enhancement).
- A member who creates a session is the **session host**. In v1, the host has no special permissions beyond what a regular member has — they cannot delete comments, kick members, or edit the session after creation.
- Registration is open to anyone with a valid email.

---

## Core Entities

### Book
A book is created when a member submits one for a session. A book belongs to exactly one session.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `title` | text | Required |
| `author` | text | Required |
| `chapters` | jsonb | Ordered array of chapter names, e.g. `["Prologue","Ch.1: The Beginning","Ch.2: The Road"]` |
| `total_chapters` | integer | Derived from `chapters` length, stored for query convenience |
| `created_at` | timestamptz | |

### Session
A reading session groups members around one book. Created by a host member.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `host_id` | UUID | FK → `profiles.id` |
| `book_id` | UUID | FK → `books.id` (one-to-one) |
| `title` | text | Session display name (e.g. "Summer Reading: Dune") |
| `visibility` | enum | `'public'` or `'private'` |
| `status` | enum | `'active'`, `'paused'`, `'completed'` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

- Public sessions are visible to everyone (including visitors) and anyone can join.
- Private sessions are visible only to members who have joined. Discovery TBD (v1: direct link or invite code; v2: invite system).

### Profile
Extended user metadata, linked to Supabase `auth.users`.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | FK → `auth.users.id` |
| `username` | text | Unique, chosen at registration |
| `display_name` | text | |
| `avatar_url` | text | Supabase Storage URL |
| `created_at` | timestamptz | |

### Membership
Junction between a member and a session they've joined.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `session_id` | UUID | FK → `sessions.id` |
| `member_id` | UUID | FK → `profiles.id` |
| `joined_at` | timestamptz | |
| UNIQUE | (`session_id`, `member_id`) | |

### Progress
A member's reading progress within a session. Updated each time they log progress.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `session_id` | UUID | FK → `sessions.id` |
| `member_id` | UUID | FK → `profiles.id` |
| `chapters_completed` | integer | Count of chapters finished (0 – total_chapters) |
| `updated_at` | timestamptz | Last progress update |
| UNIQUE | (`session_id`, `member_id`) | One progress record per member per session |

- The progress bar is computed as `chapters_completed / book.total_chapters * 100`.
- Members update their progress by setting `chapters_completed` to the number they've finished. The system does not track which specific chapters — only the count. This keeps it simple for v1.
- A progress history (for "who finished what when") is a v2 feature.

### Comment
A flat discussion thread scoped to a single session.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `session_id` | UUID | FK → `sessions.id` |
| `author_id` | UUID | FK → `profiles.id` |
| `body` | text | The comment content |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | For edit tracking |

- Flat model: no nesting, no threading, no parent/child relationships.
- Comments are displayed in chronological order (oldest first).
- v1 scope: no edit history, no soft-delete. Comments can be hard-deleted by their author only.

### Reaction
An emoji reaction on a comment.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `comment_id` | UUID | FK → `comments.id` |
| `member_id` | UUID | FK → `profiles.id` |
| `emoji` | text | Single emoji character |
| UNIQUE | (`comment_id`, `member_id`, `emoji`) | A member can leave multiple *different* emojis on one comment |

- A member can react with 👍, ❤️, 😂, etc. on the same comment — each is a separate reaction row.
- Clicking the same emoji again removes it (toggle behavior).

---

## Feature Summary — v1 (MVP)

### Authentication
- [ ] Email + password sign-up with username selection
- [ ] Email + password sign-in
- [ ] Sign-out
- [ ] Password reset flow

### Sessions
- [ ] Create a session: submit book title, author, chapter list, session title, visibility (public/private)
- [ ] Browse public sessions (visitors and members)
- [ ] View session detail: book info, member list, progress bars, discussion
- [ ] Join a public session (members only)
- [ ] Join a private session (via direct link or session code; members only)
- [ ] Host can toggle session status (active ↔ paused ↔ completed)

### Progress
- [ ] Log progress: set number of chapters completed for current session
- [ ] View progress bar for each member in a session (including yourself)
- [ ] Progress bar shows `chapters_completed / total_chapters` as a percentage

### Discussion
- [ ] Post a comment in a session's discussion thread
- [ ] Delete own comment
- [ ] View all comments in chronological order
- [ ] React to any comment with an emoji (multiple different emojis allowed)
- [ ] Toggle emoji reaction on/off

### Profile
- [ ] View own profile
- [ ] View other members' profiles (sessions in common, basic info)

### Out of Scope (v2+)
- Notifications (email, push, in-app)
- Search (books, sessions, comments)
- Session host admin powers (delete comments, remove members, edit session)
- Per-chapter progress tracking (which specific chapters are done)
- Progress history / timeline
- Comment threading or nested replies
- Comment edit history
- Social OAuth login
- Book covers / image uploads
- Reading schedule / milestones / deadlines
- Direct messaging between members

---

## Database Schema (Supabase)

```sql
-- Enum types
CREATE TYPE session_visibility AS ENUM ('public', 'private');
CREATE TYPE session_status AS ENUM ('active', 'paused', 'completed');

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Books (one per session)
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  chapters JSONB NOT NULL DEFAULT '[]',
  total_chapters INTEGER GENERATED ALWAYS AS (jsonb_array_length(chapters)) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES profiles(id),
  book_id UUID NOT NULL REFERENCES books(id),
  title TEXT NOT NULL,
  visibility session_visibility NOT NULL DEFAULT 'public',
  status session_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Memberships
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES profiles(id),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, member_id)
);

-- Progress
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES profiles(id),
  chapters_completed INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, member_id)
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Reactions
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES profiles(id),
  emoji TEXT NOT NULL,
  UNIQUE(comment_id, member_id, emoji)
);

-- Indexes
CREATE INDEX idx_sessions_visibility ON sessions(visibility) WHERE visibility = 'public';
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_memberships_session ON memberships(session_id);
CREATE INDEX idx_memberships_member ON memberships(member_id);
CREATE INDEX idx_progress_session ON progress(session_id);
CREATE INDEX idx_comments_session ON comments(session_id, created_at);
CREATE INDEX idx_reactions_comment ON reactions(comment_id);
```

### Row-Level Security (RLS)

- `profiles`: Public read; owner can update own row; insert on sign-up trigger.
- `books`: Authenticated users can read books linked to sessions they're in (or all public sessions). Insert on session creation.
- `sessions`: Public read for `visibility = 'public'`; members of a private session can read it; host can update `status`.
- `memberships`: Visible to members of the same session; insert on join; no delete in v1 (no "leave session" yet).
- `progress`: Visible to members of the same session; owner can insert/update own progress.
- `comments`: Visible to members of the same session; author can insert/delete own comment.
- `reactions`: Visible to members of the same session; member can insert/delete own reactions.

---

## Supabase Services Used

| Service | Purpose |
|---------|---------|
| **Auth** | Email/password authentication, session management |
| **Database (Postgres)** | All application data, RLS policies |
| **Realtime** | Live updates for comments, reactions, and progress changes within a session |
| **Storage** | Profile avatars (v1 minimal; expand later for book covers) |
| **Edge Functions** | Trigger-based: auto-create profile on sign-up; validate chapter count on progress update |

---

## API Design (Next.js API Routes / Server Actions)

### Sessions
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/sessions` | Create a session (with embedded book) |
| `GET` | `/api/sessions` | List public sessions (paginated) |
| `GET` | `/api/sessions/[id]` | Get session detail |
| `PATCH` | `/api/sessions/[id]` | Host updates session status |
| `POST` | `/api/sessions/[id]/join` | Join a session |
| `GET` | `/api/sessions/[id]/members` | List members with progress |

### Progress
| Method | Route | Description |
|--------|-------|-------------|
| `PUT` | `/api/sessions/[id]/progress` | Set own chapters completed |

### Comments
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/sessions/[id]/comments` | List comments for a session |
| `POST` | `/api/sessions/[id]/comments` | Post a comment |
| `DELETE` | `/api/comments/[id]` | Delete own comment |

### Reactions
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/comments/[id]/react` | Toggle emoji reaction on a comment |

---

## Web App — Page Structure (Next.js)

| Route | Page | Auth Required |
|-------|------|:---:|
| `/` | Landing page / public session browser | No |
| `/login` | Sign-in form | No |
| `/register` | Sign-up form | No |
| `/sessions` | Browse public sessions | No |
| `/sessions/[id]` | Session detail (members, progress, discussion) | Join requires auth |
| `/sessions/new` | Create session form | Yes |
| `/profile` | Own profile / settings | Yes |
| `/profile/[username]` | Other member's profile | No |

### Key UI Components (React)

- **SessionCard** — Thumbnail card for session listing (title, book, member count, host)
- **BookForm** — Multi-input form: title, author, plus dynamic chapter name fields
- **ProgressBar** — Horizontal bar showing `chapters_completed / total_chapters`
- **MemberList** — List of members with avatar, name, and progress bar
- **CommentList** — Chronological flat list of comments
- **CommentItem** — Single comment with author, timestamp, body, and reaction bar
- **ReactionPicker** — Emoji picker popover attached to each comment
- **ReactionChip** — Single emoji + count displayed below a comment

---

## Mobile App — Considerations (React Native / Expo)

- Share the same Supabase client and database schema.
- Reuse API types and business logic where possible (consider a shared `packages/core` if using a monorepo).
- Offline support not required for v1.
- Native UI equivalents for all web components listed above.
- Navigation: React Navigation (stack + bottom tabs).

---

## Development Phases

### Phase 1: Foundation
1. Initialize Next.js project with TypeScript, Tailwind CSS
2. Set up Supabase project (local dev with `supabase cli`)
3. Run database migrations (schema above)
4. Implement Supabase Auth (email/password sign-up, sign-in, sign-out)
5. Profile auto-creation trigger (Edge Function or DB trigger)
6. Set up RLS policies

### Phase 2: Sessions
1. Create session form (book + chapter input)
2. Session listing (public sessions)
3. Session detail page
4. Join session functionality
5. Host: session status toggle

### Phase 3: Progress & Discussion
1. Progress logging UI + API
2. Member list with progress bars
3. Comment posting + listing
4. Emoji reaction system
5. Supabase Realtime subscriptions for live updates

### Phase 4: Polish & Mobile
1. Profile pages
2. Mobile app (React Native / Expo) — core screens
3. Responsive design audit
4. Error states, loading states, empty states
5. Accessibility pass

---

## Open Questions (to decide before implementation)

1. **Private session discovery** — Should private sessions have an invite code, or are they only accessible via direct link?
2. **Chapter input UX** — Should chapters be entered as a freeform list (one per line), or should there be an option to paste structured data / import from an API?
3. **Username format** — Allow spaces and special characters, or keep it simple (alphanumeric + underscore)?
4. **Comment length limit** — What's a reasonable max? (Suggested: 2000 characters for v1)
5. **Pagination** — How many sessions/comments per page? (Suggested: 20 sessions, 50 comments)
