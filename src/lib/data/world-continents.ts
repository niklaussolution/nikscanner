/**
 * Simplified, hand-drawn continent silhouettes (lon, lat degree pairs) used
 * to render a dotted world map without any external GeoJSON dependency or
 * network fetch. Not survey-accurate, but topologically correct enough to
 * read as real continents in the right places (unlike a random dot field).
 */

export type LonLat = [number, number];

export const CONTINENTS: LonLat[][] = [
  // North America
  [
    [-165, 68], [-165, 60], [-140, 60], [-130, 55], [-125, 48], [-124, 40],
    [-117, 32], [-110, 31], [-105, 22], [-97, 18], [-90, 16], [-88, 14],
    [-83, 9], [-80, 8], [-82, 15], [-90, 20], [-97, 26], [-97, 30],
    [-90, 30], [-85, 30], [-81, 25], [-80, 26], [-75, 35], [-70, 41],
    [-65, 45], [-60, 47], [-55, 50], [-60, 55], [-65, 60], [-70, 63],
    [-80, 65], [-95, 68], [-110, 70], [-130, 70], [-150, 70], [-165, 68],
  ],
  // Greenland
  [
    [-45, 83], [-55, 82], [-65, 78], [-55, 70], [-45, 68], [-35, 72],
    [-25, 78], [-35, 82], [-45, 83],
  ],
  // South America
  [
    [-80, 10], [-77, 5], [-79, -2], [-81, -5], [-80, -18], [-75, -20],
    [-70, -25], [-71, -35], [-73, -42], [-72, -50], [-68, -55], [-65, -55],
    [-62, -50], [-58, -38], [-58, -34], [-48, -25], [-40, -15], [-35, -8],
    [-40, -3], [-50, 0], [-60, 5], [-65, 8], [-70, 10], [-75, 11], [-80, 10],
  ],
  // Africa
  [
    [-17, 15], [-16, 12], [-13, 8], [-10, 5], [-5, 5], [0, 6], [5, 5],
    [9, 4], [9, 0], [13, -5], [12, -10], [13, -17], [15, -22], [18, -28],
    [20, -34], [25, -34], [28, -30], [32, -27], [35, -25], [40, -15],
    [41, -5], [45, 0], [51, 10], [48, 12], [43, 13], [38, 15], [35, 20],
    [32, 25], [35, 30], [30, 32], [25, 32], [20, 32], [15, 33], [11, 33],
    [9, 30], [0, 35], [-6, 35], [-9, 32], [-13, 28], [-16, 21], [-17, 15],
  ],
  // Madagascar
  [[43, -12], [45, -16], [47, -20], [47, -25], [44, -25], [43, -20], [43, -12]],
  // Europe
  [
    [-9, 43], [-9, 38], [-5, 36], [0, 38], [3, 42], [7, 44], [10, 44],
    [13, 45], [13, 40], [17, 40], [19, 40], [22, 36], [24, 35], [27, 37],
    [29, 41], [28, 43], [30, 45], [35, 47], [38, 47], [40, 44], [45, 42],
    [47, 40], [45, 40], [38, 44], [35, 45], [30, 50], [27, 53], [22, 54],
    [19, 54], [15, 54], [12, 56], [10, 58], [9, 62], [5, 61], [5, 58],
    [10, 57], [9, 55], [5, 53], [4, 51], [2, 51], [-1, 50], [-5, 48],
    [-2, 48], [-1, 46], [-2, 43], [-9, 43],
  ],
  // Great Britain / Ireland
  [[-5, 58], [-3, 58], [0, 53], [-2, 50], [-6, 51], [-8, 54], [-5, 58]],
  // Asia (Middle East through Siberia, China, SE Asia)
  [
    [27, 37], [35, 37], [40, 37], [45, 38], [48, 38], [50, 30], [56, 26],
    [60, 25], [65, 25], [68, 24], [70, 21], [72, 19], [73, 15], [76, 10],
    [78, 8], [80, 7], [80, 13], [83, 17], [85, 20], [88, 22], [90, 22],
    [92, 21], [95, 20], [98, 15], [100, 13], [102, 10], [104, 10],
    [106, 10], [105, 20], [108, 20], [110, 20], [115, 23], [120, 23],
    [122, 25], [121, 31], [122, 30], [120, 32], [120, 36], [122, 37],
    [124, 38], [126, 38], [129, 36], [130, 35], [132, 34], [135, 35],
    [140, 40], [140, 42], [142, 43], [145, 43], [142, 45], [135, 45],
    [130, 43], [126, 40], [122, 40], [118, 40], [115, 40], [110, 42],
    [105, 42], [100, 42], [95, 44], [90, 45], [85, 48], [80, 50], [75, 52],
    [70, 54], [65, 55], [60, 58], [55, 60], [50, 62], [45, 65], [40, 66],
    [35, 66], [30, 63], [28, 60], [30, 55], [30, 50], [27, 45], [27, 40],
    [27, 37],
  ],
  // Japan (rough)
  [[130, 34], [132, 33], [134, 34], [136, 35], [139, 36], [141, 39], [140, 41], [138, 38], [135, 36], [132, 35], [130, 34]],
  // Indonesia / SE Asia islands (rough archipelago blob)
  [[95, 5], [98, 3], [103, 1], [108, -3], [113, -7], [118, -8], [120, -5], [117, -2], [110, 0], [103, 3], [98, 5], [95, 5]],
  // Philippines
  [[121, 18], [123, 15], [125, 10], [123, 7], [121, 10], [120, 15], [121, 18]],
  // Australia
  [
    [113, -22], [114, -26], [115, -32], [118, -35], [122, -34], [126, -32],
    [129, -32], [132, -32], [136, -35], [138, -35], [140, -38], [144, -38],
    [146, -39], [148, -38], [150, -37], [153, -28], [153, -25], [150, -22],
    [148, -20], [145, -17], [143, -14], [141, -13], [137, -16], [135, -15],
    [132, -14], [130, -13], [128, -15], [126, -15], [124, -16], [122, -18],
    [120, -19], [115, -20], [113, -22],
  ],
  // New Zealand
  [[173, -35], [175, -37], [177, -39], [176, -41], [173, -41], [171, -43], [169, -44], [171, -41], [172, -38], [173, -35]],
];

