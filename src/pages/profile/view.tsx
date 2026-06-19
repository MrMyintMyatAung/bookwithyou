import { useParams, Link } from "react-router-dom";
import { useProfileByUsername } from "../../hooks/useProfile";
import { useAuth } from "../../hooks/useAuth";
import { ProfileCard } from "../../components/profile/profile-card";
import { STATUS_CLASSES } from "../../lib/constants";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export function MemberProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const {
    data: profileData,
    isLoading,
    isError,
    refetch,
  } = useProfileByUsername(username);

  const isOwnProfile =
    user != null &&
    profileData != null &&
    user.id === profileData.profile.id;

  // --- Loading ---
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-20 w-20 bg-neutral-200 rounded-full" />
            <div className="space-y-2">
              <div className="h-6 bg-neutral-200 rounded w-40" />
              <div className="h-4 bg-neutral-100 rounded w-24" />
            </div>
          </div>
          <div className="h-48 bg-neutral-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  // --- Error ---
  if (isError) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <Card className="p-12 text-center">
          <div className="text-4xl mb-3">😵</div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            Could not load this profile
          </h2>
          <p className="text-sm text-neutral-500 mb-4">Something went wrong.</p>
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  // --- Not found ---
  if (!profileData) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Reader not found
        </h2>
        <p className="text-neutral-500 mb-6">
          The reader @{username} doesn&apos;t exist or may have been removed.
        </p>
        <Link to="/sessions">
          <Button variant="secondary">Browse Sessions</Button>
        </Link>
      </div>
    );
  }

  const { profile, hostedSessions, joinedSessions } = profileData;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
      {/* Profile header */}
      <Card className="p-6 sm:p-8 mb-8">
        <ProfileCard
          profile={{
            username: profile.username,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            created_at: profile.created_at ?? "",
          }}
          size="lg"
        />

        {isOwnProfile && (
          <div className="mt-6 pt-6 border-t border-neutral-100">
            <Link to="/profile">
              <Button variant="secondary" size="sm">
                Edit Your Profile
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Sessions */}
      <Card className="p-6 sm:p-8">
        <h2 className="text-lg font-bold text-neutral-900 mb-6">
          Reading Sessions
        </h2>

        {/* Hosting */}
        {hostedSessions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              Hosting ({hostedSessions.length})
            </h3>
            <ul className="divide-y divide-neutral-100">
              {hostedSessions.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/sessions/${s.id}`}
                    className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-neutral-50 transition-colors group"
                  >
                    <span className="text-sm font-medium text-neutral-800 group-hover:text-primary-700 transition-colors truncate">
                      {s.title}
                    </span>
                    <span
                      className={`shrink-0 ml-2 inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_CLASSES[s.status] ?? STATUS_CLASSES.active}`}
                    >
                      {s.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Joined */}
        {joinedSessions.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              Reading ({joinedSessions.length})
            </h3>
            <ul className="divide-y divide-neutral-100">
              {joinedSessions.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/sessions/${s.id}`}
                    className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-neutral-50 transition-colors group"
                  >
                    <span className="text-sm font-medium text-neutral-800 group-hover:text-primary-700 transition-colors truncate">
                      {s.title}
                    </span>
                    <span
                      className={`shrink-0 ml-2 inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_CLASSES[s.status] ?? STATUS_CLASSES.active}`}
                    >
                      {s.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {hostedSessions.length === 0 && joinedSessions.length === 0 && (
          <div className="text-center py-8">
            <div className="text-3xl mb-3">📖</div>
            <p className="text-sm text-neutral-500">
              {isOwnProfile
                ? "You haven't joined any sessions yet."
                : `${profile.username} hasn't joined any public sessions yet.`}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
