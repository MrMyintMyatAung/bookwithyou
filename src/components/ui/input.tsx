import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-700 dark:text-gray-300"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "px-3 py-2 rounded-xl border bg-white dark:bg-gray-900 text-slate-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
            "disabled:bg-slate-50 dark:disabled:bg-gray-800 disabled:text-slate-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed",
            error
              ? "border-red-400 focus:ring-red-400 focus:border-red-400"
              : "border-slate-300 dark:border-gray-600",
            className
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
