"use client";

import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export function Toast({
  message,
  action,
  onDismiss,
}: {
  message: string;
  action?: ToastAction;
  onDismiss: () => void;
}) {
  return (
    <div
      role="alert"
      className="fixed bottom-6 left-1/2 z-50 w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-danger/40 bg-card-bg p-4 pr-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-1 p-1 top-1 rounded-md text-muted transition-colors hover:bg-white/5 hover:text-white"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Main content */}
      <div className="flex items-center justify-between gap-4 pr-8">
        {/* Left: icon + message */}
        <div className="flex min-w-0 items-center gap-2">
          <AlertTriangle className="h-5 w-5 shrink-0 text-danger" />

          <p className="text-sm font-medium leading-5 text-white">
            {message}
          </p>
        </div>

        {/* Right: action */}
        {action && (
          <Button
            size="sm"
            variant="outline"
            className="shrink-0"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
