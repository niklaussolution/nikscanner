import type { CSSProperties } from "react";
import { scannerTheme } from "@/components/scanner-url/theme";

/**
 * The spec's --operational/--degraded/--outage tokens are the exact same
 * hex values as the scanner family's --safe/--warning/--danger, so they're
 * aliased onto the same CSS custom properties rather than duplicated.
 */
export const statusTheme = {
  ...scannerTheme,
  "--operational": "var(--safe)",
  "--degraded": "var(--warning)",
  "--outage": "var(--danger)",
} as CSSProperties;
