/**
 * Season 50 challenge results. Used by the player detail panel to show what
 * each player has won. Populate as you watch back through the episodes.
 *
 * For tribe challenges, list every member of the winning tribe in `winners`.
 * Pre-merge and post-merge are both represented the same way.
 */
export interface Challenge {
  /** Stable kebab-case slug, e.g. `"ep03-immunity"`. */
  id: string;
  episode: number;
  /** Optional name of the challenge (e.g. "Slip Slidin' Away"). */
  title?: string;
  type: "reward" | "immunity" | "individual-immunity" | "individual-reward";
  /** Cast ids of every winner. For tribe challenges, the whole tribe. */
  winners: string[];
}

export const challenges: Challenge[] = [];

/** Lookup: every challenge a given player has won. */
export function challengesWonBy(castId: string): Challenge[] {
  return challenges.filter((c) => c.winners.includes(castId));
}
