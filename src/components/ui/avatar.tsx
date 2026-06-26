import { useState } from "react";
import { getAvatarUrl } from "../../lib/avatars";

type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  avatarUrl: string | null | undefined;
  username: string | null | undefined;
  size?: AvatarSize;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-20 w-20 text-2xl",
};

export function Avatar({ avatarUrl, username, size = "md" }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initial = (username ?? "?")[0].toUpperCase();
  const url = getAvatarUrl(avatarUrl);

  if (url && !imgError) {
    return (
      <img
        src={url}
        alt={`${username ?? "User"}'s avatar`}
        className={`${sizeClasses[size]} rounded-full object-cover shrink-0 ring-1 ring-slate-200`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-coral-100 text-coral-600 border border-coral-200 flex items-center justify-center font-bold shrink-0`}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}
