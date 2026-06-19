# Phase 4 Implementation Plan — Polish, Profiles & Accessibility

## What We're Building

Phase 4 rounds out the MVP with profile pages, password reset, accessibility improvements, and responsive fixes. The mobile app (React Native/Expo) is deferred — it's a separate project.

---

## Part A: Profile Pages

### New files

**`src/hooks/useProfile.ts`** — queries + mutation for profile operations:
- `useProfileByUsername(username)` — fetch a profile by username via React Query
- `useUpdateProfile()` — mutation: update display_name, avatar_url for current user
- Uses the existing `profiles` table (RLS already allows users to update own profile)

**`src/pages/profile/me.tsx`** — Own profile page at `/profile`:
- `<ProtectedRoute>` wrapped
- Shows: avatar initial circle (large), username, display name, joined date
- Edit form: display_name text input, save button
- List of sessions you've joined (fetched via memberships + sessions join)
- List of sessions you've hosted
- Link to "View public profile" (`/profile/:username`)
- **States:** loading (skeleton), error, populated, saving (edit form spinner)

**`src/pages/profile/view.tsx`** — Other member's profile at `/profile/:username`:
- Public (no auth required)
- Shows: avatar initial circle, username, display name
- List of public sessions they're a member of
- "Sessions in common" highlight if the viewer is authenticated and shares sessions
- **States:** loading, not found (username doesn't exist), populated, error

**`src/components/profile/profile-card.tsx`** — Shared profile display:
- Avatar circle (initial), username, display name
- Join date formatted
- Used on both own and other's profile pages

---

## Part B: Password Reset

### New files

**`src/pages/auth/forgot-password.tsx`** — Forgot password page at `/forgot-password`:
- Email input + submit button
- Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })`
- **States:** default, submitting, success ("Check your email!" message), error
- Links back to login

**`src/pages/auth/reset-password.tsx`** — Reset password page at `/reset-password`:
- New password input + confirm password input
- Calls `supabase.auth.updateUser({ password })`
- **States:** default, token invalid/expired, submitting, success (redirect to home), error
- Validates password strength before submit

### Modified files

**`src/components/auth/login-form.tsx`** — Add "Forgot password?" link below password field

**`src/App.tsx`** — Add routes: `/forgot-password`, `/reset-password`

---

## Part C: Accessibility & Polish Pass

### New UI primitive

**`src/components/ui/skip-link.tsx`** — Skip to main content link:
- Visually hidden, becomes visible on focus
- First focusable element on the page
- Links to `#main-content`

### Modifications across existing files

**`src/components/layout/root-layout.tsx`**:
- Add `<SkipLink />` as first child
- Add `id="main-content"` to the `<main>` element

**`src/components/ui/button.tsx`**:
- Add `aria-busy="true"` when loading
- Add `aria-label` prop passthrough

**`src/components/ui/input.tsx`**:
- Ensure `aria-describedby` references helper text as well as error text
- Add optional `hint` prop for helper text below input

**`src/components/layout/nav-bar.tsx`**:
- Add `<nav>` landmark role (already wrapped in `<nav>`)
- Add `aria-current="page"` to active nav link
- Username in nav links to `/profile` (clickable!)

**`src/pages/home.tsx`**:
- Add proper heading hierarchy (h1 → h2 → h3)
- Add `aria-label` to "How it works" section

**`src/pages/sessions/index.tsx`**:
- Add `aria-label` to the sessions grid
- Ensure "Start a Session" button has clear accessible text

**`src/pages/sessions/detail.tsx`**:
- Add `aria-label` to member list
- Add `aria-live="polite"` region for status changes
- Label progress bars with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`

**`src/components/sessions/progress-bar.tsx`**:
- Add `role="progressbar"` and aria attributes

**`src/components/sessions/reaction-chip.tsx`**:
- Improve `aria-label` to be more descriptive

**`src/components/sessions/comment-list.tsx`**:
- Add `aria-label` to the comment textarea
- Add character count live region

**`src/components/sessions/create-session-form.tsx`**:
- Visibility toggle buttons need `aria-pressed` state

### Responsive fixes

- **Session detail page**: Chapter list at 2 columns on mobile → 1 column below `sm` breakpoint
- **Progress log**: Stack vertically on very small screens (< 400px)
- **Member list**: Ensure progress bars don't overflow on narrow screens
- **Comment form**: Ensure the textarea + button layout works at 320px
- **Nav bar**: Verify hamburger menu closes when navigating, ensure touch targets ≥ 44px
- **Home page**: Hero text sizing on very small screens — use `text-3xl` instead of `text-4xl` below 400px
- **Session cards grid**: Already responsive (1-2-3), verify no overflow issues

### Focus management

- After navigation, move focus to `#main-content` (via SkipLink pattern)
- After comment post, focus returns to textarea
- After comment delete, focus moves to previous comment or textarea
- Modal/confirmation dialogs trap focus (comment delete confirm uses `window.confirm` — switch to inline confirmation for a11y)

---

## Part D: Supabase Auth Settings

One manual step in the Supabase dashboard:
1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to `http://localhost:5173` (or your production URL)
3. Add `http://localhost:5173/reset-password` to **Redirect URLs**
4. This enables the password reset flow to redirect users back to the app

---

## Routes Summary (after Phase 4)

| Route | Page | Auth | New? |
|-------|------|------|------|
| `/` | HomePage | No | |
| `/login` | LoginPage | No | + forgot password link |
| `/register` | RegisterPage | No | |
| `/forgot-password` | ForgotPasswordPage | No | NEW |
| `/reset-password` | ResetPasswordPage | No* | NEW |
| `/sessions` | SessionListPage | No | |
| `/sessions/new` | CreateSessionPage | Yes | |
| `/sessions/:id` | SessionDetailPage | No | |
| `/profile` | OwnProfilePage | Yes | NEW |
| `/profile/:username` | MemberProfilePage | No | NEW |
| `*` | NotFoundPage | No | |

\* Reset password page uses the recovery token from the email link — no explicit auth required, but the token must be valid.

---

## Implementation Order

1. **Hook:** `useProfile.ts` — query + update mutation
2. **Component:** `profile-card.tsx`
3. **Page:** `OwnProfilePage` (`/profile`)
4. **Page:** `MemberProfilePage` (`/profile/:username`)
5. **Page:** `ForgotPasswordPage` (`/forgot-password`)
6. **Page:** `ResetPasswordPage` (`/reset-password`)
7. **Integration:** Update `App.tsx` routes, update `LoginForm` with forgot password link, update `NavBar` with profile link
8. **Accessibility:** `SkipLink` component, aria improvements on all components, focus management
9. **Responsive:** Fix layout issues at mobile breakpoints
10. **Build:** Verify everything compiles
