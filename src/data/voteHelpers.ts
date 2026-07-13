// Survivor Season 50 — vote query helpers
// Import the votes data and Vote type from votes.ts.
//
//   import { votes } from "./votes";
//   import { votesAgainst, whoVotedFor, finaleResult } from "./voteHelpers";
//
// Terminology:
//   - A "counted" vote is one that was actually tallied: not ineligible, not nullified.
//   - "elimination" votes are normal tribal votes; "finale" votes are the jury voting FOR a winner.
//   - A single tribal council is identified by (episode, tribal, council, round). Some episodes
//     have multiple councils (5, 6, 8, 11, 12) and some councils have a revote round (11).

import { type Vote, votes as allVotes } from "./votes";
import { eliminated } from "./connections";

// ----- core predicates -------------------------------------------------------

/** A vote that was actually counted toward the tally (excludes ineligible & nullified & blank). */
export function isCounted(v: Vote): boolean {
  return !v.ineligible && !v.nullified && v.target !== "";
}

/** True for finale (jury-for-winner) votes. */
export function isFinale(v: Vote): boolean {
  return v.voteType === "finale";
}

/** True for normal elimination votes (everything not flagged finale). */
export function isElimination(v: Vote): boolean {
  return v.voteType !== "finale";
}

// ----- council identity ------------------------------------------------------

/** Stable string key identifying one distinct voting round. */
export function councilKey(v: Vote): string {
  return [v.episode, v.tribal, v.council ?? "-", v.round ?? "-", v.voteType ?? "elimination"].join("|");
}

export interface Council {
  key: string;
  episode: number;
  tribal: string;
  council?: number;
  round?: number;
  voteType: "elimination" | "finale";
  votes: Vote[];
}

/** Group the full vote list into distinct councils/rounds. */
export function listCouncils(source: Vote[] = allVotes): Council[] {
  const map = new Map<string, Council>();
  for (const v of source) {
    const key = councilKey(v);
    let c = map.get(key);
    if (!c) {
      c = {
        key,
        episode: v.episode,
        tribal: v.tribal,
        council: v.council,
        round: v.round,
        voteType: v.voteType ?? "elimination",
        votes: [],
      };
      map.set(key, c);
    }
    c.votes.push(v);
  }
  return [...map.values()];
}

// ----- votes-against (who targeted a given player) ---------------------------

/**
 * All ELIMINATION votes cast against `playerId`.
 * By default only counted votes; pass { includeUncounted: true } to include
 * nullified votes (idol'd out) too.
 */
export function votesAgainst(
  playerId: string,
  opts: { includeUncounted?: boolean; source?: Vote[] } = {}
): Vote[] {
  const source = opts.source ?? allVotes;
  return source.filter(
    (v) =>
      isElimination(v) &&
      v.target === playerId &&
      (opts.includeUncounted ? v.target !== "" : isCounted(v))
  );
}

/** Count of counted elimination votes received by a player across the whole game. */
export function voteCountAgainst(playerId: string, source: Vote[] = allVotes): number {
  return votesAgainst(playerId, { source }).length;
}

/** List of voter ids who ever cast a counted elimination vote against `playerId`. */
export function whoVotedAgainst(playerId: string, source: Vote[] = allVotes): string[] {
  return votesAgainst(playerId, { source }).map((v) => v.voter);
}

// ----- votes-cast (who a given player voted for) -----------------------------

/** All ELIMINATION votes cast BY `voterId` (targets they voted for). */
export function votesCastBy(voterId: string, source: Vote[] = allVotes): Vote[] {
  return source.filter((v) => isElimination(v) && v.voter === voterId && v.target !== "");
}

/** List of target ids `voterId` voted for, in order. Includes duplicates (e.g. extra votes). */
export function whoVotedFor(voterId: string, source: Vote[] = allVotes): string[] {
  return votesCastBy(voterId, source).map((v) => v.target);
}

// ----- per-council tally -----------------------------------------------------

/**
 * Tally of counted votes per target for one council (identified by its key,
 * from councilKey() or listCouncils()). Returns a map of targetId -> count,
 * sorted descending by count.
 */