/** Equirectangular projection: lon/lat degrees -> SVG x/y within a WxH viewBox. */
export function project([lon, lat]: LonLat, width: number, height: number): [number, number] {
  const x = ((lon + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return [x, y];
}

function pointInPolygon(x: number, y: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function seeded(n: number) {
  const a = (n * 48271) % 2147483647;
  return (Math.abs(a) % 10000) / 10000;
}

export interface WorldDot {
  x: number;
  y: number;
  major: boolean;
}

/**
 * Generates a deterministic dot-matrix fill for every continent polygon,
 * projected into a `width`x`height` SVG viewBox. Deterministic (no
 * Math.random) so server and client render identical output.
 */
export function generateWorldDots(width: number, height: number, spacing = 9): WorldDot[] {
  const projected = CONTINENTS.map((poly) => poly.map((p) => project(p, width, height)));
  const bboxes = projected.map((poly) => {
    const xs = poly.map((p) => p[0]);
    const ys = poly.map((p) => p[1]);
    return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
  });

  const dots: WorldDot[] = [];
  let idx = 0;
  for (let gy = 0; gy < height; gy += spacing) {
    const rowOffset = (Math.floor(gy / spacing) % 2) * (spacing / 2);
    for (let gx = 0; gx < width; gx += spacing) {
      const jx = (seeded(idx) - 0.5) * spacing * 0.5;
      const jy = (seeded(idx + 9001) - 0.5) * spacing * 0.5;
      const x = gx + rowOffset + jx;
      const y = gy + jy;
      idx++;

      for (let p = 0; p < projected.length; p++) {
        const bb = bboxes[p];
        if (x < bb.minX || x > bb.maxX || y < bb.minY || y > bb.maxY) continue;
        if (pointInPolygon(x, y, projected[p])) {
          dots.push({ x, y, major: idx % 11 === 0 });
          break;
        }
      }
    }
  }
  return dots;
}
