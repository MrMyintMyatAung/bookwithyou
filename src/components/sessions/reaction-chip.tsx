import { cn } from "../../lib/cn";

interface ReactionChipProps {
  emoji: string;
  count: number;
  active: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function ReactionChip({
  emoji,
  count,
  active,
  disabled,
  onClick,
}: ReactionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors duration-200 border",
        active
          ? "bg-coral-100 dark:bg-coral-900/30 border-coral-300 text-coral-600 dark:text-coral-400 hover:bg-coral-200"
          : "bg-slate-100 dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-400 hover:bg-slate-200 hover:border-slate-300",
        onClick ? "cursor-pointer" : "cursor-default",
        disabled && "opacity-50 cursor-wait"
      )}
      aria-label={`${emoji} reaction, ${count} count${active ? ", active" : ""}`}
    >
      <span className="text-sm leading-none">{emoji}</span>
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
