import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/cn";
import { Spinner } from "./spinner";

type ButtonVariant = "primary" | "secondary" | "ghost" | "brand" | "brand-outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/30 hover:brightness-110 active:scale-[0.97] focus-visible:ring-primary-500",
  secondary:
    "bg-white/60 dark:bg-white/[0.06] backdrop-blur-sm border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-200 shadow-sm hover:bg-white dark:hover:bg-white/[0.1] hover:shadow-md hover:border-slate-300 dark:hover:border-white/20 active:scale-[0.97] focus-visible:ring-primary-500",
  ghost:
    "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 hover:bg-slate-100/80 dark:hover:bg-white/[0.06] active:scale-[0.97] focus-visible:ring-primary-500",
  brand:
    "bg-gradient-to-r from-navy-700 to-navy-800 text-white font-semibold shadow-md shadow-navy-700/25 hover:shadow-lg hover:shadow-navy-700/30 hover:brightness-110 active:scale-[0.97] focus-visible:ring-navy-500",
  "brand-outline":
    "bg-white/60 dark:bg-white/[0.06] backdrop-blur-sm border border-navy-200 dark:border-white/10 text-navy-700 dark:text-gray-200 shadow-sm hover:bg-navy-50 dark:hover:bg-white/[0.1] hover:shadow-md hover:border-navy-300 dark:hover:border-white/20 active:scale-[0.97] focus-visible:ring-navy-500",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs rounded-lg",
  md: "px-5 py-2 text-sm rounded-xl",
  lg: "px-7 py-3 text-base rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, disabled, children, ...props },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={isDisabled}
        aria-busy={loading ? true : undefined}
        {...props}
      >
        {loading && <Spinner className="h-4 w-4" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
