import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/card";
import { STATUS_CLASSES } from "../../lib/constants";
import type { SessionWithBook } from "../../hooks/useSessions";

/** Generate a consistent hue from a string for the cover gradient */
function hashHue(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = str.charCodeAt(i) + ((h << 5) - h);
  }
  return Math.abs(h) % 360;
}

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

  // Guard against sessions with null book (RLS-filtered or deleted)
  const bookTitle = session.book?.title ?? "Unknown Book";
  const bookAuthor = session.book?.author ?? "Unknown Author";
  const bookChapters = session.book?.total_chapters ?? 0;
  const hostName = session.host?.username ?? "unknown";
  const hue = hashHue(bookTitle);

  return (
    <Link to={`/sessions/${session.id}`} className="group block spotlight rounded-xl">
      <span className="spotlight-glow" aria-hidden="true" />
      <Card className="p-6 h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-coral-500/10 group-hover:border-amber-500/20">
        <div className="flex gap-4">
          {/* Book cover thumbnail */}
          <div
            className="shrink-0 w-12 h-16 rounded-lg flex items-center justify-center text-sm font-black text-white shadow-sm"
            style={{
              background: `linear-gradient(135deg, hsl(${hue}, 60%, 55%), hsl(${(hue + 40) % 360}, 50%, 40%))`,
            }}
            aria-hidden="true"
          >
            {bookTitle.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-white group-hover:text-amber-500 transition-colors line-clamp-1 min-w-0 flex-1">
                {session.title}
              </h3>
              <div className="flex items-center gap-1 shrink-0">
                <span
                  className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_CLASSES[session.status] ?? STATUS_CLASSES.active}`}
                >
                  {session.status}
                </span>
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-1 rounded-lg text-gray-600 hover:text-amber-500 hover:bg-amber-500/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200"
                  aria-label={copied ? "Link copied!" : "Copy session link"}
                >
                  {copied ? (
                    <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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

            <div className="text-sm mb-4">
              <p className="font-medium text-gray-300">{bookTitle}</p>
              <p className="text-gray-500">by {bookAuthor}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
              <span>
                Host:{" "}
                <span className="font-medium text-gray-400">
                  {hostName}
                </span>
              </span>
              <span className="inline-flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {memberCount} {memberCount === 1 ? "member" : "members"}
              </span>
              <span className="inline-flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {bookChapters}{" "}
                {bookChapters === 1 ? "chapter" : "chapters"}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function SessionCardSkeleton() {
  return (
    <Card className="p-6 h-full animate-pulse">
      <div className="flex gap-4">
        <div className="shrink-0 w-12 h-16 rounded-lg bg-white/10" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="h-5 bg-white/10 rounded w-3/4" />
            <div className="h-5 bg-white/10 rounded w-14 shrink-0" />
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-white/10 rounded w-2/3" />
            <div className="h-4 bg-white/5 rounded w-1/3" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-3 bg-white/5 rounded w-24" />
            <div className="h-3 bg-white/5 rounded w-16" />
            <div className="h-3 bg-white/5 rounded w-16" />
          </div>
        </div>
      </div>
    </Card>
  );
}
