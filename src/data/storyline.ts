// Survivor Season 50 — the storyline: every player's path through the
// season as one thread, left to right, one column per tribal council.
//
// Pure data + layout; StorylineView draws it. Threads bundle into groups
// (tribe, merge team, Exile, jury) that change between columns, which is
// why this isn't a tree: a post-swap tribe draws from all three starting
// tribes, so a node would need more than one parent.
//
//   start ─ E1 ─ E2 ┊ E3 ─ E4 ─ E5 ─ E5 ┊ E6 ×3 ┊ E7 … E10 ┊ E11 ×3 ┊ E12 ×2 ─ E13 ─ Fire ─ FTC
//   original tribes  swap                teams    merge      teams    merge

import { castData, tribeAtEpisode, type CastMember } from "./cast";
import { TRIBE_COLORS, type TribeName } from "./tribes";
import { eliminated, findEliminationRecord } from "./connections";
import {
  type Council,
  finaleResult,
  isCounted,
  listCouncils,
  tallyCouncil,
} from "./voteHelpers";

// ----- phases & groups -------------------------------------------------------

export type PhaseId =
  | "original"
  | "swap"
  | "teams6"
  | "merge"
  | "teams11"
  | "final";

export const PHASES: ReadonlyArray<{ id: PhaseId; label: string }> = [
  { id: "original", label: "Starting tribes" },
  { id: "swap", label: "Swap" },
  { id: "teams6", label: "Merge · teams" },
  { id: "merge", label: "Merge" },
  { id: "teams11", label: "Teams" },
  { id: "final", label: "Endgame" },
];

function phaseOf(episode: number, council?: Council): PhaseId {
  if (episode <= 2) return "original";
  if (episode <= 5) return "swap";
  if (episode === 6) return "teams6";
  if (episode <= 10) return "merge";
  if (episode === 11 && council?.voteType !== "finale") return "teams11";
  return "final";
}

export type GroupKind =
  | "tribe"
  | "team"
  | "exile"
  | "immune"
  | "merge"
  | "jury";

export interface StoryGroup {
  /** Unique per instance: post-swap Cila is a different band than day-1 Cila. */
  key: string;
  label: string;
  kind: GroupKind;
  color: string;
}

/**
 * Ep6 and ep11 split the merged tribe into teams that went to separate
 * tribals. The rosters can't be read off votes.ts alone — Ozzy and Rizo
 * sat out ep6 on Exile Island, and Jonathan's ep11 immunity put him at
 * both councils — so they're written down here.
 */
const EP6_TEAMS: Record<string, string[]> = {
  Orange: [
    "chrissy-hofbeck",
    "jonathan-young",
    "stephenie-lagrossa-kendrick",
    "kamilla-karthigesu",
    "tiffany-ervin",
  ],
  Purple: [
    "aubry-bracco",
    "christian-hubicki",
    "joe-hunter",
    "rick-devens",
    "genevieve-mushaluk",
  ],
  Blue: [
    "cirie-fields",
    "coach-wade",
    "dee-valladares",
    "emily-flippen",
    "colby-donaldson",
  ],
  Exile: ["ozzy-lusth", "rizo-velovic"],
};

const EP11_TEAMS: Record<string, string[]> = {
  Magenta: ["cirie-fields", "emily-flippen", "rick-devens", "tiffany-ervin"],
  Immune: ["jonathan-young"],
  Teal: ["ozzy-lusth", "aubry-bracco", "joe-hunter", "rizo-velovic"],
};

/** Team name for each split council, keyed `episode|council`. */
const COUNCIL_TEAM: Record<string, string> = {
  "6|1": "Orange",
  "6|2": "Purple",
  "6|3": "Blue",
  "11|1": "Magenta",
  "11|2": "Teal",
};

function teamOf(teams: Record<string, string[]>, id: string): string {
  for (const [team, ids] of Object.entries(teams)) {
    if (ids.includes(id)) return team;
  }
  throw new Error(`storyline: ${id} is on no team`);
}

/** Vertical order of groups within a column, top to bottom. */
const GROUP_ORDER = [
  "Cila",
  "Vatu",
  "Kalo",
  "Orange",
  "Purple",
  "Blue",
  "Exile",
  "Magenta",
  "Immune",
  "Teal",
  "Merge",
  "Jury",
];

