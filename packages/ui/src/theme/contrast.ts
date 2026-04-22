/** WCAG 2.2 relative luminance + contrast ratio math. Pure function; testable. */

const HEX_RADIX = 16;
const MAX_CHANNEL = 255;
const LOW_CHANNEL_THRESHOLD = 0.03928;
const LOW_CHANNEL_DIVISOR = 12.92;
const GAMMA_OFFSET = 0.055;
const GAMMA_DIVISOR = 1.055;
const GAMMA_EXPONENT = 2.4;
const LUMINANCE_OFFSET = 0.05;
const R_COEF = 0.2126;
const G_COEF = 0.7152;
const B_COEF = 0.0722;

const parseHex = (hex: string): readonly [number, number, number] => {
  const clean = hex.replace(/^#/, "");
  const expanded =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const r = parseInt(expanded.slice(0, 2), HEX_RADIX);
  const g = parseInt(expanded.slice(2, 4), HEX_RADIX);
  const b = parseInt(expanded.slice(4, 6), HEX_RADIX);
  return [r, g, b];
};

const channel = (v: number): number => {
  const sr = v / MAX_CHANNEL;
  if (sr <= LOW_CHANNEL_THRESHOLD) {
    return sr / LOW_CHANNEL_DIVISOR;
  }
  return Math.pow((sr + GAMMA_OFFSET) / GAMMA_DIVISOR, GAMMA_EXPONENT);
};

const relativeLuminance = (hex: string): number => {
  const [r, g, b] = parseHex(hex);
  return R_COEF * channel(r) + G_COEF * channel(g) + B_COEF * channel(b);
};

/** Contrast ratio per WCAG 2.2. Always ≥ 1. */
export const contrastRatio = (fg: string, bg: string): number => {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + LUMINANCE_OFFSET) / (darker + LUMINANCE_OFFSET);
};

export const ContrastTarget = {
  AA: "AA",
  AAA: "AAA"
} as const;
export type ContrastTarget = (typeof ContrastTarget)[keyof typeof ContrastTarget];

export type ContrastRequirement = {
  readonly target: ContrastTarget;
  /** 4.5 for AA normal text, 3.0 for AA large text, 7.0 for AAA normal, 4.5 for AAA large. */
  readonly normalMin: number;
  readonly largeMin: number;
};

export const AA: ContrastRequirement = {
  target: ContrastTarget.AA,
  normalMin: 4.5,
  largeMin: 3.0
};
export const AAA: ContrastRequirement = {
  target: ContrastTarget.AAA,
  normalMin: 7.0,
  largeMin: 4.5
};
