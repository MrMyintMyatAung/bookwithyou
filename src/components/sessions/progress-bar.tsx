import { cn } from "../../lib/cn";

interface ProgressBarProps {
  chaptersCompleted: number;
  totalChapters: number;
  size?: "sm" | "md";
  className?: string;
}

export function ProgressBar({
  chaptersCompleted,
  totalChapters,
  size = "md",
  className,
}: ProgressBarProps) {
  const pct =
    totalChapters > 0
      ? Math.round((chaptersCompleted / totalChapters) * 100)
      : 0;

  const isComplete = pct >= 100;
  const isEmpty = pct === 0;

  const barHeight = size === "sm" ? "h-2" : "h-3";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div
      className={cn("flex items-center gap-3", className)}
      role="progressbar"
      aria-valuenow={chaptersCompleted}
      aria-valuemin={0}
      aria-valuemax={totalChapters}
      aria-label={`${chaptersCompleted} of ${totalChapters} chapters completed`}
    >
      <div
        className={cn(
          "flex-1 rounded-full bg-neutral-100 overflow-hidden",
          barHeight
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            isComplete
              ? "bg-emerald-500"
              : isEmpty
                ? "bg-neutral-200"
                : "bg-amber-500"
          )}
          style={{ width: `${Math.max(pct, isEmpty ? 0 : 4)}%` }}
        />
      </div>
      <span
        className={cn(
          "font-medium tabular-nums shrink-0 min-w-[4rem] text-right",
          textSize,
          isComplete ? "text-emerald-700" : "text-neutral-500"
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
        ) : (
          `${chaptersCompleted} of ${totalChapters}`
        )}
      </span>
    </div>
  );
}