function makeGroup(name: string, phase: PhaseId): StoryGroup {
  if (name === "Jury") {
    return {
      key: "jury",
      label: "Jury",
      kind: "jury",
      color: TRIBE_COLORS.Merge,
    };
  }
  if (name === "Cila" || name === "Vatu" || name === "Kalo") {
    return {
      key: `${name}@${phase}`,
      label: name,
      kind: "tribe",
      color: TRIBE_COLORS[name],
    };
  }
  if (name === "Merge") {
    return {
      key: `Merge@${phase}`,
      label: "Merge",
      kind: "merge",
      color: TRIBE_COLORS.Merge,
    };
  }
  const kind: GroupKind =
    name === "Exile" ? "exile" : name === "Immune" ? "immune" : "team";
  return {
    key: `${name}@${phase}`,
    label:
      kind === "team"
        ? `${name} team`
        : name === "Exile"
          ? "Exile Island"
          : name,
    kind,
    color: TRIBE_COLORS.Merge,
  };
}

// ----- columns ---------------------------------------------------------------

export type ColumnKind = "start" | "council" | "fire" | "final";

export interface StoryColumn {
  index: number;
  kind: ColumnKind;
  episode: number;
  phase: PhaseId;
  /** "E5", "FTC". */
  label: string;
  /** "Cila", "Orange", "R1", "Fire". */
  sublabel: string;
  council?: Council;
  /** Counted votes per target, descending (jury votes on the FTC column). */
  tally: Array<[string, number]>;
  /** Players who left the game at this column. */
  exits: string[];
  /** Groups with a player at this tribal (ep11 adds the immune Jonathan). */
  attending: string[];
  /** A tied first round, folded into the revote's column (ep11). */
  priorRound?: { council: Council; tally: Array<[string, number]> };
  /** Players still in the game here (leavers included), by starting tribe. */
  remaining: Record<StartTribe, number>;
}

export type StartTribe = Exclude<TribeName, "Merge">;
export const START_TRIBES: readonly StartTribe[] = ["Cila", "Vatu", "Kalo"];
const noOne = (): Record<StartTribe, number> => ({ Cila: 0, Vatu: 0, Kalo: 0 });

function buildColumns(): StoryColumn[] {
  const councils = listCouncils();
  const out: Omit<StoryColumn, "index">[] = [
    {
      kind: "start",
      episode: 1,
      phase: "original",
      label: "Day 1",
      sublabel: "",
      tally: [],
      exits: [],
      attending: [],
      remaining: noOne(),
    },
  ];

  // A tied round gets no column of its own: it rides along on the revote
  // that settled it, so every council column sends someone home.
  const sameCouncil = (a: Council, b: Council) =>
    a.episode === b.episode && a.tribal === b.tribal && a.council === b.council;
  const revoted = (c: Council) =>
    councils.some((o) => sameCouncil(o, c) && (o.round ?? 0) > (c.round ?? 0));

  for (const c of councils) {
    if (c.voteType === "finale" || revoted(c)) continue;
    const prior = councils.find(
      (o) => sameCouncil(o, c) && (o.round ?? 0) === (c.round ?? 0) - 1,
    );
    const team = COUNCIL_TEAM[`${c.episode}|${c.council}`];
    const tribe = c.tribal[0].toUpperCase() + c.tribal.slice(1);
    const sublabel = team ?? tribe;
    out.push({
      kind: "council",
      episode: c.episode,
      phase: phaseOf(c.episode, c),
      label: `E${c.episode}`,
      sublabel,
      council: c,
      tally: tallyCouncil(c.key),
      exits: [],
      attending: [],
      remaining: noOne(),
      priorRound: prior
        ? { council: prior, tally: tallyCouncil(prior.key) }
        : undefined,
    });
  }

  out.push({
    kind: "fire",
    episode: 13,
    phase: "final",
    label: "E13",
    sublabel: "Fire",
    tally: [],
    exits: [],
    attending: [],
    remaining: noOne(),
  });

  const finale = councils.find((c) => c.voteType === "finale");
  out.push({
    kind: "final",
    episode: 13,
    phase: "final",
    label: "FTC",
    sublabel: "Jury vote",
    council: finale,
    tally: finaleResult().tally,
    exits: [],
    attending: [],
    remaining: noOne(),
  });

  const columns = out.map((c, index) => ({ ...c, index }));

  for (const e of eliminated) {
    let col: StoryColumn | undefined;
    if (e.type === "tribalCouncil") {
      col = columns.find(
        (c) =>
          c.kind === "council" &&
          c.episode === e.episode &&
          topOf(c.tally).includes(e.id),
      );
    } else if (e.type === "fire") {
      col = columns.find((c) => c.kind === "fire");
    } else if (e.type === "injury") {
      col = columns.find((c) => c.kind === "council" && c.episode >= e.episode);
    } else {
      col = columns.find((c) => c.kind === "final");
    }
    if (!col) throw new Error(`storyline: no column for ${e.id}'s exit`);
    col.exits.push(e.id);
  }

  return columns;
}

