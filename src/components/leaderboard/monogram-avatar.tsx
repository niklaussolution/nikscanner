"use client";

// Deterministic colored monogram from the username — no stock photos, no
// per-render randomness (same user always gets the same avatar).
const PALETTE = ["#ff5a00", "#ff7a1a", "#22d868", "#4ea1ff", "#c084fc", "#f472b6", "#facc15"];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function MonogramAvatar({ username, size = 48, src }: { username: string; size?: number; src?: string | null }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user-uploaded data URL, nothing for next/image to optimize
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full border border-white/15 object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  const initials = username
    .split(/[_\-\s]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || username.slice(0, 2).toUpperCase();

  const color = PALETTE[hashString(username) % PALETTE.length];

  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full border font-heading font-extrabold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        borderColor: `${color}66`,
        backgroundColor: `${color}1a`,
        color,
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
