import { useState, useRef, useEffect, useCallback } from "react";
import { useToggleReaction } from "../../hooks/useReactions";
import { useDeleteComment } from "../../hooks/useComments";
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
}

export function CommentItem({
  comment,
  currentUserId,
  isMember,
  sessionId,
}: CommentItemProps) {
  const toggleReaction = useToggleReaction();
  const deleteComment = useDeleteComment();
  const [confirming, setConfirming] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const isAuthor = currentUserId != null && currentUserId === comment.author_id;

  // Close confirmation — key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirming(false);
    },
    []
  );

  // Close confirmation on Escape
  useEffect(() => {
    if (!confirming) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [confirming, handleKeyDown]);

  // When confirming, trap focus inside the confirmation buttons
  useEffect(() => {
    if (confirming) {
      cancelRef.current?.focus();
    }
  }, [confirming]);

  if (deleteComment.isPending) {
    return (
      <div className="py-4 first:pt-0 last:pb-0 border-b border-neutral-100 last:border-0 opacity-60">
        <div className="flex gap-3">
          <div className="h-8 w-8 rounded-full bg-neutral-200 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1 space-y-2 animate-pulse">
            <div className="h-4 bg-neutral-100 rounded w-24" />
            <div className="h-4 bg-neutral-100 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group py-4 first:pt-0 last:pb-0 border-b border-neutral-100 last:border-0">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="mt-0.5">
          <Avatar
            avatarUrl={comment.author.avatar_url}
            username={comment.author.username}
            size="sm"
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Author + time */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-neutral-800">
              {comment.author.username}
            </span>
            <span className="text-xs text-neutral-400">
              {relativeTime(comment.created_at)}
            </span>
            {comment.updated_at !== comment.created_at && (
              <span className="text-xs text-neutral-400">(edited)</span>
            )}
          </div>

          {/* Body */}
          <p className="text-sm text-neutral-700 whitespace-pre-wrap break-words">
            {comment.body}
          </p>

          {/* Reaction bar */}
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

            {/* Add reaction button */}
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

            {/* Delete confirm or button (author only) */}
            {isAuthor && !confirming && (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="ml-auto opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-xs text-neutral-400 hover:text-red-600 p-1 rounded"
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

          {/* Inline delete confirmation */}
          {confirming && (
            <div
              className="mt-2 flex items-center gap-2 text-xs"
              role="alertdialog"
              aria-label="Confirm delete comment"
            >
              <span className="text-neutral-500">Delete this comment?</span>
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
                className="text-neutral-500 hover:text-neutral-700 underline"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
