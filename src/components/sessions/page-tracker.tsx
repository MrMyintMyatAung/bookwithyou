import { useState } from "react";
import { useMyPageProgress, useUpdatePageProgress } from "../../hooks/useProgress";
import { Button } from "../ui/button";

interface PageTrackerProps {
  sessionId: string;
  totalPages: number;
}

export function PageTracker({ sessionId, totalPages }: PageTrackerProps) {
  const { data: myProgress } = useMyPageProgress(sessionId);
  const updatePageProgress = useUpdatePageProgress();

  const savedPage = myProgress?.current_page ?? 0;
  const [inputPage, setInputPage] = useState(String(savedPage || ""));

  const handleSave = () => {
    const page = parseInt(inputPage, 10);
    if (isNaN(page) || page < 1) return;
    updatePageProgress.mutate({
      sessionId,
      currentPage: Math.min(totalPages, page),
      totalPages,
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <span className="text-sm text-slate-600 dark:text-gray-300">
        Your page:
      </span>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={1}
          max={totalPages}
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          placeholder="0"
          className="w-20 px-2.5 py-1.5 text-sm text-center font-semibold tabular-nums rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-white/[0.06] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <span className="text-sm text-slate-500 dark:text-gray-400">
          / {totalPages}
        </span>
        <Button
          variant="primary"
          size="sm"
          disabled={updatePageProgress.isPending || !inputPage}
          onClick={handleSave}
        >
          {updatePageProgress.isPending ? "Saving…" : "Save"}
        </Button>
      </div>

      {savedPage > 0 && !updatePageProgress.isPending && (
        <span className="text-xs text-slate-400 dark:text-white/40">
          Last saved: page {savedPage}
        </span>
      )}

      {updatePageProgress.isError && (
        <span className="text-sm text-red-600 dark:text-red-400">
          {updatePageProgress.error instanceof Error
            ? updatePageProgress.error.message
            : "Failed to save. Try again."}
        </span>
      )}
    </div>
  );
}
