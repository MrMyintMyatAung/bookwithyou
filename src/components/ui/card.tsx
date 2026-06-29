import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-white dark:bg-[#1e1b18] rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm",
        className
      )}
      {...props}
    />
  )
);

Card.displayName = "Card";
