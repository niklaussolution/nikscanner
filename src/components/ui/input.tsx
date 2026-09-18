import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-lg border border-white/10 bg-black/40 px-4 text-sm text-white placeholder:text-muted focus:border-flame-primary/60 focus:outline-none focus:ring-2 focus:ring-flame-primary/20",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
