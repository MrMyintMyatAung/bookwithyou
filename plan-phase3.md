# Phase 3 Implementation Plan — Progress & Discussion

## What We're Building

Phase 3 adds three things to the session detail page:

1. **Progress tracking** — members log chapters completed, progress bar shows percentage
2. **Comments** — flat chronological discussion thread per session
3. **Emoji reactions** — toggle emojis on any comment

All three use Supabase Realtime for live updates (tables already subscribed via migration).

---

## Architecture (consistent with Phase 1-2)

- **Data fetching:** `@tanstack/react-query` hooks → Supabase client directly
- **Realtime:** `supabase.channel()` subscriptions that invalidate React Query cache on changes
- **Auth:** All mutations use `useAuth()` to get current user
- **Styling:** Tailwind v4, existing amber primitives, Inter font

---

## New Files

### `src/hooks/useProgress.ts`

Queries + mutations for per-member reading progress:

- `useSessionProgress(sessionId)` — fetch all progress rows for a session, joined with member profiles
- `useMyProgress(sessionId)` — fetch the current user's progress row for this session
- `useUpdateProgress()` — upsert mutation: insert if no row exists, update if it does; validates chapters ≤ total
- `useProgressRealtime(sessionId)` — subscribe to progress changes, invalidate query

### `src/hooks/useComments.ts`

Queries + mutations for the discussion thread:

- `useSessionComments(sessionId)` — fetch all comments for a session, ordered by `created_at` asc, joined with author profile
- `useCreateComment()` — mutation: insert a comment
- `useDeleteComment()` — mutation: delete own comment by id
- `useCommentsRealtime(sessionId)` — subscribe to comment inserts/deletes, invalidate query

### `src/hooks/useReactions.ts`

Queries + mutations for emoji reactions:

- `useCommentReactions(commentIds: string[])` — fetch all reactions for a set of comment IDs
- `useToggleReaction()` — mutation: insert if not exists, delete if exists (toggle)
- `useReactionsRealtime(sessionId)` — subscribe to reaction changes, invalidate query

### `src/components/sessions/progress-bar.tsx`

Visual progress bar:
- **Props:** `chaptersCompleted: number`, `totalChapters: number`, `size?: "sm" | "md"`
- **States:** 0% (empty, subtle), partial (amber fill), 100% (emerald fill with checkmark)
- Shows percentage text inside/alongside the bar
- Rounded, smooth height transition

### `src/components/sessions/progress-log.tsx`

