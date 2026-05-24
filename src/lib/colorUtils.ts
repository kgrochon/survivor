/**
 * Color helpers shared by the survivor views. Kept here so the picky
 * regex-and-relative-luminance logic only lives in one place.
 */

/**
 * Parse a CSS color into an `[r, g, b]` triple. Handles `#rgb`, `#rrggbb`,
 * legacy `rgb(r, g, b)` / `rgba(...)`, and the modern space-separated
 * `rgb(r g b)` syntax. Returns `null` for anything else.
 */
export function parseColorToRgb(
  color: string,
): [number, number, number] | null {
  const c = color.trim();
  if (c.startsWith("#")) {
    const h = c.slice(1);
    const full =
      h.length === 3
        ? h
            .split("")
            .map((ch) => ch + ch)
            .join("")
        : h;
    if (full.length !== 6) return null;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ];
  }
  const space = c.match(/rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  if (space) return [Number(space[1]), Number(space[2]), Number(space[3])];
  const comma = c.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (comma) return [Number(comma[1]), Number(comma[2]), Number(comma[3])];
  return null;
}

/** Dark text on light fills, light text on dark fills (for tribe highlights). */
export function readableOnBackground(bg: string): "#ffffff" | "#1A1A18" {
  const rgb = parseColorToRgb(bg);
  if (!rgb) return "#1A1A18";
  const [r, g, b] = rgb;
  const y = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return y > 0.55 ? "#1A1A18" : "#ffffff";
}
