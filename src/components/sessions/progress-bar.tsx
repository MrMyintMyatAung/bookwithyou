import { useState, useEffect } from "react";
import { cn } from "../../lib/cn";

interface ProgressBarProps {
  chaptersCompleted: number;
  totalChapters: number;
  size?: "sm" | "md";
  className?: string;
  /** Unit label — "chapters" or "pages". Defaults to "chapters". */
  labelUnit?: "chapters" | "pages";
}

export function ProgressBar({
  chaptersCompleted,
  totalChapters,
  size = "md",
  className,
  labelUnit = "chapters",
}: ProgressBarProps) {
  const pct =
    totalChapters > 0
      ? Math.round((chaptersCompleted / totalChapters) * 100)
      : 0;

  const isComplete = pct >= 100;
  const isEmpty = pct === 0;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const barHeight = size === "sm" ? "h-2" : "h-3";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div
      className={cn("flex items-center gap-3", className)}
      role="progressbar"
      aria-valuenow={chaptersCompleted}
      aria-valuemin={0}
      aria-valuemax={totalChapters}
      aria-label={`${chaptersCompleted} of ${totalChapters} ${labelUnit} completed`}
    >
      <div
        className={cn(
          "flex-1 rounded-full bg-neutral-200 dark:bg-gray-800 overflow-hidden",
          barHeight
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            isComplete
              ? "bg-teal-500"
              : isEmpty
                ? "bg-slate-200 dark:bg-gray-700"
                : "bg-primary-500"
          )}
          style={{ width: mounted ? `${Math.max(pct, isEmpty ? 0 : 4)}%` : "0%" }}
        />
      </div>
      <span
        className={cn(
          "font-medium tabular-nums shrink-0 min-w-[4rem] text-right",
          textSize,
          isComplete ? "text-teal-600 dark:text-teal-400" : "text-slate-500 dark:text-gray-400"
        )}
      >
        {isComplete ? (
          <span className="inline-flex items-center gap-0.5">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            Done!
          </span>
        ) : labelUnit === "pages" ? (
          `Page ${chaptersCompleted} of ${totalChapters}`
        ) : (
          `${chaptersCompleted} of ${totalChapters}`
        )}
      </span>
    </div>
  );
}
