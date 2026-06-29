import { forwardRef, useState } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  trailing?: React.ReactNode;
  error?: string;
};

export const GlassInput = forwardRef<HTMLInputElement, Props>(
  function GlassInput({ label, trailing, error, className = "", ...rest }, ref) {
    const [focused, setFocused] = useState(false);
    return (
      <div>
        <label
          className={`group relative block rounded-2xl transition ${
            error
              ? "ring-1 ring-red-400/50"
              : focused
              ? "ring-1 ring-primary-400/50"
              : "ring-1 ring-white/10"
          }`}
        >
          <div className="absolute inset-0 rounded-2xl bg-white/[0.06]" />
          <div className="relative flex items-center px-4 pt-2 pb-2">
            <div className="flex-1 min-w-0">
              <span
                className={`block text-[10px] font-medium uppercase tracking-[0.16em] leading-none transition ${
                  focused ? "text-primary-300/90" : "text-white/40"
                }`}
              >
                {label}
              </span>
              <input
                ref={ref}
                className={`mt-1 block w-full bg-transparent text-sm leading-tight text-white placeholder-white/30 outline-none ${className}`}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                {...rest}
              />
            </div>
            {trailing && <div className="ml-3 shrink-0">{trailing}</div>}
          </div>
        </label>
        {error && (
          <p className="mt-1.5 pl-4 text-[11px] text-red-300">{error}</p>
        )}
      </div>
    );
  }
);
