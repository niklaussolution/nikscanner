function seededFrac(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const VB_W = 1600;
const VB_H = 420;
const NODE_COUNT = 26;

const NODES = Array.from({ length: NODE_COUNT }, (_, i) => ({
  id: i,
  x: Math.round(seededFrac(i * 3.1 + 1) * VB_W * 100) / 100,
  y: Math.round(seededFrac(i * 5.7 + 2) * VB_H * 100) / 100,
  r: Math.round((seededFrac(i * 2.3 + 3) * 1.4 + 1.2) * 100) / 100,
}));

const LINKS: [number, number][] = [];
NODES.forEach((n, i) => {
  const next = NODES[(i + 1) % NODES.length];
  const dx = next.x - n.x;
  const dy = next.y - n.y;
  if (Math.sqrt(dx * dx + dy * dy) < 420) LINKS.push([i, (i + 1) % NODES.length]);
});

/** Purely decorative scattered node/line backdrop for the community hero. */
export function NetworkBackdrop() {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
    >
      {LINKS.map(([a, b], i) => (
        <line
          key={i}
          data-net-line
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="rgba(255,90,0,0.18)"
          strokeWidth="1"
        />
      ))}
      {NODES.map((n) => (
        <circle key={n.id} data-net-dot cx={n.x} cy={n.y} r={n.r} fill="var(--orange, #ff5a00)" opacity="0.55" />
      ))}
    </svg>
  );
}
