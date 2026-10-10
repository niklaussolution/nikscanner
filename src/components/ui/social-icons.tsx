import type { SVGProps } from "react";

/**
 * lucide-react dropped brand/logo glyphs, so social icons are hand-drawn
 * minimal SVGs here instead of depending on a brand icon package.
 */

export function Instagram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8Zm4.2 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
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

export function Facebook(props: SVGProps<SVGSVGElement>) { return ( <svg viewBox="0 0 24 24" fill="currentColor" {...props}> <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.707 4.533-4.707 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.49 0-1.956.93-1.956 1.885v2.276h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z" /> </svg> ); }

export function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.5 6.5s-.23-1.64-.94-2.36c-.9-.95-1.9-.95-2.36-1C17 2.8 12 2.8 12 2.8h-.01s-5 0-8.2.34c-.46.05-1.46.05-2.36 1C.72 4.86.5 6.5.5 6.5S.26 8.42.26 10.35v1.8c0 1.93.24 3.85.24 3.85s.23 1.64.93 2.36c.9.96 2.08.93 2.6 1.03C5.9 19.6 12 19.66 12 19.66s5 0 8.2-.35c.46-.05 1.46-.05 2.36-1 .71-.72.94-2.36.94-2.36s.24-1.92.24-3.85v-1.8c0-1.93-.24-3.85-.24-3.85ZM9.7 14.5V8.7l6.16 2.9-6.16 2.9Z" />
    </svg>
  );
}
