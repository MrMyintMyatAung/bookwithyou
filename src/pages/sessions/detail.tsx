import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSession, useSessionMembers, useJoinSession, useUpdateSessionStatus, useDeleteSession } from "../../hooks/useSessions";
import { useSessionProgress, useProgressRealtime } from "../../hooks/useProgress";
import { useCommentsRealtime } from "../../hooks/useComments";
import { useReactionsRealtime } from "../../hooks/useReactions";
import { useAuth } from "../../hooks/useAuth";
import { STATUS_CLASSES, STATUS_CYCLE, STATUS_LABEL } from "../../lib/constants";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Avatar } from "../../components/ui/avatar";
import { ProgressBar } from "../../components/sessions/progress-bar";
import { ProgressLog } from "../../components/sessions/progress-log";
import { CommentList } from "../../components/sessions/comment-list";

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();

  const {
    data: session,
    isLoading: sessionLoading,
    isError: sessionError,
    refetch: refetchSession,
  } = useSession(id);

  const { data: members, isLoading: membersLoading } = useSessionMembers(id);
  const { data: progressRows } = useSessionProgress(id);

  const joinSession = useJoinSession();
  const updateStatus = useUpdateSessionStatus();
  const deleteSession = useDeleteSession();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const uid = user?.id;
  useProgressRealtime(uid ? id : undefined);
  useCommentsRealtime(uid ? id : undefined);
  useReactionsRealtime(uid ? id : undefined);

  const isHost = user != null && session != null && user.id === session.host_id;
  const isMember =
    user != null &&
    members != null &&
    members.some((m) => m.member.id === user.id);
  const totalChapters = session?.book?.total_chapters ?? 0;
  const bookTitle = session?.book?.title ?? "Unknown Book";
  const bookAuthor = session?.book?.author ?? "Unknown Author";
  const hostName = session?.host?.username ?? "unknown";

  // --- Loading ---
  if (sessionLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-gray-800 rounded w-2/3" />
          <div className="h-4 bg-slate-100 dark:bg-gray-900 rounded w-1/2" />
          <div className="h-48 bg-slate-100 dark:bg-gray-900 rounded-2xl" />
          <div className="h-32 bg-slate-100 dark:bg-gray-900 rounded-2xl" />
          <div className="h-48 bg-slate-100 dark:bg-gray-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  // --- Error ---
  if (sessionError) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <Card className="p-12 text-center">
          <h2 className="text-xl font-semibold text-navy-900 dark:text-gray-100 mb-2">
            Could not load this session
          </h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">
            It might have been deleted or you may not have access.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="secondary" onClick={() => refetchSession()}>
              Retry
            </Button>
            <Link to="/sessions">
              <Button variant="ghost">Back to Sessions</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // --- Not found ---
  if (!session) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-navy-900 dark:text-gray-100 mb-2">
          Session not found
        </h2>
        <p className="text-slate-500 dark:text-gray-400 mb-6">
          This session doesn&apos;t exist or may have been removed.
        </p>
        <Link to="/sessions">
          <Button variant="secondary">Back to Sessions</Button>
        </Link>
      </div>
    );
  }

  // Build progress lookup by member_id
  const progressByMember = new Map<string, number>();
  if (progressRows) {
    for (const p of progressRows) {
      progressByMember.set(p.member_id, p.chapters_completed);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/sessions"
          className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-gray-400 hover:text-navy-700 transition-colors mb-4 no-underline"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All Sessions
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-gray-100">
              {session.title}
            </h1>
            <p className="mt-2 text-slate-500 dark:text-gray-400">
              Hosted by{" "}
              <span className="font-medium text-slate-700 dark:text-gray-300">
                {hostName}
              </span>
              {" · "}
              {members ? `${members.length} ${members.length === 1 ? "member" : "members"}` : "…"}
            </p>
          </div>
          <span
            className={`shrink-0 inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${STATUS_CLASSES[session.status] ?? STATUS_CLASSES.active}`}
          >
            {STATUS_LABEL[session.status] ?? session.status}
          </span>
        </div>

        {/* Host: status toggle + delete */}
        {isHost && (
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              loading={updateStatus.isPending}
              onClick={() => {
                const next = STATUS_CYCLE[session.status];
                updateStatus.mutate({ sessionId: session.id, status: next });
              }}
            >
              {updateStatus.isPending
                ? "Updating…"
                : `Mark as ${STATUS_LABEL[STATUS_CYCLE[session.status]]}`}
            </Button>

            {showDeleteConfirm ? (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="primary"
                  size="sm"
                  loading={deleteSession.isPending}
                  onClick={() => {
                    deleteSession.mutate(session.id, {
                      onSuccess: () => navigate("/sessions", { replace: true }),
                    });
                  }}
                  className="!bg-red-600 hover:!bg-red-700"
                >
                  {deleteSession.isPending ? "Deleting…" : "Yes, delete"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteSession.isPending}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                title="Delete this session"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Book info */}
      <Card className="p-6 mb-8">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          The Book
        </h2>
        <h3 className="text-xl font-bold text-navy-900 dark:text-gray-100">
          {bookTitle}
        </h3>
        <p className="text-slate-500 dark:text-gray-400 mt-1">by {bookAuthor}</p>

        {/* Chapters */}
        {(() => {
          const chapters = session.book?.chapters as unknown as string[] | undefined;
          if (!chapters || chapters.length === 0) return null;
          return (
            <div className="mt-5">
              <h4 className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-2">
                Chapters ({totalChapters})
              </h4>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
                {chapters.map((chapter, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-600 dark:text-gray-300 py-1 border-b border-slate-100 dark:border-gray-800 last:border-0"
                >
                  <span className="text-slate-400 dark:text-gray-500 text-xs mr-2">
                    {i + 1}.
                  </span>
                  {chapter}
                </li>
              ))}
            </ul>
          </div>
          );
        })()}
      </Card>

      {/* Members */}
      <Card className="p-6 mb-8">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Members
        </h2>

        {membersLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-9 w-9 bg-slate-200 dark:bg-gray-800 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-100 dark:bg-gray-900 rounded w-28 mb-2" />
                  <div className="h-2 bg-slate-100 dark:bg-gray-900 rounded w-full max-w-xs" />
                </div>
              </div>
            ))}
          </div>
        ) : members && members.length > 0 ? (
          <ul className="divide-y divide-slate-100 dark:divide-gray-800">
            {members.map((m) => {
              const completed = progressByMember.get(m.member.id) ?? 0;
              return (
                <li
                  key={m.id}
                  className="py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar
                      avatarUrl={m.member.avatar_url}
                      username={m.member.username}
                      size="sm"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-gray-300">
                        {m.member.username}
                        {isHost && m.member.id === session.host_id && (
                          <span className="ml-2 text-xs text-coral-500 font-normal">
                            Host
                          </span>
                        )}
                        {user && m.member.id === user.id && (
                          <span className="ml-2 text-xs text-slate-400 dark:text-gray-500 font-normal">
                            You
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  {totalChapters > 0 && (
                    <ProgressBar
                      chaptersCompleted={completed}
                      totalChapters={totalChapters}
                      size="sm"
                      className="ml-12"
                    />
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-slate-500 dark:text-gray-400">No members yet.</p>
        )}

        {/* My progress log */}
        {isMember && totalChapters > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-gray-800">
            <ProgressLog
              sessionId={session.id}
              totalChapters={totalChapters}
            />
          </div>
        )}

        {/* Join button */}
        {isAuthenticated && !isMember && (
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-gray-800">
            <Button
              loading={joinSession.isPending}
              onClick={() => {
                joinSession.mutate(session.id, {
                  onError: (err) => {
                    console.error("Failed to join session:", err);
                  },
                });
              }}
            >
              {joinSession.isPending ? "Joining…" : "Join This Session"}
            </Button>
          </div>
        )}

        {isAuthenticated && isMember && (
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-gray-800">
            <p className="text-sm text-teal-600 dark:text-teal-400 font-medium inline-flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              You&apos;re in this session
            </p>
          </div>
        )}

        {!isAuthenticated && (
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-gray-800">
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-3">
              Want to join? Sign in or create an account.
            </p>
            <div className="flex items-center gap-3">
              <Link to={`/login?redirect=/sessions/${session.id}`}>
                <Button variant="secondary" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to={`/register?redirect=/sessions/${session.id}`}>
                <Button size="sm">Create Account</Button>
              </Link>
            </div>
          </div>
        )}
      </Card>

      {/* Discussion */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-6">
          Discussion
        </h2>
        <CommentList
          sessionId={session.id}
          currentUserId={user?.id}
          isMember={isMember}
        />
      </Card>
    </div>
  );
}
