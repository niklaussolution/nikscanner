import type { CSSProperties } from "react";
import { scannerTheme } from "@/components/scanner-url/theme";

/** --positive/--negative are the same hex values as --safe/--danger, aliased rather than duplicated. */
export const leaderboardTheme = {
  ...scannerTheme,
  "--positive": "var(--safe)",
  "--negative": "var(--danger)",
} as CSSProperties;
