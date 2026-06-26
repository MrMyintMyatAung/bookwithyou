import { useMyProgress, useUpdateProgress } from "../../hooks/useProgress";
import { Button } from "../ui/button";

interface ProgressLogProps {
  sessionId: string;
  totalChapters: number;
}

export function ProgressLog({ sessionId, totalChapters }: ProgressLogProps) {
  const { data: myProgress } = useMyProgress(sessionId);
  const updateProgress = useUpdateProgress();

  const chaptersCompleted = myProgress?.chapters_completed ?? 0;

  return (
    <div className="flex flex-col xs:flex-row xs:items-center gap-2">
      <span className="text-sm text-slate-600">Your progress:</span>
      <div className="flex items-center gap-1 flex-wrap">
        <Button
          variant="secondary"
          size="sm"
          disabled={chaptersCompleted <= 0 || updateProgress.isPending}
          onClick={() => {
            updateProgress.mutate({
              sessionId,
              chaptersCompleted: Math.max(0, chaptersCompleted - 1),
              totalChapters,
            });
          }}
          aria-label="Decrease chapters completed"
        >
          −
        </Button>

        <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 text-sm font-semibold tabular-nums text-slate-900">
          {updateProgress.isPending ? (
            <svg
              className="animate-spin h-4 w-4 text-coral-500"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : (
            chaptersCompleted
          )}
        </span>

        <Button
          variant="secondary"
          size="sm"
          disabled={
            chaptersCompleted >= totalChapters || updateProgress.isPending
          }
          onClick={() => {
            updateProgress.mutate({
              sessionId,
              chaptersCompleted: Math.min(
                totalChapters,
                chaptersCompleted + 1
              ),
              totalChapters,
            });
          }}
          aria-label="Increase chapters completed"
        >
          +
        </Button>

        {totalChapters > 0 && (
          <span className="text-sm text-slate-500">
            / {totalChapters} chapters
          </span>
        )}
      </div>

      {updateProgress.isError && (
        <span className="text-sm text-red-600">
          {updateProgress.error instanceof Error
            ? updateProgress.error.message
            : "Failed to save. Try again."}
        </span>
      )}
    </div>
  );
}
