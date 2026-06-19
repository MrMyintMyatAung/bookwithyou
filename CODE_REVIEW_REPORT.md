# Code Quality Review Report — BooksWithYou

**Date:** 2026-06-19  
**Review scope:** All 46 source files + database migration  
**Framework:** React 19, TypeScript 5.9, Vite 7, Supabase, TanStack Query, Tailwind CSS 4

---

## Summary

The codebase demonstrates strong fundamentals: comprehensive loading/empty/error state handling across all components, clean UI component architecture with `forwardRef` and `displayName`, thoughtful accessibility (ARIA attributes, skip links, role attributes), and well-structured Supabase queries. The RLS policies in the migration are thorough and follow the principle of least privilege for most tables.

However, several critical security and correctness issues were found: the **books RLS policy was overly permissive** (any authenticated user could read any book including those from private sessions), the **session creation flow lacked transaction-like cleanup** on partial failure, the **register form attributed Supabase auth errors to the wrong field**, and the **Supabase client was missing `detectSessionInUrl`** which would silently break password reset flows.

All critical and warning-level issues have been fixed directly in the source files. Below is the complete catalog of findings and applied fixes.

---

## 🔴 Critical Issues (Fixed)

### 1. Books RLS: Private session books visible to all authenticated users
**File:** `supabase/migrations/20260619000000_initial_schema.sql` (lines 140-143)

**Problem:** The original RLS policy for books allowed *any* authenticated user to read *any* book:
```sql
CREATE POLICY "Books are viewable by authenticated users"
  ON books FOR SELECT TO authenticated USING (true);
```
This meant a book's title, author, and chapter list from a private reading session was visible to every authenticated user in the system, even if they were not a member of that session. This violates the data isolation promised by the private session feature.

**Fix applied:** Replaced with two policies:
- `"Books from public sessions are viewable by everyone"` — allows anyone to read books linked to sessions with `visibility = 'public'`.
- `"Books from private sessions are viewable by members"` — restricts books from private sessions to only members of that session, via a JOIN through `memberships`.

### 2. Session creation: Orphaned books and sessions on partial failure
**File:** `src/hooks/useSessions.ts`, `useCreateSession` mutation (lines 166-209)

**Problem:** The three-step creation (insert book -> insert session -> insert membership) had no cleanup if step 2 or 3 failed. If the book and session were created but the auto-join membership insert failed (e.g., unique constraint violation), the database would contain an orphaned session with no members — including the host — rendering it inaccessible. There is no Supabase JS client transaction support.

**Fix applied:** Added cleanup logic:
- Session insert failure: deletes the orphaned book before re-throwing.
- Membership insert failure: deletes both the session and book (best-effort cleanup with console.error logging) before throwing a user-friendly error.

### 3. Supabase client missing `detectSessionInUrl` and PKCE flow
**File:** `src/lib/supabase.ts` (lines 13-18)

**Problem:** The Supabase client was initialized without `detectSessionInUrl: true` and without specifying `flowType: "pkce"`. This means:
- Password reset magic links would not be detected when the user clicks the reset link and returns to the app. The `reset-password` page explicitly calls `supabase.auth.getSession()` to check for a recovery session, but without `detectSessionInUrl`, the hash fragment with the recovery token would be ignored.
- Without PKCE flow, the auth code exchange is less secure against authorization code interception attacks.

**Fix applied:** Added `detectSessionInUrl: true` and `flowType: "pkce"` to the client configuration.

### 4. Register form: Ambiguous error field attribution
**File:** `src/components/auth/register-form.tsx` (lines 76-78)

**Problem:** The form checked Supabase error messages for `"already registered"` or `"unique"` and assumed this meant the *username* was taken. However, Supabase's `signUp` returns `"User already registered"` when the *email* is already in use (the `auth.users` table has a unique email constraint). The username uniqueness is enforced by the `profiles` table trigger. This meant users would see "This username may already be taken" when actually their email was the problem.

**Fix applied:** Changed the error field mapping to set `fieldErrors.email` instead of `fieldErrors.username`, with the message "An account with this email already exists." Also added an `email` key to the `fieldErrors` state and wired it to the Email `Input` component's `error` prop.

