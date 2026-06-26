import type { ProfileRow } from "../../hooks/useProfile";
import { Avatar } from "../ui/avatar";

interface ProfileCardProps {
  profile: Pick<ProfileRow, "username" | "display_name" | "avatar_url" | "created_at">;
  size?: "md" | "lg";
}

export function ProfileCard({ profile, size = "md" }: ProfileCardProps) {
  const displayName = profile.display_name ?? profile.username;
  const joinedDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const avatarSize = size === "lg" ? "lg" : "md";

  return (
    <div className="flex items-center gap-4">
      <Avatar
        avatarUrl={profile.avatar_url}
        username={profile.username}
        size={avatarSize}
      />
      <div className="min-w-0">
        <h2 className="font-bold text-neutral-900 dark:text-gray-100 truncate text-lg">
          {displayName}
        </h2>
        <p className="text-sm text-neutral-500 dark:text-gray-400">@{profile.username}</p>
        {joinedDate && (
          <p className="text-xs text-neutral-400 dark:text-gray-500 mt-0.5">
            Joined {joinedDate}
          </p>
        )}
      </div>
    </div>
  );
}
