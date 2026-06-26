import { Link } from "react-router-dom";
import { usePublicSessions } from "../../hooks/useSessions";
import { useAuth } from "../../hooks/useAuth";
import { SessionCard, SessionCardSkeleton } from "../../components/sessions/session-card";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

export function SessionListPage() {
  const { data: sessions, isLoading, isError, refetch } = usePublicSessions();
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-gray-100">
            Reading Sessions
          </h1>
          <p className="mt-2 text-slate-500 dark:text-gray-400">
            Browse public sessions or start your own.
          </p>
        </div>
        {isAuthenticated && (
          <Link to="/sessions/new">
            <Button>Start a Session</Button>
          </Link>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SessionCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <Card className="p-12 text-center">
          <p className="text-slate-500 dark:text-gray-400 mb-4">
            Could not load sessions. Something went wrong.
          </p>
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      )}

      {/* Empty */}
      {!isLoading && !isError && sessions?.length === 0 && (
        <Card className="p-12 text-center">
          <h3 className="font-semibold text-navy-900 dark:text-gray-100 mb-2">
            No reading sessions yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">
            Be the first to start one!
          </p>
          {isAuthenticated ? (
            <Link to="/sessions/new">
              <Button>Start a Reading Session</Button>
            </Link>
          ) : (
            <Link to="/register">
              <Button>Join &amp; Start One</Button>
            </Link>
          )}
        </Card>
      )}

      {/* Populated */}
      {!isLoading && !isError && sessions && sessions.length > 0 && (
        <div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
          aria-label="Available reading sessions"
        >
          {sessions.map((session) => (
            <div key={session.id} role="listitem">
              <SessionCard session={session} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
