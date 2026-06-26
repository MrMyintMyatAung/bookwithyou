import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useMySessions, useUpdateProfile } from "../../hooks/useProfile";
import { ProtectedRoute } from "../../components/auth/protected-route";
import { AvatarUpload } from "../../components/profile/avatar-upload";
import { STATUS_CLASSES } from "../../lib/constants";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Spinner } from "../../components/ui/spinner";
import { Bookshelf } from "../../components/profile/bookshelf";

function SessionLink({
  id,
  title,
  status,
}: {
  id: string;
  title: string;
  status: string;
}) {
  return (
    <li>
      <Link
        to={`/sessions/${id}`}
        className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-neutral-50 transition-colors group"
      >
        <span className="text-sm font-medium text-neutral-800 dark:text-gray-200 group-hover:text-primary-700 transition-colors truncate">
          {title}
        </span>
        <span
          className={`shrink-0 ml-2 inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_CLASSES[status] ?? STATUS_CLASSES.active}`}
        >
          {status}
        </span>
      </Link>
    </li>
  );
}

function OwnProfileContent() {
  const { profile } = useAuth();
  const { data: mySessions, isLoading: sessionsLoading } = useMySessions();
  const updateProfile = useUpdateProfile();

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [saveError, setSaveError] = useState("");

  if (!profile) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Spinner className="h-8 w-8 text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaveError("");

    updateProfile.mutate(
      { display_name: displayName.trim() || null },
      {
        onSuccess: () => setEditing(false),
        onError: (err) =>
          setSaveError(
            err instanceof Error ? err.message : "Failed to save."
          ),
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
      {/* Profile header */}
      <Card className="p-6 sm:p-8 mb-8">
        <AvatarUpload
          avatarUrl={profile.avatar_url}
          username={profile.username}
          displayName={displayName.trim() || profile.display_name}
        />

        {/* Edit display name */}
        {editing ? (
          <form onSubmit={handleSave} className="mt-6 pt-6 border-t border-neutral-100 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
              <div className="flex-1 w-full">
                <Input
                  label="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How your name appears"
                  maxLength={50}
                  disabled={updateProfile.isPending}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  loading={updateProfile.isPending}
                >
                  Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDisplayName(profile.display_name ?? "");
                    setEditing(false);
                  }}
                  disabled={updateProfile.isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
            {saveError && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2" role="alert">
                {saveError}
              </p>
            )}
          </form>
        ) : (
          <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-gray-800">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setDisplayName(profile.display_name ?? "");
                setEditing(true);
              }}
            >
              Edit Profile
            </Button>
          </div>
        )}
      </Card>

      {/* Personal bookshelf */}
      <div className="mb-8">
        <Bookshelf />
      </div>

      {/* My sessions */}
      <Card className="p-6 sm:p-8">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-gray-100 mb-6">
          My Sessions
        </h2>

        {sessionsLoading ? (
          <div className="space-y-2 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-neutral-100 dark:bg-gray-800 rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            {/* Hosting */}
            {mySessions?.hosted && mySessions.hosted.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-neutral-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Hosting ({mySessions.hosted.length})
                </h3>
                <ul className="divide-y divide-neutral-100 dark:divide-gray-800">
                  {mySessions.hosted.map((s: any) => (
                    <SessionLink
                      key={s.id}
                      id={s.id}
                      title={s.title}
                      status={s.status}
                    />
                  ))}
                </ul>
              </div>
            )}

            {/* Joined */}
            {mySessions?.joined && mySessions.joined.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-neutral-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Joined ({mySessions.joined.length})
                </h3>
                <ul className="divide-y divide-neutral-100 dark:divide-gray-800">
                  {mySessions.joined.map((s: any) => (
                    <SessionLink
                      key={s.id}
                      id={s.id}
                      title={s.title}
                      status={s.status}
                    />
                  ))}
                </ul>
              </div>
            )}

            {(!mySessions ||
              (mySessions.hosted.length === 0 &&
                mySessions.joined.length === 0)) && (
              <div className="text-center py-8">
                <div className="text-3xl mb-3">📖</div>
                <p className="text-sm text-neutral-500 dark:text-gray-400 mb-4">
                  You haven&apos;t joined any sessions yet.
                </p>
                <Link to="/sessions">
                  <Button variant="secondary" size="sm">
                    Browse Sessions
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Public profile link */}
      <div className="mt-6 text-center">
        <Link
          to={`/profile/${profile.username}`}
          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors"
        >
          View your public profile →
        </Link>
      </div>
    </div>
  );
}

export function OwnProfilePage() {
  return (
    <ProtectedRoute>
      <OwnProfileContent />
    </ProtectedRoute>
  );
}
