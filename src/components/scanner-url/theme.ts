import type { CSSProperties } from "react";

/**
 * Page-scoped design tokens for the redesigned /scanner/url experience.
 * Kept local (applied as inline custom properties on the page wrapper)
 * rather than merged into globals.css, since the reference spec's exact
 * hex values differ slightly from the site-wide brand tokens already
 * relied on elsewhere (e.g. --flame-bright #ff7a00 vs this page's #ff7a1a).
 */
export const scannerTheme = {
  "--background": "#060606",
  "--surface": "#0d0d0d",
  "--surface-raised": "#11100f",
  "--surface-soft": "#141414",
  "--border": "#292929",
  "--border-muted": "#1c1c1c",
  "--orange": "#ff5a00",
  "--orange-light": "#ff7a1a",
  "--white": "#f7f7f7",
  "--text-secondary": "#a7acb8",
  "--text-muted": "#717680",
  "--safe": "#22d868",
  "--warning": "#ff9d00",
  "--danger": "#ff3b30",
} as CSSProperties;
