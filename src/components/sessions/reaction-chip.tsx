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
          ? "bg-primary-50 border-primary-300 text-primary-800 hover:bg-primary-100"
          : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:border-neutral-300",
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
