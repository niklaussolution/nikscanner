"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { UploadCloud, ShieldCheck, Lock, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCEPTED_EXTENSIONS } from "@/components/scanner-file/file-validation";

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Local SHA-256" },
  { icon: Lock, label: "Encrypted Transfer" },
  { icon: Database, label: "No File Storage" },
];

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function FileDropzone({
  onFile,
  disabled = false,
  error,
}: {
  onFile: (file: File) => void;
  disabled?: boolean;
  error?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    if (disabled) return;
    dragDepth.current += 1;
    setDragging(true);
    if (!prefersReducedMotion()) {
      gsap.to(iconRef.current, { y: -5, duration: 0.3, ease: "power2.out" });
    }
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) {
      setDragging(false);
      if (!prefersReducedMotion()) {
        gsap.to(iconRef.current, { y: 0, duration: 0.3, ease: "power2.out" });
      }
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    gsap.to(iconRef.current, { y: 0, duration: 0.3, ease: "power2.out" });
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  }

  function openBrowser() {
    if (disabled) return;
    inputRef.current?.click();
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--white)]">Upload a file to analyze</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Drag and drop a file or browse from your device.</p>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label="Upload a file to analyze"
        data-dropzone
        onClick={openBrowser}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openBrowser();
          }
        }}
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors duration-200",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          dragging ? "border-[var(--orange)] bg-[var(--orange)]/[0.06] shadow-[0_0_0_1px_rgba(255,90,0,0.3),0_0_32px_-8px_rgba(255,90,0,0.5)]" : "border-[var(--orange)]/40",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={ACCEPTED_EXTENSIONS.join(",")}
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = "";
          }}
        />

        <div ref={iconRef} className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--orange)]/40 bg-[var(--orange)]/10">
          <UploadCloud className="h-6 w-6 text-[var(--orange-light)]" />
        </div>

        <p className="mt-4 text-base font-bold text-[var(--white)]">{dragging ? "Release to upload" : "Drop your file here"}</p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">or browse from your device</p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openBrowser();
          }}
          disabled={disabled}
          className="mt-4 flex h-11 min-h-[44px] items-center justify-center rounded-lg bg-[var(--orange)] px-6 text-xs font-bold uppercase tracking-wide text-white shadow-[0_0_0_1px_rgba(255,90,0,0.4),0_10px_24px_-8px_rgba(255,90,0,0.55)] transition-shadow hover:shadow-[0_0_0_1px_rgba(255,122,26,0.6),0_12px_28px_-6px_rgba(255,122,26,0.65)] disabled:opacity-70"
        >
          Select File
        </button>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Max 32 MB • {ACCEPTED_EXTENSIONS.map((e) => e.slice(1).toUpperCase()).join(", ")}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-[var(--border-muted)] pt-4 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          {TRUST_ITEMS.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <item.icon className="h-3.5 w-3.5 text-[var(--orange-light)]" />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}
    </div>
  );
}