export function tallyCouncil(key: string, source: Vote[] = allVotes): Array<[string, number]> {
  const counts = new Map<string, number>();
  for (const v of source) {
    if (councilKey(v) !== key) continue;
    if (!isCounted(v)) continue;
    counts.set(v.target, (counts.get(v.target) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

/** The player who received the most counted votes at a council (the boot). Ties return all leaders. */
export function boot(key: string, source: Vote[] = allVotes): string[] {
  const tally = tallyCouncil(key, source);
  if (tally.length === 0) return [];
  const max = tally[0][1];
  return tally.filter(([, c]) => c === max).map(([t]) => t);
}

// ----- ballot reconstruction -------------------------------------------------

/**
 * Reconstruct physical ballots for a voter (groups multi-target ballots like the
 * ep8 paired double-elimination or Cirie's extra votes). Rows without a `ballot`
 * id are treated as their own single-target ballot.
 */
export function ballotsBy(voterId: string, source: Vote[] = allVotes): Vote[][] {
  const rows = source.filter((v) => v.voter === voterId && v.target !== "");
  const grouped = new Map<string, Vote[]>();
  let solo = 0;
  for (const v of rows) {
    const id = v.ballot ?? `__solo_${solo++}`;
    (grouped.get(id) ?? grouped.set(id, []).get(id)!).push(v);
  }
  return [...grouped.values()];
}

// ----- finale ----------------------------------------------------------------

export interface FinaleResult {
  tally: Array<[string, number]>; // finalist -> jury votes, descending
  winner: string | null;
  jurors: string[]; // juror ids
}

/** The jury-vote result for the winner. */
export function finaleResult(source: Vote[] = allVotes): FinaleResult {
  const finale = source.filter(isFinale);
  const counts = new Map<string, number>();
  for (const v of finale) counts.set(v.target, (counts.get(v.target) ?? 0) + 1);
  const tally = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return {
    tally,
    winner: tally.length ? tally[0][0] : null,
    jurors: finale.map((v) => v.voter),
  };
}

/** Which finalist a given juror voted for, or null if they weren't on the jury. */
export function juryVoteOf(jurorId: string, source: Vote[] = allVotes): string | null {
  const v = source.find((x) => isFinale(x) && x.voter === jurorId);
  return v ? v.target : null;
}

// ----- summary utilities -----------------------------------------------------

export interface PlayerVoteSummary {
  id: string;
  votesCast: string[];       // elimination targets they voted for
  votesReceived: number;     // counted elimination votes against them
  votedAgainstBy: string[];  // voters who targeted them (counted)
  juryVoteFor: string | null;// finale vote, if they were a juror
}

/** One-shot summary of a player's voting record. */
export function playerSummary(playerId: string, source: Vote[] = allVotes): PlayerVoteSummary {
  return {
    id: playerId,
    votesCast: whoVotedFor(playerId, source),
    votesReceived: voteCountAgainst(playerId, source),
    votedAgainstBy: whoVotedAgainst(playerId, source),
    juryVoteFor: juryVoteOf(playerId, source),
  };
}

/** All player ids that appear anywhere as a voter or target. */
export function allPlayers(source: Vote[] = allVotes): string[] {
  const set = new Set<string>();
  for (const v of source) {
    if (v.voter) set.add(v.voter);
    if (v.target) set.add(v.target);
  }
  return [...set];
}

// ----- pairwise (one voter → one target) ------------------------------------

/**
 * Elimination votes `voterId` cast against `targetId` across the whole season.
 * Excludes self-votes and blank/ineligible rows. Nullified votes are included —
 * the intent was there even if the idol erased the count.
 */
export function votesFromTo(
  voterId: string,
  targetId: string,
  source: Vote[] = allVotes,
): Vote[] {
  if (voterId === targetId) return [];
  return votesCastBy(voterId, source).filter((v) => v.target === targetId);
}

/** How many elimination votes `voterId` cast against `targetId`. */
export function voteCountFromTo(
  voterId: string,
  targetId: string,
  source: Vote[] = allVotes,
): number {
  return votesFromTo(voterId, targetId, source).length;
}

/**
 * True if `voterId` cast at least one elimination vote against `targetId`
 * AND `targetId` has since left the game. "voted out" from `voterId`'s POV.
 */
export function didVoteOut(
  voterId: string,
  targetId: string,
  source: Vote[] = allVotes,
): boolean {
  if (voteCountFromTo(voterId, targetId, source) === 0) return false;
  return eliminated.some((e) => e.id === targetId);
}
