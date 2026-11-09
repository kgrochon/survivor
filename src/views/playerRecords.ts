// Survivor Season 50 — each castaway's season record, for the cast grid.
//
// Who they have played with before, and how they voted against every
// other castaway, computed once from the vote data.

import { castData } from "../data/cast";
import { voteCountFromTo, didVoteOut } from "../data/voteHelpers";

/** How one player voted against one castmate. */
export interface VoteLensEntry {
  count: number;
  /** True when one of those votes is what sent them home. */
  out: boolean;
}

/** Everything the tree (and the grid's vote-lens) knows about a player. */
export interface PlayerRecord {
  /** Castmates from a prior shared season. */
  castmates: Set<string>;
  /** Castmate id → this player's votes against them. */
  votes: Map<string, VoteLensEntry>;
}

/** DOM ids of the cards in the main pane; the vote-lens descriptions
 *  hang their own ids off the tile's. */
export const castTileId = (id: string) => `cast-${id}`;
export const voteCardId = (id: string) => `vote-${id}`;

/** One record per castaway — computed once; the vote data never changes. */
export function buildPlayerRecords(): Map<string, PlayerRecord> {
  const records = new Map<string, PlayerRecord>();
  for (const p of castData) {
    const mine = new Set(p.seasons.map((s) => s.season));
    const castmates = new Set<string>();
    const votes = new Map<string, VoteLensEntry>();
    for (const other of castData) {
      if (other.id === p.id) continue;
      if (other.seasons.some((s) => mine.has(s.season))) {
        castmates.add(other.id);
      }
      const count = voteCountFromTo(p.id, other.id);
      if (count > 0) {
        votes.set(other.id, { count, out: didVoteOut(p.id, other.id) });
      }
    }
    records.set(p.id, { castmates, votes });
  }
  return records;
}
