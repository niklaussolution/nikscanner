import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-black disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-flame-primary text-white shadow-[0_0_0_1px_rgba(255,90,0,0.4),0_8px_24px_-8px_rgba(255,90,0,0.55)] hover:bg-flame-bright hover:shadow-[0_0_0_1px_rgba(255,122,0,0.6),0_10px_28px_-6px_rgba(255,122,0,0.6)] active:bg-flame-deep",
        outline:
          "border border-white/15 text-white hover:border-flame-primary/60 hover:text-flame-bright bg-transparent",
        ghost: "text-muted hover:text-white hover:bg-white/5",
        subtle: "bg-white/[0.04] text-white border border-white/10 hover:bg-white/[0.08]",
        danger: "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20",
      },
      size: {
        sm: "h-9 px-3.5 text-xs",
        md: "h-11 px-5",
        lg: "h-13 px-7 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
