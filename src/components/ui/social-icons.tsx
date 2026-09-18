import type { SVGProps } from "react";

/**
 * lucide-react dropped brand/logo glyphs, so social icons are hand-drawn
 * minimal SVGs here instead of depending on a brand icon package.
 */

export function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .5C5.73.5.5 5.73.5 12.02c0 5.03 3.29 9.3 7.85 10.8.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.6.24 2.77.12 3.06.74.8 1.18 1.83 1.18 3.09 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.07.78 2.16 0 1.56-.02 2.82-.02 3.2 0 .3.2.66.79.55A10.53 10.53 0 0 0 23.5 12c0-6.3-5.22-11.5-11.5-11.5Z" />
    </svg>
  );
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21h-4V9Z" />
    </svg>
  );
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.24 3H21l-6.94 7.93L22.2 21h-6.5l-5.1-6.66L4.7 21H2l7.43-8.49L1.8 3h6.66l4.6 6.09L18.24 3Zm-1.14 16.17h1.8L7.02 4.75H5.08l12.02 14.42Z" />
    </svg>
  );
}

export function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.5 6.5s-.23-1.64-.94-2.36c-.9-.95-1.9-.95-2.36-1C17 2.8 12 2.8 12 2.8h-.01s-5 0-8.2.34c-.46.05-1.46.05-2.36 1C.72 4.86.5 6.5.5 6.5S.26 8.42.26 10.35v1.8c0 1.93.24 3.85.24 3.85s.23 1.64.93 2.36c.9.96 2.08.93 2.6 1.03C5.9 19.6 12 19.66 12 19.66s5 0 8.2-.35c.46-.05 1.46-.05 2.36-1 .71-.72.94-2.36.94-2.36s.24-1.92.24-3.85v-1.8c0-1.93-.24-3.85-.24-3.85ZM9.7 14.5V8.7l6.16 2.9-6.16 2.9Z" />
    </svg>
  );
}