/** Leaders of a tally — every name tied for the most votes. */
function topOf(tally: Array<[string, number]>): string[] {
  if (tally.length === 0) return [];
  // The ep8 paired ballot sent two people home with the same count.
  const max = tally[0][1];
  return tally.filter(([, n]) => n === max).map(([id]) => id);
}

// ----- threads ---------------------------------------------------------------

/**
 * How a player's vote landed at a council they attended.
 *  - boot:      voted for someone who went home here
 *  - miss:      voted for someone who stayed
 *  - nullified: their vote was cast but an idol cancelled it
 *  - none:      no vote (Shot in the Dark, or a lost/stolen vote)
 */
export type VoteState = "boot" | "miss" | "nullified" | "none";

export type ExitKind = "voted" | "injury" | "fire" | "finalist" | "winner";

export interface StoryStop {
  column: number;
  group: string;
  /** Present only at councils this player attended. */
  vote?: {
    state: VoteState;
    /** Every name they wrote, in ballot order; repeats for extra/stolen votes. */
    targets: Array<{ id: string; nullified: boolean }>;
    /** Counted votes against them here. */
    received: number;
    /** Votes against them an idol cancelled. */
    cancelled: number;
  };
  /** Set on the column where they left the game. */
  exit?: ExitKind;
  /** On the jury: dotted, out of play. */
  juror?: boolean;
  /** At FTC, a juror's thread runs into the finalist they voted for. */
  convergeTo?: string;
}

export interface StoryThread {
  id: string;
  name: string;
  firstName: string;
  photo: string;
  startTribe: StartTribe;
  color: string;
  stops: StoryStop[];
  outcome: ExitKind;
}

function groupNameAt(player: CastMember, col: StoryColumn): string {
  switch (col.phase) {
    case "original":
    case "swap":
      return tribeAtEpisode(player.tribeJourney, col.episode);
    case "teams6":
      return teamOf(EP6_TEAMS, player.id);
    case "teams11":
      return teamOf(EP11_TEAMS, player.id);
    default:
      return "Merge";
  }
}

function voteAt(id: string, col: StoryColumn): StoryStop["vote"] {
  if (!col.council || col.kind !== "council") return undefined;
  const rows = col.council.votes;
  const mine = rows.filter((v) => v.voter === id);
  if (mine.length === 0) return undefined;

  const received = rows.filter((v) => v.target === id && isCounted(v)).length;
  const cancelled = rows.filter((v) => v.target === id && v.nullified).length;
  const targets = mine
    .filter((v) => v.target !== "")
    .map((v) => ({ id: v.target, nullified: !!v.nullified }));

  let state: VoteState;
  const counted = mine.filter(isCounted);
  if (mine.every((v) => v.ineligible)) state = "none";
  else if (counted.length === 0) state = "nullified";
  else if (counted.some((v) => col.exits.includes(v.target))) state = "boot";
  else state = "miss";

  return { state, targets, received, cancelled };
}

function buildThreads(columns: StoryColumn[]): StoryThread[] {
  const final = columns[columns.length - 1];
  const jury = new Map(
    (final.council?.votes ?? []).map((v) => [v.voter, v.target]),
  );

  return castData.map((p) => {
    const record = findEliminationRecord(p.id);
    const exitCol = columns.find((c) => c.exits.includes(p.id)) ?? final;
    const outcome: ExitKind = !record
      ? "winner"
      : record.type === "tribalCouncil"
        ? "voted"
        : record.type === "jury"
          ? "finalist"
          : record.type;

    const stops: StoryStop[] = [];
    for (const col of columns) {
      if (col.index <= exitCol.index) {
        stops.push({
          column: col.index,
          group: makeGroup(groupNameAt(p, col), col.phase).key,
          vote: voteAt(p.id, col),
          exit: col.index === exitCol.index ? outcome : undefined,
        });
      } else if (jury.has(p.id)) {
        stops.push(
          col.kind === "final"
            ? {
                column: col.index,
                group: "jury",
                juror: true,
                convergeTo: jury.get(p.id),
              }
            : { column: col.index, group: "jury", juror: true },
        );
      }
    }

    const startTribe = p.tribeJourney[0].tribe as StartTribe;
    return {
      id: p.id,
      name: p.name,
      firstName: p.name.split(" ")[0],
      photo: p.photo,
      startTribe,
      color: TRIBE_COLORS[startTribe],
      stops,
      outcome,
    };
  });
}

