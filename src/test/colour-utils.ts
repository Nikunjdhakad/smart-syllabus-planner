/**
 * Compute WCAG 2.1 contrast ratio between two CSS colour strings.
 * Supports oklch(...) notation (with optional alpha for compositing over white).
 * Uses colorjs.io for accurate OKLCH → sRGB → relative-luminance conversion.
 */
import Color from "colorjs.io";

/**
 * Parse a colour string that may include alpha compositing notation
 * e.g. "oklch(0.52 0.22 270 / 0.15)" blended over white.
 */
function resolveColor(raw: string): Color {
  // If the string has an explicit alpha and is meant to be seen on a surface,
  // composite it over white (light-mode default) before computing luminance.
  const trimmed = raw.trim();
  const hasSlashAlpha = /\/\s*[\d.]+\s*\)$/.test(trimmed);

  if (hasSlashAlpha) {
    const fg = new Color(trimmed);
    const alpha = fg.alpha ?? 1;
    if (alpha < 1) {
      // Composite over white
      const white = new Color("oklch(1 0 0)");
      return fg.mix(white, 1 - alpha, { space: "srgb" }) as Color;
    }
  }
  return new Color(trimmed);
}

/**
 * Relative luminance per WCAG 2.1 definition.
 */
function relativeLuminance(color: Color): number {
  const [r, g, b] = color.to("srgb").coords as [number, number, number];
  const linearize = (v: number) => {
    const abs = Math.abs(v);
    return abs <= 0.04045 ? abs / 12.92 : Math.pow((abs + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * WCAG 2.1 contrast ratio between two colour strings.
 * Returns a value ≥ 1 (1 = no contrast, 21 = black on white).
 */
export function computeContrastRatio(fg: string, bg: string): number {
  const fgColor = resolveColor(fg);
  const bgColor = resolveColor(bg);
  const L1 = relativeLuminance(fgColor);
  const L2 = relativeLuminance(bgColor);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}
