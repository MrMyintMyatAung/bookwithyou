import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { usePublicSessions } from "../hooks/useSessions";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { SessionCard, SessionCardSkeleton } from "../components/sessions/session-card";

function RecentSessions() {
  const { data: sessions, isLoading } = usePublicSessions();

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <SessionCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return null;
  }

  const recent = sessions.slice(0, 3);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {recent.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}

export function HomePage() {
  const { isAuthenticated, profile } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
          Read together,{" "}
          <span className="text-primary-600">stay motivated</span>
        </h1>
        <p className="mt-4 text-lg text-neutral-500 max-w-xl mx-auto">
          Create reading sessions, track your progress chapter by chapter, and
          discuss your favorite books with your community.
        </p>
        {isAuthenticated ? (
          <div className="mt-8">
            <p className="text-neutral-600 mb-4">
              Welcome back,{" "}
              <span className="font-semibold">
                {profile?.username ?? "Reader"}
              </span>
              !
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/sessions/new">
                <Button size="lg">Start a Reading Session</Button>
              </Link>
              <Link to="/sessions">
                <Button variant="secondary" size="lg">
                  Browse Sessions
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="grid sm:grid-cols-3 gap-6 mt-16">
        <Card className="p-6 text-center">
          <div className="text-3xl mb-3">📖</div>
          <h3 className="font-semibold text-neutral-900 mb-2">
            Pick a Book
          </h3>
          <p className="text-sm text-neutral-500">
            Create a session with any book — add the title, author, and chapter
            list.
          </p>
        </Card>

        <Card className="p-6 text-center">
          <div className="text-3xl mb-3">👥</div>
          <h3 className="font-semibold text-neutral-900 mb-2">Invite Readers</h3>
          <p className="text-sm text-neutral-500">
            Share your session link. Anyone can join and read along at their own
            pace.
          </p>
        </Card>

        <Card className="p-6 text-center">
          <div className="text-3xl mb-3">💬</div>
          <h3 className="font-semibold text-neutral-900 mb-2">Discuss</h3>
          <p className="text-sm text-neutral-500">
            Share thoughts, react to comments, and log your progress chapter by
            chapter.
          </p>
        </Card>
      </div>

      {/* Recent sessions */}
      <div className="mt-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">
              Recent Sessions
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Join a public reading session and start tracking your progress.
            </p>
          </div>
          <Link to="/sessions">
            <Button variant="ghost" size="sm">
              View all →
            </Button>
          </Link>
        </div>
        <RecentSessions />
      </div>
    </div>
  );
}