// ----- layout ----------------------------------------------------------------

export interface LayoutOptions {
  /** Vertical pitch between adjacent threads in a group. */
  lane: number;
  /** Space between groups — room for the group's label. */
  groupGap: number;
  /** y of the first lane. */
  top: number;
}

export interface PlacedGroup extends StoryGroup {
  column: number;
  /** Centre of the first and last lane. */
  y0: number;
  y1: number;
  members: string[];
}

export interface Storyline {
  columns: StoryColumn[];
  threads: StoryThread[];
  /** Column → group placements, top to bottom. */
  groups: PlacedGroup[][];
  /** `${threadId}|${column}` → y. */
  y: Map<string, number>;
  height: number;
  /** The season in one sentence, worded from the counts. */
  takeaway: string;
}

const yKey = (id: string, column: number) => `${id}|${column}`;

/**
 * Place every thread. Groups stack in GROUP_ORDER; inside a group, threads
 * are ordered by the barycentre of their neighbours' positions (a few
 * forward/backward sweeps), which keeps swap and merge crossings down.
 */
export function buildStoryline(opts: LayoutOptions): Storyline {
  const columns = buildColumns();
  const threads = buildThreads(columns);
  const groupInfo = new Map<string, StoryGroup>();
  for (const col of columns) {
    for (const name of GROUP_ORDER) {
      const g = makeGroup(name, col.phase);
      groupInfo.set(g.key, g);
    }
  }
  // Per column: group key → member ids (converging jurors don't take a lane).
  const members: Array<Map<string, string[]>> = columns.map(() => new Map());
  for (const t of threads) {
    for (const s of t.stops) {
      if (s.convergeTo) continue;
      const m = members[s.column];
      (m.get(s.group) ?? m.set(s.group, []).get(s.group)!).push(t.id);
    }
  }
  const sortedGroups = (c: number) =>
    [...members[c].keys()].sort((a, b) => groupRankOf(a) - groupRankOf(b));
  function groupRankOf(key: string): number {
    const g = groupInfo.get(key)!;
    const name =
      g.kind === "team"
        ? g.label.replace(" team", "")
        : g.kind === "exile"
          ? "Exile"
          : g.label;
    return GROUP_ORDER.indexOf(name);
  }

  const convergeOf = new Map<string, string>();
  for (const t of threads) {
    const last = t.stops[t.stops.length - 1];
    if (last.convergeTo) convergeOf.set(t.id, last.convergeTo);
  }

  // Ordinal position of each thread in each column, for the barycentre.
  const rank = (c: number): Map<string, number> => {
    const r = new Map<string, number>();
    let i = 0;
    for (const g of sortedGroups(c)) {
      for (const id of members[c].get(g)!) r.set(id, i++);
    }
    for (const [juror, finalist] of convergeOf) {
      if (c === columns.length - 1 && r.has(finalist))
        r.set(juror, r.get(finalist)!);
    }
    return r;
  };

  const sweep = (c: number, ref: Map<string, number>) => {
    for (const [g, ids] of members[c]) {
      const prev = new Map(ids.map((id, i) => [id, i]));
      members[c].set(
        g,
        [...ids].sort((a, b) => {
          const ka = ref.get(a) ?? prev.get(a)! - 1e3;
          const kb = ref.get(b) ?? prev.get(b)! - 1e3;
          return ka - kb || prev.get(a)! - prev.get(b)!;
        }),
      );
    }
  };

  for (let pass = 0; pass < 4; pass++) {
    for (let c = 1; c < columns.length; c++) sweep(c, rank(c - 1));
    for (let c = columns.length - 2; c >= 0; c--) sweep(c, rank(c + 1));
  }
  for (let c = 1; c < columns.length; c++) sweep(c, rank(c - 1));

  // Assign y.
  const y = new Map<string, number>();
  const groups: PlacedGroup[][] = [];
  let height = 0;
  for (const col of columns) {
    let cursor = opts.top;
    const placed: PlacedGroup[] = [];
    for (const g of sortedGroups(col.index)) {
      const ids = members[col.index].get(g)!;
      if (g === "jury") cursor += opts.groupGap * 0.5;
      const y0 = cursor;
      for (const id of ids) {
        y.set(yKey(id, col.index), cursor);
        cursor += opts.lane;
      }
      placed.push({
        ...groupInfo.get(g)!,
        column: col.index,
        y0,
        y1: cursor - opts.lane,
        members: ids,
      });
      cursor += opts.groupGap;
    }
    height = Math.max(height, cursor);
    groups.push(placed);
  }
  const last = columns.length - 1;
  for (const [juror, finalist] of convergeOf) {
    y.set(yKey(juror, last), y.get(yKey(finalist, last))!);
  }

  // The groups that went to tribal — the rest of the cast sat it out.
  for (const col of columns) {
    if (!col.council || col.kind !== "council") continue;
    const voters = new Set(col.council.votes.map((v) => v.voter));
    const hit = groups[col.index].filter((g) =>
      g.members.some((m) => voters.has(m)),
    );
    col.attending = hit.map((g) => g.key);
  }

  for (const t of threads) {
    for (const s of t.stops) {
      if (!s.juror) columns[s.column].remaining[t.startTribe]++;
    }
  }

  if (import.meta.env.DEV) checkStoryline(columns, threads);

  return {
    columns,
    threads,
    groups,
    y,
    height,
    takeaway: buildTakeaway(columns, threads),
  };
}

