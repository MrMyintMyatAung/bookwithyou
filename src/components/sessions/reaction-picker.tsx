import { useRef, useEffect, useState, type KeyboardEvent } from "react";
import { cn } from "../../lib/cn";

const COMMON_EMOJIS = [
  "👍",
  "❤️",
  "😂",
  "😮",
  "😢",
  "😡",
  "🎉",
  "🔥",
  "📚",
  "👏",
];

interface ReactionPickerProps {
  onPick: (emoji: string) => void;
  loading?: boolean;
}

export function ReactionPicker({ onPick, loading }: ReactionPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      activeIndexRef.current = Math.min(
        COMMON_EMOJIS.length - 1,
        activeIndexRef.current + 1
      );
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      activeIndexRef.current = Math.max(0, activeIndexRef.current - 1);
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onPick(COMMON_EMOJIS[activeIndexRef.current]);
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center justify-center h-6 w-6 rounded-full text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors",
          open && "text-coral-500 bg-coral-50"
        )}
        aria-label="Add reaction"
        aria-expanded={open}
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 mb-1 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 flex gap-1 z-50"
          role="listbox"
          aria-label="Choose a reaction"
          onKeyDown={handleKeyDown}
        >
          {COMMON_EMOJIS.map((emoji, i) => (
            <button
              key={emoji}
              type="button"
              role="option"
              aria-selected={i === activeIndexRef.current}
              disabled={loading}
              onClick={() => {
                onPick(emoji);
                setOpen(false);
              }}
              className={cn(
                "h-8 w-8 flex items-center justify-center rounded-lg text-lg hover:bg-slate-100 transition-colors",
                loading && "opacity-50 cursor-wait"
              )}
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