### 5. useAuth: Race condition and stale closure on profile fetch
**File:** `src/hooks/useAuth.tsx` (lines 52-76)

**Problem:** The `onAuthStateChange` callback performed an async `fetchProfile` call without guarding against out-of-order responses. If auth state changed rapidly (e.g., sign-out followed immediately by sign-in), a slower profile fetch for the stale user could resolve after the newer user's fetch, overwriting the profile state with the wrong user's data. Additionally, the cleanup function only unsubscribed from auth changes but did not cancel in-flight profile fetches.

**Fix applied:**
- Added a `cancelled` flag that prevents state updates after unmount.
- Added a `currentUserIdRef` to track the latest requested user ID, and only apply profile data if the fetched profile matches the current user.
- Changed `fetchProfile` to use `.maybeSingle()` instead of `.single()` to avoid throwing on "no rows" (handles the edge case where the profile trigger hasn't fired yet).
- Changed `fetchProfile` to select explicit columns instead of `*`.

### 6. useSessions: No pagination on public sessions listing
**File:** `src/hooks/useSessions.ts`, `usePublicSessions` query (line 76-98)

**Problem:** The query fetched all public sessions without any limit. As the application grows, this could return hundreds of rows, degrading performance and bandwidth. The SPEC.md specifies a suggested pagination of 20 sessions.

**Fix applied:** Added `.limit(SESSIONS_PAGE_SIZE)` (exported constant, set to 20) to the query. Also changed `useSession` to use `.maybeSingle()` instead of `.single()` to gracefully handle deleted/non-existent sessions without throwing, and added `retry: false` to prevent unnecessary retries on 406/PGRST116 errors.

### 7. Comment form: IME composition breaks Enter-to-submit
**File:** `src/components/sessions/comment-list.tsx` (lines 44-49)

**Problem:** The `onKeyDown` handler submitted the comment when the user pressed Enter without Shift. However, for IME users (Japanese, Chinese, Korean, etc.), pressing Enter during character composition (to confirm the composed character) would also trigger form submission. This would cut off the user mid-composition.

**Fix applied:** Added `onCompositionStart`/`onCompositionEnd` handlers that track the IME composition state via a `useRef`. The Enter handler now checks `isComposingRef.current` before submitting. Also added a `MAX_COMMENT_LENGTH` constant (2000 characters, as specified in SPEC.md) with `maxLength` attribute and an over-limit visual indicator.

---

## 🟡 Warnings (Fixed)

### 8. NavBar mobile menu: No outside-click or Escape key dismissal
**File:** `src/components/layout/nav-bar.tsx`

**Problem:** The mobile hamburger menu could only be closed by clicking a navigation link. If a user opened the menu and then tapped outside it or pressed Escape, the menu stayed open, creating a confusing UX and potential accessibility issue.

**Fix applied:** Added `useEffect` hooks that listen for `mousedown` outside the menu container (via `menuRef`) and `keydown` Escape events, closing the menu in both cases. Added `useRef` for the menu container.

### 9. Duplicated `statusClasses` across 4 components
**Files:** `src/components/sessions/session-card.tsx`, `src/pages/sessions/detail.tsx`, `src/pages/profile/me.tsx`, `src/pages/profile/view.tsx`

**Problem:** The same `statusClasses` record (mapping `active`, `paused`, `completed` to Tailwind classes) was copy-pasted across 4 files. Similarly, `statusCycle` and `statusLabel` were duplicated between session-card and session detail. This violates DRY and makes it easy for the status styling to drift out of sync.

**Fix applied:** Created `src/lib/constants.ts` exporting `STATUS_CLASSES`, `STATUS_CYCLE`, and `STATUS_LABEL`. Updated all 4 components to import from this shared module.

### 10. Realtime subscriptions active for unauthenticated visitors
**File:** `src/pages/sessions/detail.tsx` (lines 50-52)

**Problem:** All three realtime hooks (`useProgressRealtime`, `useCommentsRealtime`, `useReactionsRealtime`) were unconditionally subscribed, including for visitors who are not authenticated. Unauthenticated users cannot see comments, progress, or reactions (per RLS policies), so these subscriptions are wasted connections that consume Supabase Realtime quota without delivering any useful data.

**Fix applied:** Realtime hooks are now only activated when the user is authenticated (`uid ? id : undefined`), preventing subscriptions for visitors.

### 11. useProfile: Sequential queries instead of parallel
**File:** `src/hooks/useProfile.ts`, `useProfileByUsername` and `useMySessions`

**Problem:** Both functions fetched hosted sessions and joined sessions (via memberships) sequentially — waiting for the first query to complete before starting the second. These queries are independent of each other (they only depend on the profile/user ID, which is already known).

**Fix applied:** Wrapped the two queries in `Promise.all()` for both `useProfileByUsername` and `useMySessions`, reducing total fetch time by approximately half on the happy path.

### 12. Comment deletion: Multiple ESC listeners if multiple comments in confirm state
**File:** `src/components/sessions/comment-item.tsx` (lines 49-56)

**Problem:** The ESC keydown handler was defined inline in the `useEffect`, creating a new function reference each time `confirming` changed. If a user clicked delete on comment A, then delete on comment B before canceling comment A, two separate ESC listeners would be registered. While the behavior would still work (both listeners call `setConfirming(false)`), it's a resource leak pattern that could grow with many comments.

**Fix applied:** Wrapped the handler in `useCallback` with an empty dependency array, ensuring the same function reference is used for add/remove, preventing duplicate registrations.

### 13. Comment body length: No server-side or client-side enforcement
**File:** `src/components/sessions/comment-list.tsx`

**Problem:** There was no limit on comment body length. The SPEC.md suggests 2000 characters, but neither the database column (`TEXT`) nor the client enforced this. A malicious user could submit arbitrarily large comments.

**Fix applied:** Added `MAX_COMMENT_LENGTH = 2000` with `maxLength` attribute on the textarea, a character counter showing remaining/allowed characters, and visual warning when over the limit. The Post button is disabled when over the limit. Note: a database `CHECK` constraint or Edge Function validation would provide a server-side safety net and should be added as a follow-up.

### 14. Progress update: No client-side validation of chapter bounds
**File:** `src/hooks/useProgress.ts`, `useUpdateProgress`

**Problem:** The mutation accepted any `chaptersCompleted` value and upserted it directly. A bug in the UI or a direct API call could set `chapters_completed` to a negative number or a value exceeding `total_chapters`. The database column has no `CHECK` constraint for this.

**Fix applied:** Added client-side validation: throws if `chaptersCompleted < 0` or if `totalChapters` is provided and `chaptersCompleted > totalChapters`. The `ProgressLog` component was updated to pass `totalChapters` to the mutation. Updated the error display to show the specific error message rather than a generic "Failed to save" message.

---

## 🟢 Suggestions (Not applied — for consideration)

### 15. React 19 ref handling: `forwardRef` no longer needed
**Files:** `src/components/ui/input.tsx`, `src/components/ui/button.tsx`, `src/components/ui/card.tsx`

React 19 made `ref` a regular prop, so `forwardRef` is no longer necessary. These components could be simplified by removing the `forwardRef` wrapper and accepting `ref` as a regular prop. This is purely cosmetic given the current React version, but would modernize the code.

### 16. No error boundary for the application
**File:** `src/App.tsx`

There is no React error boundary wrapping the route tree. If a page component throws during render, the entire application crashes to a blank white screen. Consider adding an error boundary component at the route level that shows a fallback UI with a "retry" option.

### 17. Missing `updated_at` auto-update trigger for comments
**File:** `supabase/migrations/20260619000000_initial_schema.sql` (table `comments`)

The `comments` table has an `updated_at` column, and the UI shows "(edited)" when `updated_at` differs from `created_at`. However, there is no database trigger to automatically set `updated_at` when a comment is updated. The v1 spec says comments cannot be edited (only hard-deleted), so this column is unused in v1. If comment editing is added in the future, add:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 18. NavBar mobile menu: Focus lock not implemented
The mobile menu, when open, does not trap focus within it. A keyboard user could tab out of the menu into the (visually hidden behind the menu) page content. Consider implementing a focus trap pattern for the open mobile menu.

### 19. `as unknown as` type assertions on Supabase nested joins
**Files:** `src/hooks/useSessions.ts`, `src/hooks/useComments.ts`, `src/hooks/useProgress.ts`

Several queries use `as unknown as SomeType[]` to cast Supabase's nested join results. While this works at runtime, it bypasses TypeScript's type checking. A more robust approach would be to define explicit mapping functions that validate the shape at runtime. This is a code hygiene concern, not a bug.

### 20. Missing `reactions` index on `(comment_id, emoji)`
**File:** `supabase/migrations/20260619000000_initial_schema.sql`

The reactions summary query (in `useSessionComments`) groups reactions by `comment_id` and `emoji`. An index on `reactions(comment_id, emoji)` would optimize this aggregation. Currently only `idx_reactions_comment` on `(comment_id)` exists.

### 21. `useUpdateSessionStatus` lacks client-side host check
**File:** `src/hooks/useSessions.ts`

The mutation does not verify the caller is the host. While the database RLS policy (`"Host can update session status"`) prevents unauthorized updates at the database level, a client-side guard would provide a better UX by showing an immediate error rather than a cryptic database error. The session detail page already conditionally renders the button only for hosts, so this is a defense-in-depth concern.

### 22. Private sessions: No join-code or invitation mechanism
Per the SPEC.md open questions, private session discovery is TBD. The current implementation requires a direct link to join a private session, but there is no UI for generating or entering an invite code. This is a feature gap, not a bug.

---

## ✅ Positive Findings

1. **Comprehensive state handling:** Every data-fetching component renders distinct loading, error, empty, and populated states. The skeleton loaders (`SessionCardSkeleton`, comment skeletons, member skeletons) provide excellent perceived performance.

2. **Accessibility attention:** The `SkipLink` component, proper `aria-label`/`aria-expanded`/`aria-invalid`/`aria-describedby` attributes, `role="alert"` on error messages, `role="alertdialog"` on delete confirmation, and semantic HTML structure are all well-implemented.

3. **RLS policy design:** The migration's RLS policies (post-fix) are correctly structured. Each table has distinct policies for SELECT, INSERT, UPDATE, DELETE with appropriate `USING` and `WITH CHECK` clauses. The cascading checks (e.g., reaction policies checking membership via comments -> sessions) are correctly implemented.

4. **Clean component architecture:** The separation of UI primitives (`input`, `button`, `card`, `spinner`), feature components (`session-card`, `comment-item`, `progress-bar`), and page components follows good composition patterns. The `cn()` utility follows the established Tailwind className merging pattern.

5. **Optimistic cache invalidation:** TanStack Query's `invalidateQueries` is used correctly after mutations, ensuring the UI stays consistent. Realtime subscriptions further enhance liveness by invalidating caches on external changes.

6. **TypeScript types:** The `Database` type from Supabase is properly used throughout with convenience aliases (`SessionVisibility`, `SessionStatus`, `ProfileBrief`, `CommentWithAuthor`). No `any` usage in exported interfaces.

7. **Security-first Supabase config:** Environment variables are validated at import time with a clear error message. The `SECURITY DEFINER` trigger function uses `SET search_path = ''` to prevent search path injection.

8. **Relative time formatting:** The `relativeTime()` helper in `comment-item.tsx` provides a good user experience for timestamps without pulling in a heavy date library.

9. **Proper realtime cleanup:** All realtime subscriptions use `useEffect` cleanup functions to call `supabase.removeChannel()`, preventing memory leaks on unmount or session ID changes.

10. **Input sanitization:** The `parseChapters()` function in the create session form trims whitespace and filters empty lines, preventing blank chapter entries in the database.

---

## Files Modified (Fix Applied)

| File | Changes |
|------|---------|
| `src/lib/supabase.ts` | Added `detectSessionInUrl: true` and `flowType: "pkce"` |
| `supabase/migrations/20260619000000_initial_schema.sql` | Split book RLS policy into public/private; only members can read private session books |
| `src/hooks/useAuth.tsx` | Added cancellation guard, `currentUserIdRef` for stale closure prevention, explicit column select, `maybeSingle` |
| `src/hooks/useSessions.ts` | Orphan cleanup in `useCreateSession`; `.limit(20)` on public sessions; `.maybeSingle()` for not-found; exported `SESSIONS_PAGE_SIZE` |
| `src/hooks/useProfile.ts` | Parallelized hosted/joined session queries with `Promise.all` |
| `src/hooks/useProgress.ts` | Client-side validation of chapter bounds; `totalChapters` parameter |
| `src/components/auth/register-form.tsx` | Corrected error-to-field mapping (email vs username); added `email` field error support |
| `src/components/sessions/comment-list.tsx` | IME composition guard; `MAX_COMMENT_LENGTH` enforcement; over-limit indicator |
| `src/components/sessions/comment-item.tsx` | `useCallback` for ESC handler to prevent listener leaks |
| `src/components/sessions/progress-log.tsx` | Passes `totalChapters` for validation; specific error message display |
| `src/components/layout/nav-bar.tsx` | Outside-click and Escape key dismiss for mobile menu |
| `src/pages/sessions/detail.tsx` | Conditional realtime (auth-only); imports shared constants |
| `src/components/sessions/session-card.tsx` | Imports shared `STATUS_CLASSES` |
| `src/pages/profile/me.tsx` | Imports shared `STATUS_CLASSES` |
| `src/pages/profile/view.tsx` | Imports shared `STATUS_CLASSES` |
| `src/lib/constants.ts` | **New file:** Shared `STATUS_CLASSES`, `STATUS_CYCLE`, `STATUS_LABEL` |\n| `vite.config.ts` | Added `resolve.alias` for `@/` path matching tsconfig.json |

---

## 🔴 Post-Review Critical Fix: Private Session Creation Broken (2026-06-19)

### Issue: RLS SELECT policy blocks host from reading their own private session during creation

**File:** `supabase/migrations/20260619000000_initial_schema.sql` (sessions RLS policies)
**Affected code:** `src/hooks/useSessions.ts`, `useCreateSession` mutation (lines 188-198)

**Root cause:** The `useCreateSession` mutation runs three steps:
1. INSERT book → `.select().single()`
2. INSERT session → `.select().single()` ← **FAILS here for private sessions**
3. INSERT membership (host auto-joins)

PostgREST implements `.insert().select().single()` as a CTE where the outer SELECT is subject to RLS. At step 2, the session is `private` but the host is **not yet a member** (that's step 3). The SELECT RLS policy `"Private sessions are viewable by members"` requires a membership row that doesn't exist yet → 0 rows → `.single()` throws `PGRST116`.

Public sessions worked fine because `"Public sessions are viewable by everyone"` has no membership check.

**Fix applied:** Added a new RLS policy:
```sql
CREATE POLICY "Host can view own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (host_id = (select auth.uid()));
```
This allows the host to SELECT their own session immediately after insertion, regardless of membership status. The policy makes semantic sense: a host should always be able to view sessions they created. It also hardens `useUpdateSessionStatus` (which also uses `.select().single()` after update) against edge cases where the host's membership might have been removed.

**Applied via:** Migration `add_host_view_own_sessions_policy` to live Supabase database + migration file update.

---

## Recommended Follow-Up (Not in scope of this review)

1. **Add an Edge Function** to validate chapter count on progress updates at the server level (as mentioned in SPEC.md).
2. **Add DB-level validation**: `CHECK (chapters_completed >= 0)` on the `progress` table.
3. **Implement pagination** for comments (SPEC.md suggests 50 per page).
4. **Add an Error Boundary** component at the route level.
5. **Consider cookie-based auth** instead of localStorage (`persistSession: true` stores the JWT in localStorage, which is vulnerable to XSS). Supabase supports custom storage adapters.
6. **Add `vite-env.d.ts`** if not already present (referenced in `tsconfig.json` includes).