const total = (r: Record<StartTribe, number>) =>
  START_TRIBES.reduce((n, t) => n + r[t], 0);

/** Finalists and their jury votes, most first (a shut-out finalist gets 0). */
export function finalVotes(
  columns: StoryColumn[],
  threads: StoryThread[],
): Array<[StoryThread, number]> {
  const final = columns[columns.length - 1];
  return threads
    .filter((t) => t.outcome === "winner" || t.outcome === "finalist")
    .map(
      (t) =>
        [t, final.tally.find(([id]) => id === t.id)?.[1] ?? 0] as [
          StoryThread,
          number,
        ],
    )
    .sort((a, b) => b[1] - a[1]);
}

/**
 * The headline: how the starting tribes entered the merge, against who won.
 * Worded from the counts, so it can't drift from the chart.
 */
function buildTakeaway(columns: StoryColumn[], threads: StoryThread[]): string {
  const merge = columns.find((c) => c.phase === "merge");
  const fv = finalVotes(columns, threads);
  if (!merge || fv.length === 0) return "";
  const at = merge.remaining;
  const n = total(at);
  const ranked = [...START_TRIBES].sort((a, b) => at[a] - at[b]);
  const [winner] = fv[0];
  const tribe = winner.startTribe;
  const fewest = ranked[0] === tribe && at[ranked[1]] > at[tribe];
  const tally = fv.map(([, v]) => v).join("–");

  return (
    `${tribe} reached the merge with ${fewest ? "the fewest players" : at[tribe] + " players"} ` +
    `(${at[tribe]} of ${n}), yet won: ${winner.firstName} took the jury ${tally}.`
  );
}

export const stopY = (s: Storyline, id: string, column: number) =>
  s.y.get(yKey(id, column));

// Dev-time sanity check: every exit lands exactly once, and each council's
// tally still matches voteHelpers (the view prints it).
function checkStoryline(columns: StoryColumn[], threads: StoryThread[]) {
  const exits = columns.flatMap((c) => c.exits);
  for (const e of eliminated) {
    if (exits.filter((id) => id === e.id).length !== 1) {
      console.warn(
        `storyline: ${e.id} exits ${exits.filter((id) => id === e.id).length} times`,
      );
    }
  }
  const winners = threads.filter((t) => t.outcome === "winner");
  if (winners.length !== 1) {
    console.warn(`storyline: expected one winner, found ${winners.length}`);
  }
  // Each column's head count is the last one's, less who left there.
  for (let i = 1; i < columns.length; i++) {
    const was = total(columns[i - 1].remaining) - columns[i - 1].exits.length;
    if (total(columns[i].remaining) !== was) {
      console.warn(
        `storyline: ${columns[i].label} ${columns[i].sublabel} has ${total(columns[i].remaining)} in play, expected ${was}`,
      );
    }
  }
  for (const col of columns) {
    if (col.kind !== "council") continue;
    const sum = col.tally.reduce((n, [, v]) => n + v, 0);
    const counted = col.council!.votes.filter(isCounted).length;
    if (sum !== counted) {
      console.warn(
        `storyline: ${col.council!.key} tally ${sum} ≠ counted ${counted}`,
      );
    }
  }
}
