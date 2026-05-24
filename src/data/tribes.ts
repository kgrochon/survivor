/** The four valid tribes for Season 50 — `Merge` is a phase sentinel for now. */
export type TribeName = "Cila" | "Vatu" | "Kalo" | "Merge";

/** Paint color for each tribe, used by every view to tint cards/badges. */
export const TRIBE_COLORS: Record<TribeName, string> = {
  Cila: "rgb(234 105 51)",
  Vatu: "rgb(230 19 100)",
  Kalo: "rgb(47 141 126)",
  Merge: "#D4982A",
};

/** Canonical display order for the tribes, used when rendering legends. */
export const TRIBES: readonly TribeName[] = ["Cila", "Vatu", "Kalo", "Merge"];
