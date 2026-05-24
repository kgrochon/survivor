/**
 * Mid-century design tokens consumed by JS-side inline styles. CSS-only
 * styles read from the `--color-*` custom properties in `global.css`;
 * keep the two in sync if you add or rename a token.
 */
export const PALETTE = {
  bg: "#F5EDE0",
  bgAlt: "#EDE3D1",
  ink: "#1A1A18",
  cream: "#FAF6EE",
  terracotta: "#C1533C",
  mustard: "#D4982A",
  olive: "#6dad5a",
  slate: "#799db5",
  warmGray: "#8C8578",
  lightStroke: "#D4CABB",
} as const;