Inline control for a member to log their own progress:
- Shows current progress (e.g. "3 of 12 chapters")
- Input: number input or +/- buttons to increment/decrement chapters completed
- **States:** default, saving (spinner), error (inline message)
- Only rendered for the current user (not other members)
- Validates against total_chapters (can't exceed)

### `src/components/sessions/comment-list.tsx`

Flat chronological comment thread:
- Renders `CommentItem` for each comment
- **Empty state:** "No comments yet. Start the discussion!"
- **Loading:** 3 skeleton comment items
- New comments animate in (fade from top)
- Scrolls to bottom on new comment (or "new comment" pill if scrolled up)

### `src/components/sessions/comment-item.tsx`

Single comment card:
- Author avatar (initial circle), username, relative time ("2m ago", "3h ago")
- Comment body (text, respecting line breaks)
- Delete button (visible only to author) — with confirmation
- Reaction bar below — list of `ReactionChip` components + add reaction button
- **States:** default, deleting (fade out), deleted-removed
- Relative time updated periodically

### `src/components/sessions/reaction-picker.tsx`

Small emoji picker popover:
- Shows common emojis: 👍 👎 ❤️ 😂 😮 😢 😡 🎉 🚀 📚
- Opens on click of "+" button next to reaction chips
- Click emoji → toggle reaction → close picker
- **States:** closed, open, toggling (brief spinner on clicked emoji)

### `src/components/sessions/reaction-chip.tsx`

Single reaction display under a comment:
- **Props:** `emoji: string`, `count: number`, `active: boolean` (current user has this reaction)
- Small pill: emoji + count
- Active state: primary border/background to indicate user has this reaction
- Clickable — toggles that reaction for the current user

---

## Modified Files

### `src/pages/sessions/detail.tsx`

Major rework — replace the discussion placeholder and enhance member list:

- **Member list section** — add `ProgressBar` next to each member's name; add `ProgressLog` for the current user
- **Discussion section** — replace placeholder with `CommentList` + new comment input form
- **New comment form** — textarea + submit button at top of discussion, only visible to members
- **Realtime** — subscribe to progress/comments/reactions changes via the new realtime hooks

---

## Data Flow

### Progress logging
```
User clicks "+" or sets number → optimistic update via React Query mutation
  → supabase.from('progress').upsert({session_id, member_id, chapters_completed})
  → broadcast via Realtime → other members see progress update
  → invalidate queries → UI re-renders
```

### Comment posting
```
User types comment → click "Post"
  → supabase.from('comments').insert({session_id, author_id, body})
  → broadcast via Realtime → all members see new comment
  → local comment list updates immediately
```

### Reaction toggle
```
User clicks emoji on ReactionPicker or ReactionChip
  → check if reaction exists
  → if yes: DELETE reaction
  → if no: INSERT reaction
  → broadcast via Realtime → all members see updated reaction counts
```

### Realtime (shared pattern)
Each realtime hook:
1. Creates a Supabase channel filtered to the session
2. Listens for INSERT/UPDATE/DELETE events on its table
3. Invalidates the relevant React Query key on each event
4. Cleans up on unmount (React Query `onUnmount`)

---

## Component States Checklist

### ProgressBar
- **0%:** Thin neutral bar, "0 of 12" label
- **Partial:** Amber fill proportional to completion
- **100%:** Emerald fill, checkmark icon, subtle glow

### ProgressLog
- **Default:** Current chapters read with +/- stepper buttons
- **Saving:** Input disabled, spinner on save button
- **Error:** Inline error text (e.g. "Must be between 0 and 12")
- **Edge case:** Number exceeds total_chapters — clamp with warning

### CommentList
- **Loading:** 3 skeleton cards with pulsing avatars + lines
- **Empty:** "No comments yet. Start the discussion!" with chat bubble emoji
- **Populated:** Chronological list, oldest at top
- **Realtime receive:** New comment slides in at bottom

### CommentItem
- **Default:** Avatar, username, time, body text
- **Author view:** Delete button (trash icon) appears on hover
- **Deleting:** Fade out animation, then removed
- **Reaction bar:** Chips displayed below body, "+" button at end

### ReactionPicker
- **Closed:** Just the "+" button
- **Open:** Grid of emoji buttons, click outside to close
- **Toggling:** Clicked emoji briefly shows spinner

### ReactionChip
- **Default:** `emoji count` pill, neutral styling
- **Active (user has this reaction):** Primary-50 background, primary-600 border, cursor indicates toggle-off
- **Inactive:** Hoverable, cursor indicates toggle-on

### New comment form
- **Default:** Textarea with placeholder "Share your thoughts...", Post button
- **Typing:** Post button primary
- **Submitting:** Button disabled + spinner, textarea disabled
- **Error:** Inline error above form
- **Empty submit:** Button disabled (guard against empty comments)

---

## Not Yet (Phase 4)
- Profile pages
- Password reset custom UI
- Comment edit history
- Progress history tracking

---

## Implementation Order

1. **Hook:** `useProgress.ts` — queries + mutation + realtime
2. **Component:** `ProgressBar`
3. **Component:** `ProgressLog`
4. **Hook:** `useComments.ts` — query + create + delete + realtime
5. **Hook:** `useReactions.ts` — query + toggle + realtime
6. **Component:** `ReactionChip`
7. **Component:** `ReactionPicker`
8. **Component:** `CommentItem`
9. **Component:** `CommentList`
10. **Integration:** Update `SessionDetailPage` — progress bars in member list, progress log, discussion with new comment form
11. **Verify:** Build check
