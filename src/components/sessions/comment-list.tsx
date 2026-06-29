import { useState, useRef } from "react";
import { useSessionComments, useCreateComment } from "../../hooks/useComments";
import { CommentItem } from "./comment-item";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

const MAX_COMMENT_LENGTH = 2000;

interface CommentListProps {
  sessionId: string;
  currentUserId: string | undefined;
  isMember: boolean;
}

export function CommentList({
  sessionId,
  currentUserId,
  isMember,
}: CommentListProps) {
  const { data: comments, isLoading, isError, refetch } = useSessionComments(sessionId, currentUserId);
  const createComment = useCreateComment();
  const [newComment, setNewComment] = useState("");
  const isComposingRef = useRef(false);

  const handleSubmit = () => {
    if (!newComment.trim() || newComment.length > MAX_COMMENT_LENGTH) return;
    createComment.mutate(
      { sessionId, body: newComment.trim() },
      {
        onSuccess: () => setNewComment(""),
      }
    );
  };

  const charsRemaining = MAX_COMMENT_LENGTH - newComment.length;
  const isOverLimit = charsRemaining < 0;

  return (
    <div>
      {/* New comment form */}
      {isMember && (
        <div className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            maxLength={MAX_COMMENT_LENGTH}
            disabled={createComment.isPending}
            aria-label="Write a comment"
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isComposingRef.current) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-slate-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
          {createComment.isError && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              Failed to post comment. Try again.
            </p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span
              className={`text-xs ${isOverLimit ? "text-red-500 font-medium" : "text-slate-400 dark:text-gray-500"}`}
            >
              {isOverLimit
                ? `${Math.abs(charsRemaining)} characters over limit`
                : `${charsRemaining} characters left`}
            </span>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              loading={createComment.isPending}
              disabled={!newComment.trim() || isOverLimit}
            >
              {createComment.isPending ? "Posting…" : "Post"}
            </Button>
          </div>
        </div>
      )}

      {/* Comments thread */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-3 py-4 first:pt-0 border-b border-slate-100 dark:border-gray-800 last:border-0 animate-pulse"
            >
              <div className="h-8 w-8 bg-slate-200 dark:bg-gray-800 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <div className="h-3.5 bg-slate-200 dark:bg-gray-800 rounded w-20" />
                  <div className="h-3.5 bg-slate-100 dark:bg-gray-900 rounded w-12" />
                </div>
                <div className="h-4 bg-slate-100 dark:bg-gray-900 rounded w-full" />
                <div className="h-4 bg-slate-100 dark:bg-gray-900 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <Card className="p-6 text-center">
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-3">
            Could not load comments.
          </p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      )}

      {!isLoading && !isError && comments && comments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500 dark:text-gray-400">
            No comments yet. Start the discussion!
          </p>
        </div>
      )}

      {!isLoading && !isError && comments && comments.length > 0 && (
        <div>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              isMember={isMember}
              sessionId={sessionId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
