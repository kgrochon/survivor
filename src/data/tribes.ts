/** The four valid tribes for Season 50 — `Merge` is a phase sentinel for now. */
export type TribeName = "Cila" | "Vatu" | "Kalo" | "Merge";

/** Paint color for each tribe, used by every view to tint cards/badges. */
/**
 * Tribe flats, drawn from the show's logo. Each clears 3:1 against the white
 * tile padding (WCAG 1.4.11) so the colored photo field stays a perceivable
 * graphic: Cila is the logo blue untouched, Vatu is the logo yellow darkened
 * (at #ffcf00 it is 1.5:1 on white and simply disappears).
 *
 * None of them may look like the green selected/hover state, or a Kalo tile
 * would read as selected. That rules out the logo green here — it earns more
 * as the affordance — so Kalo takes a dark slate-navy, far enough from both
 * the bright Cila blue and the green to stay its own category.
 */
export const TRIBE_COLORS: Record<TribeName, string> = {
  Cila: "#0084d1",
  Vatu: "#ae8200",
  Kalo: "#2d4a63",
  Merge: "#7a8894",
};

/** Canonical display order for the tribes, used when rendering legends. */
export const TRIBES: readonly TribeName[] = ["Cila", "Vatu", "Kalo", "Merge"];
