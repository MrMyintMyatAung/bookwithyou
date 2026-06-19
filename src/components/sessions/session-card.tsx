import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/card";
import { STATUS_CLASSES } from "../../lib/constants";
import type { SessionWithBook } from "../../hooks/useSessions";

export function SessionCard({ session }: { session: SessionWithBook }) {
  const memberCount = session.memberships?.[0]?.count ?? 0;
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const url = `${window.location.origin}/sessions/${session.id}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    },
    [session.id]
  );

  return (
    <Link to={`/sessions/${session.id}`} className="group block">
      <Card className="p-6 h-full transition-all duration-200 group-hover:shadow-md group-hover:border-primary-300/50">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors line-clamp-1 min-w-0 flex-1">
            {session.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <span
              className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_CLASSES[session.status] ?? STATUS_CLASSES.active}`}
            >
              {session.status}
            </span>

            {/* Share button — sits next to status badge, hidden until hover */}
            <button
              type="button"
              onClick={handleShare}
              className="p-1 rounded-lg text-neutral-300 hover:text-primary-600 hover:bg-primary-50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200"
              aria-label={copied ? "Link copied!" : "Copy session link"}
            >
              {copied ? (
                <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="text-sm text-neutral-600 mb-4">
          <p className="font-medium text-neutral-800">{session.book.title}</p>
          <p className="text-neutral-500">by {session.book.author}</p>
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-400 mt-auto">
          <span>
            Host:{" "}
            <span className="font-medium text-neutral-600">
              {session.host.username}
            </span>
          </span>
          <span className="inline-flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
          <span className="inline-flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            {session.book.total_chapters}{" "}
            {session.book.total_chapters === 1 ? "chapter" : "chapters"}
          </span>
        </div>
      </Card>
    </Link>
  );
}

export function SessionCardSkeleton() {
  return (
    <Card className="p-6 h-full animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="h-5 bg-neutral-200 rounded w-3/4" />
        <div className="h-5 bg-neutral-200 rounded w-14 shrink-0" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-neutral-200 rounded w-2/3" />
        <div className="h-4 bg-neutral-100 rounded w-1/3" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3 bg-neutral-100 rounded w-24" />
        <div className="h-3 bg-neutral-100 rounded w-16" />
        <div className="h-3 bg-neutral-100 rounded w-16" />
      </div>
    </Card>
  );
}
