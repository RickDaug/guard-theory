/**
 * WCAG 2.2 relative luminance and contrast ratio.
 *
 * The design system displays ratios computed by this module rather than ratios
 * someone typed into a comment, so a token change that breaks contrast shows up
 * on the page and in the test suite instead of surviving to production.
 */

export type Rgb = { r: number; g: number; b: number };

export function hexToRgb(hex: string): Rgb {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;

  if (full.length !== 6 || !/^[0-9a-f]{6}$/i.test(full)) {
    throw new Error(`Not a hex colour: ${hex}`);
  }

  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  };
}

/** Per WCAG: linearise each channel, then weight for human luminance response. */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const linear = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];

  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

export type TextSize = "normal" | "large";

/**
 * AA thresholds. "large" means >=24px, or >=18.66px when bold — anything else
 * is "normal" and needs 4.5:1.
 */
export function meetsAA(ratio: number, size: TextSize = "normal"): boolean {
  return ratio >= (size === "large" ? 3 : 4.5);
}

export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}
