import type { MealType } from "@/types/planner";

type Palette = {
  dawnA: string;
  dawnB: string;
  glow: string;
  glassA: string;
  glassB: string;
  lineA: string;
  lineB: string;
};

const SLOT_PALETTES: Record<MealType, Palette> = {
  breakfast: {
    dawnA: "#f7dfbf",
    dawnB: "#f4be98",
    glow: "#fff8e8",
    glassA: "#ffffffa8",
    glassB: "#ffffff63",
    lineA: "#ffffffdd",
    lineB: "#ffe5cd",
  },
  lunch: {
    dawnA: "#c9e4f8",
    dawnB: "#9bcbee",
    glow: "#f5fbff",
    glassA: "#ffffffa6",
    glassB: "#ffffff59",
    lineA: "#ffffffda",
    lineB: "#dceeff",
  },
  dinner: {
    dawnA: "#cbc9f1",
    dawnB: "#a2abe8",
    glow: "#f2efff",
    glassA: "#ffffffa4",
    glassB: "#ffffff57",
    lineA: "#ffffffd8",
    lineB: "#e1ddff",
  },
  snack: {
    dawnA: "#d3eac9",
    dawnB: "#afd9a2",
    glow: "#f7fff2",
    glassA: "#ffffffa3",
    glassB: "#ffffff56",
    lineA: "#ffffffd6",
    lineB: "#e8ffe2",
  },
};

function hashString(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seeded(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function foodSymbol(mealType: MealType, stroke: string, fill: string, x: number, y: number) {
  if (mealType === "breakfast") {
    return `<g transform="translate(${x} ${y})" opacity="0.72">
      <path d="M4 12C8 9 11 6 13 2" stroke="${stroke}" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M7 13C10 10 13 7 16 3" stroke="${stroke}" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M10 14C13 11 16 8 19 4" stroke="${stroke}" stroke-width="1.2" stroke-linecap="round"/>
    </g>`;
  }

  if (mealType === "lunch") {
    return `<g transform="translate(${x} ${y})" opacity="0.72">
      <path d="M12 3C6 6 5 13 10 16C15 19 20 16 21 10C17 11 13 8 12 3Z" fill="${fill}"/>
      <path d="M11 5C12 9 14 12 18 14" stroke="${stroke}" stroke-width="1.1" stroke-linecap="round"/>
    </g>`;
  }

  if (mealType === "dinner") {
    return `<g transform="translate(${x} ${y})" opacity="0.72">
      <path d="M4 14C4 10 7 8 12 8C17 8 20 10 20 14" stroke="${stroke}" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M6 15H18" stroke="${stroke}" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M9 6C9 4 10 3 11 2" stroke="${stroke}" stroke-width="1.1" stroke-linecap="round"/>
      <path d="M13 6C13 4 14 3 15 2" stroke="${stroke}" stroke-width="1.1" stroke-linecap="round"/>
    </g>`;
  }

  return `<g transform="translate(${x} ${y})" opacity="0.72">
    <circle cx="11" cy="10" r="6" fill="${fill}"/>
    <path d="M16 6C18 4 20 4 22 5" stroke="${stroke}" stroke-width="1.1" stroke-linecap="round"/>
    <path d="M8 10H14" stroke="${stroke}" stroke-width="1.1" stroke-linecap="round"/>
  </g>`;
}

export function buildMealCardArtUrl(args: { mealId: string; mealType: MealType; seed: number }) {
  const palette = SLOT_PALETTES[args.mealType];
  const rand = seeded(hashString(`${args.mealId}:${args.seed}:${args.mealType}`));

  const c1x = Math.round(18 + rand() * 24);
  const c1y = Math.round(20 + rand() * 20);
  const c1r = Math.round(26 + rand() * 16);

  const c2x = Math.round(58 + rand() * 22);
  const c2y = Math.round(18 + rand() * 24);
  const c2r = Math.round(20 + rand() * 18);

  const c3x = Math.round(40 + rand() * 26);
  const c3y = Math.round(52 + rand() * 12);
  const c3r = Math.round(16 + rand() * 12);

  const ribbonY = Math.round(12 + rand() * 8);
  const arcY = Math.round(36 + rand() * 10);
  const waveA = Math.round(10 + rand() * 14);
  const waveB = Math.round(58 + rand() * 14);
  const sheenX = Math.round(8 + rand() * 16);
  const symbolX = Math.round(66 + rand() * 8);
  const symbolY = Math.round(8 + rand() * 8);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 72" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.dawnA}" />
      <stop offset="100%" stop-color="${palette.dawnB}" />
    </linearGradient>
    <radialGradient id="ambient" cx="0" cy="0" r="1" gradientTransform="translate(28 9) rotate(38) scale(95 62)">
      <stop offset="0%" stop-color="${palette.glow}"/>
      <stop offset="100%" stop-color="#ffffff00"/>
    </radialGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${palette.glassA}" />
      <stop offset="100%" stop-color="${palette.glassB}" />
    </linearGradient>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${palette.lineA}" />
      <stop offset="100%" stop-color="${palette.lineB}" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="100" height="72" rx="14" fill="url(#bg)"/>
  <rect x="0" y="0" width="100" height="72" rx="14" fill="url(#ambient)"/>

  <circle cx="${c1x}" cy="${c1y}" r="${c1r}" fill="url(#glass)"/>
  <circle cx="${c2x}" cy="${c2y}" r="${c2r}" fill="url(#glass)"/>
  <circle cx="${c3x}" cy="${c3y}" r="${c3r}" fill="url(#glass)"/>

  <path d="M${waveA} ${arcY}C${waveA + 10} ${arcY - 8} ${waveA + 22} ${arcY - 8} ${waveA + 32} ${arcY}" stroke="url(#line)" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M${waveB} ${arcY + 6}C${waveB + 9} ${arcY - 2} ${waveB + 20} ${arcY - 2} ${waveB + 29} ${arcY + 6}" stroke="url(#line)" stroke-width="1.4" stroke-linecap="round"/>

  ${foodSymbol(args.mealType, palette.lineA, palette.glassA, symbolX, symbolY)}

  <rect x="${sheenX}" y="${ribbonY}" width="74" height="10" rx="5" fill="url(#glass)"/>
  <rect x="0" y="0" width="100" height="72" rx="14" stroke="#ffffffb8" stroke-width="0.8"/>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}
