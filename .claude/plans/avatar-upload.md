# Plan: Profile Avatar Upload

## Supabase prerequisite (already done)
- `avatars` bucket created (private, 5MB, images only)
- 4 storage RLS policies applied

## One Supabase change needed
- **Make `avatars` bucket public** — avatars are public data, always visible to everyone per SELECT policy. Public bucket lets us use `getPublicUrl()` instead of expiring signed URLs. Upload still requires auth via INSERT policy.

## Code changes

### New files (3)

1. **`src/lib/avatars.ts`** — `getAvatarUrl(path: string | null)` utility
   - Returns `supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl`
   - Returns `null` if path is null/empty
   - Provides `DEFAULT_AVATAR_URL` export (a generated SVG placeholder)

2. **`src/components/ui/avatar.tsx`** — Reusable `<Avatar>` component
   - Props: `avatarUrl`, `username`, `size` (`"sm" | "md" | "lg"`)
   - Renders `<img>` when `avatarUrl` is present
   - Falls back to initials circle when no image (current behavior)
   - Handles image load error → fallback to initials
   - Sizes: sm=8, md=10, lg=20 (in Tailwind units)
   - Used everywhere avatars appear

3. **`src/components/profile/avatar-upload.tsx`** — Upload widget
   - Shows current avatar (via `<Avatar>`) or initials
   - "Change Photo" button → hidden file input
   - Client-side validation (type: image/png/jpeg/webp/gif, size: ≤5MB)
   - Shows preview of selected file before upload
   - "Upload" button triggers the mutation
   - Loading/error/success states
   - Calls `useUpdateAvatar` mutation

### Modified files (4)

4. **`src/hooks/useProfile.ts`** — Add `useUpdateAvatar` mutation
   - Uploads file to `avatars/<user_id>/avatar.<ext>` with `{ upsert: true }`
   - On success, calls existing `useUpdateProfile` to set `avatar_url` to the path
   - Handles errors (file too large, wrong type, network failure)
   - Invalidates profile queries on success

5. **`src/components/profile/profile-card.tsx`** — Use `<Avatar>` instead of inline initials div
   - Replace the initials `<div>` with `<Avatar avatarUrl={...} username={...} size={...} />`

6. **`src/pages/profile/me.tsx`** — Add avatar upload to the profile editing flow
   - Add `<AvatarUpload>` widget above the display name edit section
   - Avatar changes are immediate (no separate "save" for the avatar)

7. **`src/components/sessions/comment-item.tsx`** — Use `<Avatar>` for comment author
   - Replace inline initials `<div>` with `<Avatar size="sm" />`

8. **`src/pages/sessions/detail.tsx`** — Use `<Avatar>` in member list
   - Replace inline initials `<div>` with `<Avatar size="sm" />`
