import { useState, useRef, useEffect, useCallback } from "react";
import { useToggleReaction } from "../../hooks/useReactions";
import { useDeleteComment, useCreateReply } from "../../hooks/useComments";
import { ReactionChip } from "./reaction-chip";
import { ReactionPicker } from "./reaction-picker";
import { Button } from "../ui/button";
import { Avatar } from "../ui/avatar";
import type { CommentWithAuthor } from "../../hooks/useComments";

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface CommentItemProps {
  comment: CommentWithAuthor;
  currentUserId: string | undefined;
  isMember: boolean;
  sessionId: string;
  /** Nesting level for indentation */
  depth?: number;
}

export function CommentItem({
  comment,
  currentUserId,
  isMember,
  sessionId,
  depth = 0,
}: CommentItemProps) {
  const toggleReaction = useToggleReaction();
  const deleteComment = useDeleteComment();
  const createReply = useCreateReply();
  const [confirming, setConfirming] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const cancelRef = useRef<HTMLButtonElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);
  const isComposingRef = useRef(false);

  const isAuthor = currentUserId != null && currentUserId === comment.author_id;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirming) setConfirming(false);
        if (showReply) setShowReply(false);
      }
    },
    [confirming, showReply]
  );

  useEffect(() => {
    if (!confirming && !showReply) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [confirming, showReply, handleKeyDown]);

  useEffect(() => {
    if (confirming) cancelRef.current?.focus();
  }, [confirming]);

  useEffect(() => {
    if (showReply) replyRef.current?.focus();
  }, [showReply]);

  const handlePostReply = () => {
    const trimmed = replyBody.trim();
    if (!trimmed) return;
    createReply.mutate(
      { sessionId, parentId: comment.id, body: trimmed },
      {
        onSuccess: () => {
          setReplyBody("");
          setShowReply(false);
        },
      }
    );
  };

  const handleReplyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposingRef.current) {
      e.preventDefault();
      handlePostReply();
    }
  };

  if (deleteComment.isPending) {
    return (
      <div className="py-4 first:pt-0 last:pb-0 border-b border-slate-100 dark:border-white/[0.06] last:border-0 opacity-60">
        <div className="flex gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-white/[0.08] shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1 space-y-2 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-white/[0.06] rounded w-24" />
            <div className="h-4 bg-slate-200 dark:bg-white/[0.06] rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  const maxDepth = Math.min(depth, 3);

  return (
    <div>
      <div className="group py-4 first:pt-0 last:pb-0 border-b border-slate-100 dark:border-white/[0.06] last:border-0"
           style={{ marginLeft: maxDepth * 24 }}>
        <div className="flex gap-3">
          <div className="mt-0.5">
            <Avatar
              avatarUrl={comment.author.avatar_url}
              username={comment.author.username}
              size="sm"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-slate-700 dark:text-gray-300">
                {comment.author.username}
              </span>
              <span className="text-xs text-slate-400 dark:text-gray-500">
                {relativeTime(comment.created_at)}
              </span>
              {comment.updated_at !== comment.created_at && (
                <span className="text-xs text-slate-400 dark:text-gray-500">(edited)</span>
              )}
            </div>

            {/* If it's a reply, show who it's replying to */}
            {comment.parent_id && depth === 0 && (
              <p className="text-xs text-slate-400 dark:text-white/40 mb-1">Reply</p>
            )}

            <p className="text-sm text-slate-600 dark:text-gray-300 whitespace-pre-wrap break-words">
              {comment.body}
            </p>

            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {comment.reactions.map((rxn) => (
                <ReactionChip
                  key={rxn.emoji}
                  emoji={rxn.emoji}
                  count={rxn.count}
                  active={rxn.hasMine}
                  disabled={toggleReaction.isPending || !isMember}
                  onClick={
                    isMember && currentUserId
                      ? () =>
                          toggleReaction.mutate({
                            commentId: comment.id,
                            emoji: rxn.emoji,
                            sessionId,
                          })
                      : undefined
                  }
                />
              ))}

              {isMember && (
                <ReactionPicker
                  loading={toggleReaction.isPending}
                  onPick={(emoji) =>
                    toggleReaction.mutate({
                      commentId: comment.id,
                      emoji,
                      sessionId,
                    })
                  }
                />
              )}

              {/* Reply button */}
              {isMember && !showReply && (
                <button
                  type="button"
                  onClick={() => setShowReply(true)}
                  className="ml-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-xs text-slate-400 dark:text-gray-500 hover:text-primary-600 p-1 rounded"
                >
                  <svg className="h-3.5 w-3.5 inline mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Reply
                </button>
              )}

              {isAuthor && !confirming && (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="ml-auto opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-xs text-slate-400 dark:text-gray-500 hover:text-red-500 p-1 rounded"
                  aria-label="Delete comment"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>

            {confirming && (
              <div
                className="mt-2 flex items-center gap-2 text-xs"
                role="alertdialog"
                aria-label="Confirm delete comment"
              >
                <span className="text-slate-500 dark:text-gray-400">Delete this comment?</span>
                <Button
                  size="sm"
                  onClick={() => deleteComment.mutate(comment.id)}
                >
                  Yes, delete
                </Button>
                <button
                  ref={cancelRef}
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="text-slate-400 dark:text-gray-500 hover:text-slate-700 underline"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Inline reply form */}
            {showReply && (
              <div className="mt-3 flex flex-col gap-2">
                <textarea
                  ref={replyRef}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  onKeyDown={handleReplyKeyDown}
                  onCompositionStart={() => { isComposingRef.current = true; }}
                  onCompositionEnd={() => { isComposingRef.current = false; }}
                  placeholder="Write a reply…"
                  rows={2}
                  maxLength={2000}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/[0.06] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handlePostReply}
                    loading={createReply.isPending}
                    disabled={!replyBody.trim()}
                  >
                    {createReply.isPending ? "Posting…" : "Reply"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReply(false);
                      setReplyBody("");
                    }}
                    className="text-xs text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-white/70"
                  >
                    Cancel
                  </button>
                </div>
                {createReply.isError && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {createReply.error instanceof Error
                      ? createReply.error.message
                      : "Failed to post reply. Try again."}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies.length > 0 && (
        <div className="border-l-2 border-slate-200 dark:border-white/[0.06]"
             style={{ marginLeft: maxDepth * 24 + 12 }}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              isMember={isMember}
              sessionId={sessionId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
