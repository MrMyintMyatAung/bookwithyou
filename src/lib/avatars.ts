import { supabase } from "./supabase";

/**
 * Returns a permanent public URL for an avatar path stored in the avatars bucket.
 * Paths are stored as `<user_id>/avatar.<ext>` in the `profiles.avatar_url` column.
 * Returns null if the path is null, undefined, or empty.
 */
export function getAvatarUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(path);

  return data.publicUrl;
}

/** File extensions we accept for avatar uploads. */
export const ALLOWED_AVATAR_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

/** Maximum avatar file size in bytes (5 MB). */
export const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

/** Maps a MIME type to a file extension for storage paths. */
export function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[mime] ?? "jpg";
}
