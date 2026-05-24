import { PALETTE } from "./palette";

/** Broad eras of Survivor history, used to color and group seasons. */
export type Era = "classic" | "middle" | "modern" | "new";

/** Visual treatment for each era — color (background tint) and label. */
export const ERA_STYLES: Record<Era, { color: string; label: string }> = {
  classic: { color: PALETTE.terracotta, label: "Classic Era" },
  middle: { color: PALETTE.olive, label: "Mid Era" },
  modern: { color: PALETTE.slate, label: "Modern Era" },
  new: { color: PALETTE.mustard, label: "New Era" },
};

/** Classify a season number into an era. */
export function getEra(season: number): Era {
  if (season <= 20) return "classic";
  if (season <= 34) return "middle";
  if (season <= 42) return "modern";
  return "new";
}
