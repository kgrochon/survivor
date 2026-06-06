import type { TribeName } from "./tribes";

/**
 * Season 50 challenge & journey results, modeled as OUTCOMES.
 *
 * Design follows the logical implication:
 *
 *     (C ∨ J) ⟹ (I ∨ R ∨ A ∨ P)
 *
 *   C = a standard challenge, J = a journey. Either trigger produces at least
 *   one consequence for at least one recipient:
 *     I = immunity        R = reward (food, tools, flint, feast)
 *     A = advantage       P = penalty (lost vote, forced vote, etc.)
 *
 * So every confirmed entry carries a non-empty `outcomes` array. Each outcome
 * records WHO received WHAT. A single challenge/journey can hand different
 * consequences to different people (e.g. Ep 1 supply duel: Coach gains a
 * reward, Ozzy an advantage, Q a reward AND a penalty).
 *
 * RECIPIENTS:
 *   - Tribe challenges award whole tribes → recipientType "tribe", recipient is
 *     a TribeName. Resolve rosters at that episode via tribeAtEpisode (cast.ts).
 *   - Individual challenges/journeys award players → recipientType "player",
 *     recipient is a cast id.
 *
 * NOTE: immunity gained off-challenge (Exile, the MrBeast coin flip) is still
 * consequence "immunity"; the distinction lives in `trigger` ("journey").
 *
 * STATUS: all 13 episodes populated and confirmed from published recaps.
 * Unconfirmed entries (if any are added later) get `confirmed: false`.
 */

export type Trigger = "challenge" | "journey";
export type Consequence = "immunity" | "reward" | "advantage" | "penalty";
export type RecipientType = "tribe" | "player";

/** One consequence handed to one recipient by a challenge or journey. */
export interface Outcome {
  /** Cast id (recipientType "player") or TribeName (recipientType "tribe"). */
  recipient: string;
  recipientType: RecipientType;
  consequence: Consequence;
  /** Optional specifics: "vote steal", "lost vote", "Applebee's feast", etc. */
  detail?: string;
}

export interface Challenge {
  /** Stable kebab-case slug, e.g. `"ep03-immunity"`. */
  id: string;
  episode: number;
  /** In-game day (e.g. 3). Optional until known. */
  day?: number;
  /** Optional challenge name (e.g. "Blind Leading the Blind"). */
  title?: string;
  /** Whether this entry is a standard challenge (C) or a journey (J). */
  trigger: Trigger;
  /** Free-text note about format, narrative, caveats. */
  detail?: string;
  /**
   * Every consequence the challenge/journey produced. Per the governing
   * implication, a confirmed entry has at least one outcome. May be empty only
   * when `confirmed` is false (an unfilled skeleton).
   */
  outcomes: Outcome[];
  /** False for unverified skeletons. Defaults to true for sourced results. */
  confirmed?: boolean;
}

// ── Outcome constructors (keep entries readable) ───────────────────────────
const tribe = (
  name: TribeName,
  consequence: Consequence,
  detail?: string,
): Outcome => ({ recipient: name, recipientType: "tribe", consequence, detail });

const player = (
  castId: string,
  consequence: Consequence,
  detail?: string,
): Outcome => ({ recipient: castId, recipientType: "player", consequence, detail });

/** Several players, same consequence (e.g. a whole winning team/duo). */
const players = (
  castIds: string[],
  consequence: Consequence,
  detail?: string,
): Outcome[] => castIds.map((id) => player(id, consequence, detail));

export const challenges: Challenge[] = [
  // ── Episode 1 — "One Epic Party" (3 starting tribes of 8) ──────────────
  {
    id: "ep01-reward",
    episode: 1,
    day: 1,
    title: "Marooning",
    trigger: "challenge",
    detail:
      "Day 1 marooning/reward (a nod to Borneo's 'Quest for Fire'). Vatu led wire-to-wire " +
      "(Stephenie's early lead never lost) and won fire for camp — flint + a bonfire.",
    confirmed: true,
    outcomes: [tribe("Vatu", "reward", "flint + bonfire")],
  },
  {
    id: "ep01-immunity",
    episode: 1,
    day: 3,
    trigger: "challenge",
    detail:
      "Day 3 immunity (obstacle wall, then puzzle). Kalo 1st, Vatu 2nd — both safe, with " +
      "fishing-kit rewards attached (large kit Kalo, small Vatu). Cila lost (Cirie slow on " +
      "the monkey-fist task); Jenna voted out 7-1. Kyle injured his ankle here and was " +
      "medevaced Day 4.",
    confirmed: true,
    outcomes: [
      tribe("Kalo", "immunity"),
      tribe("Kalo", "reward", "large fishing kit"),
      tribe("Vatu", "immunity"),
      tribe("Vatu", "reward", "small fishing kit"),
    ],
  },
  {
    id: "ep01-journey-supplies",
    episode: 1,
    day: 1,
    trigger: "journey",
    detail:
      "Day 1 supply duel: Coach vs. Ozzy vs. Q for one key. Coach dragged it over the line " +
      "to win camp supplies. On the Exile stop, Q sold his vote to Ozzy — Q gained supplies " +
      "but lost his vote; Ozzy gained an Extra Vote.",
    confirmed: true,
    outcomes: [
      player("coach-wade", "reward", "camp supplies"),
      player("q-burdette", "reward", "supplies (Exile)"),
      player("q-burdette", "penalty", "lost vote (sold to Ozzy)"),
      player("ozzy-lusth", "advantage", "Extra Vote"),
    ],
  },
  {
    id: "ep01-journey-blockvote",
    episode: 1,
    day: 4,
    trigger: "journey",
    detail:
      "Day 4 journey: Mike, Savannah, Colby went; only two could play (Mike sent back). " +
      "Savannah won a Block-a-Vote and kept her vote; Colby lost his vote.",
    confirmed: true,
    outcomes: [
      player("savannah-louie", "advantage", "Block-a-Vote"),
      player("colby-donaldson", "penalty", "lost vote"),
    ],
  },

  // ── Episode 2 — "Snakes in the Bag" ────────────────────────────────────
  {
    id: "ep02-reward",
    episode: 2,
    day: 5,
    trigger: "challenge",
    detail:
      "Reward: platform leap to smash a tile for a key, dive for rings, then ring toss. " +
      "Cila 1st (full camp-improvement kit), Kalo 2nd (smaller kit). Kamilla sat out for " +
      "Kalo; Aubry missed her first key attempt, costing Vatu time.",
    confirmed: true,
    outcomes: [
      tribe("Cila", "reward", "full camp-improvement kit"),
      tribe("Kalo", "reward", "smaller kit"),
    ],
  },
  {
    id: "ep02-immunity",
    episode: 2,
    day: 6,
    trigger: "challenge",
    detail:
      "Immunity ending in a snake-maze ball maneuver. Cila lost (Ozzy, Cirie, Christian " +
      "stuck on the puzzle) so Kalo and Vatu were safe. Cirie steered the vote onto " +
      "Savannah, out 6-1 (one vote on Ozzy).",
    confirmed: true,
    outcomes: [tribe("Vatu", "immunity", "1st"), tribe("Kalo", "immunity", "2nd")],
  },

  // ── Episode 3 — "Did You Vote for a Swap?" (swap to 3 tribes of ~7) ─────
  {
    id: "ep03-immunity",
    episode: 3,
    title: "Blind Leading the Blind",
    trigger: "challenge",
    detail:
      "First post-swap immunity: blindfolded obstacle course + puzzle (callers: Kamilla/" +
      "Cila, Christian/Vatu, Chrissy/Kalo). Cila 1st (immunity + 4 chickens + flint), Kalo " +
      "2nd (immunity + 1 chicken). Vatu lost and voted out Q.",
    confirmed: true,
    outcomes: [
      tribe("Cila", "immunity", "1st"),
      tribe("Cila", "reward", "4 chickens + flint"),
      tribe("Kalo", "immunity", "2nd"),
      tribe("Kalo", "reward", "1 chicken"),
    ],
  },

  // ── Episode 4 — "The Zac Brown Show" ───────────────────────────────────
  {
    id: "ep04-immunity",
    episode: 4,
    trigger: "challenge",
    detail:
      "Combined immunity+reward (course + puzzle). Kalo won by a hair (1st), Cila 2nd — " +
      "both safe; reward (fish dinner + Zac Brown concert) went to 1st only. Vatu flopped " +
      "and blindsided Mike White 3-2-1 (Christian flipped).",
    confirmed: true,
    outcomes: [
      tribe("Kalo", "immunity", "1st"),
      tribe("Kalo", "reward", "fish dinner + Zac Brown concert"),
      tribe("Cila", "immunity", "2nd"),
    ],
  },

  // ── Episode 5 — "Operation Bad Blood" (first double elimination) ────────
  {
    id: "ep05-immunity",
    episode: 5,
    trigger: "challenge",
    detail:
      "Double-elimination twist: only ONE tribe won immunity. Kalo won (Tiffany, Coach, " +
      "Joe clutched the back half after Colby was benched), sending BOTH Vatu and Cila to " +
      "Tribal. Vatu voted out Angelina (4-1); Cila blindsided Charlie (4-3).",
    confirmed: true,
    outcomes: [tribe("Kalo", "immunity")],
  },

  // ── Episode 6 — "The Blood Moon" (merge; triple Tribal) ────────────────
  // "Chimney Sweeps" endurance; 15 players in 3 groups of 5, one immunity
  // winner each, feeding a triple Tribal (boots: Kamilla 3-2, Genevieve 4-0
  // w/ Shot in the Dark, Colby 4-0). Ozzy & Rizo on Exile, sat out.
  {
    id: "ep06-individual-immunity",
    episode: 6,
    day: 13,
    title: "Chimney Sweeps",
    trigger: "challenge",
    detail:
      "First post-merge immunity. Three group winners, each safe from their group's " +
      "Tribal: Christian, Dee, Stephenie. Stephenie's was her first individual immunity " +
      "since Guatemala (21 years).",
    confirmed: true,
    outcomes: [
      player("christian-hubicki", "immunity"),
      player("dee-valladares", "immunity"),
      player("stephenie-lagrossa-kendrick", "immunity"),
      // Stephenie also lasted longest overall → Applebee's feast for her group of five.
      ...players(
        [
          "stephenie-lagrossa-kendrick",
          "chrissy-hofbeck",
          "jonathan-young",
          "cirie-fields",
          "kamilla-karthigesu",
        ],
        "reward",
        "Applebee's feast (Stephenie's group)",
      ),
    ],
  },

  // ── Episode 7 — "The Dragonslayer Strikes Back" (real merge; jury starts) ─
  {
    id: "ep07-journey",
    episode: 7,
    title: "When It Rains, It Pours",
    trigger: "journey",
    detail:
      "Stephenie sent to Advantage Island by random Shot-in-the-Dark draw. She held her " +
      "arm up the full hour (weaker left arm, shoulder history) to win a Vote Steal. " +
      "Stakes: win-advantage / lose-vote.",
    confirmed: true,
    outcomes: [player("stephenie-lagrossa-kendrick", "advantage", "Vote Steal")],
  },
  {
    id: "ep07-immunity",
    episode: 7,
    title: "Two-part Mergatory",
    trigger: "challenge",
    detail:
      "Two parts. Team phase: winning team earned a Chinese takeout feast and advanced to " +
      "the individual round (team: Christian, Ozzy, Joe, Dee, Rick, Stephenie, Emily). " +
      "Individual balance phase: Ozzy won immunity over Dee and Joe — his first solo win " +
      "in years. Dee voted out (first juror) despite a Shot in the Dark; Aubry's idol " +
      "negated nothing.",
    confirmed: true,
    outcomes: [
      ...players(
        [
          "christian-hubicki",
          "ozzy-lusth",
          "joe-hunter",
          "dee-valladares",
          "rick-devens",
          "stephenie-lagrossa-kendrick",
          "emily-flippen",
        ],
        "reward",
        "Chinese takeout feast",
      ),
      player("ozzy-lusth", "immunity"),
    ],
  },

  // ── Episode 8 — "Tied Destinies" (Double Duo twist) ────────────────────
  // 13 players in pairs; Cirie drew the odd-one-out, went to Exile with
  // immunity. Winning PAIR took immunity + reward; one pair (Coach & Chrissy)
  // voted out together.
  {
    id: "ep08-journey",
    episode: 8,
    trigger: "journey",
    detail:
      "Cirie drew the sit-out slot and went to Exile with immunity for the night. She " +
      "found the phoenix coconut before the hourglass ran out, returning with her vote " +
      "intact.",
    confirmed: true,
    outcomes: [player("cirie-fields", "immunity", "Exile (found phoenix coconut)")],
  },
  {
    id: "ep08-immunity",
    episode: 8,
    title: "Tied Destinies (Double Duo)",
    trigger: "challenge",
    detail:
      "Pairs challenge; winning duo took immunity + a spaghetti feast. Joe and Tiffany won, " +
      "surging from last. Rick played a fake idol at Tribal; the Coach & Chrissy pair were " +
      "voted out together (Coach's Shot in the Dark was a dud).",
    confirmed: true,
    outcomes: [
      ...players(["joe-hunter", "tiffany-ervin"], "immunity"),
      ...players(["joe-hunter", "tiffany-ervin"], "reward", "spaghetti feast"),
    ],
  },

  // ── Episode 9 — "The Letter of Shame" (Jimmy Fallon episode) ───────────
  {
    id: "ep09-immunity",
    episode: 9,
    trigger: "challenge",
    detail:
      "Rice-negotiation twist: Probst competed against four players (Ozzy, Joe, Tiffany, " +
      "Jonathan); the tribe earned rice as all four outlasted him. Resolved to individual " +
      "immunity, won by Joe (2nd career immunity) over Ozzy. Christian voted out.",
    confirmed: true,
    outcomes: [player("joe-hunter", "immunity")],
  },
  {
    id: "ep09-journey",
    episode: 9,
    title: "Rachel LaMont Memorial Journey",
    trigger: "journey",
    detail:
      "Joe sent Christian on a Journey (rock-paper-scissors). Timed jigsaw puzzle: finish " +
      "for the 'One in the Urn' extra vote, fail for a penalty. Christian FAILED — he could " +
      "only vote for himself at Tribal, and gave his Shot in the Dark to Jonathan.",
    confirmed: true,
    outcomes: [
      player(
        "christian-hubicki",
        "penalty",
        "forced to vote self; gave Shot in the Dark to Jonathan",
      ),
    ],
  },

  // ── Episode 10 — "Double or Nothing" (Auction / MrBeast) ───────────────
  {
    id: "ep10-immunity",
    episode: 10,
    trigger: "challenge",
    detail:
      "Ball-balancing challenge down to Tiffany, Joe, Ozzy. Tiffany won — her 2nd " +
      "individual immunity. (The episode's Auction was a reward bidding event, not a " +
      "challenge.) Stephenie voted out after a Vote-Steal gambit failed.",
    confirmed: true,
    outcomes: [player("tiffany-ervin", "immunity")],
  },
  {
    id: "ep10-journey",
    episode: 10,
    title: "MrBeast Super Beware Advantage (coin flip)",
    trigger: "journey",
    detail:
      "Do-or-Die-style coin flip from the MrBeast advantage: call it right for immunity + a " +
      "public idol + a final-nine spot + a doubled prize pot; wrong = eliminated outright. " +
      "Rick volunteered and called it correctly.",
    confirmed: true,
    outcomes: [
      player("rick-devens", "immunity"),
      player(
        "rick-devens",
        "advantage",
        "public idol (good to final 7); doubled prize pot",
      ),
    ],
  },

  // ── Episode 11 — "New Era, Same Fate" (split Tribal; double boot) ───────
  {
    id: "ep11-immunity",
    episode: 11,
    title: "Bermuda Triangles",
    trigger: "challenge",
    detail:
      "Balance-at-sea. Tiffany appeared to edge Jonathan, but a footage review found she " +
      "hadn't made the one-foot transition in time, so the win went to Jonathan (2nd career " +
      "win here). Immunity came with a split-Tribal advantage: Jonathan attended BOTH " +
      "Tribals and voted twice. Double boot — Emily out (Rick idoled himself, tie, Cirie's " +
      "extra vote on the re-vote), Ozzy blindsided with an idol.",
    confirmed: true,
    outcomes: [
      player("jonathan-young", "immunity"),
      player(
        "jonathan-young",
        "advantage",
        "split-Tribal: vote at both Tribals",
      ),
    ],
  },

  // ── Episode 12 — "Big Threat Hunting" (double boot) ────────────────────
  {
    id: "ep12-immunity-1",
    episode: 12,
    trigger: "challenge",
    detail:
      "First immunity of the double boot. Joe won (a challenge he'd won before) + a BBQ " +
      "feast shared with Cirie and Rizo. Rick voted out unanimously (failed Shot in the " +
      "Dark) as first boot of the night.",
    confirmed: true,
    outcomes: [
      player("joe-hunter", "immunity"),
      ...players(
        ["joe-hunter", "cirie-fields", "rizo-velovic"],
        "reward",
        "BBQ feast",
      ),
    ],
  },
  {
    id: "ep12-immunity-2",
    episode: 12,
    trigger: "challenge",
    detail:
      "Second immunity of the double boot, a word puzzle. Tiffany won on her own after Joe " +
      "and Jonathan botched spelling. Cirie voted out 4-2 at final six (only Tiffany with " +
      "her); Rizo held his idol for final five.",
    confirmed: true,
    outcomes: [player("tiffany-ervin", "immunity")],
  },

  // ── Episode 13 — Finale (aired May 20, 2026) ───────────────────────────
  // Final five: Tiffany, Rizo, Aubry, Joe, Jonathan. Two immunities, a final-4
  // fire-making round (Jonathan beat Rizo), then Aubry won at Final Tribal.
  {
    id: "ep13-immunity-f5",
    episode: 13,
    trigger: "challenge",
    detail:
      "Final-five immunity. Jonathan won, beating Tiffany by seconds. Tiffany voted out 5th.",
    confirmed: true,
    outcomes: [player("jonathan-young", "immunity")],
  },
  {
    id: "ep13-immunity-f4",
    episode: 13,
    title: "Simmotion",
    trigger: "challenge",
    detail:
      "Final immunity (final four). Aubry won 'Simmotion', taking a final-three spot and " +
      "advancing with Joe. Jonathan beat Rizo in fire-making (Rizo out 4th; he'd idoled " +
      "himself at final five, then lost fire-making as in his prior season). Aubry won " +
      "Survivor 50 over Jonathan and Joe at Final Tribal — ten years after her Kaoh Rong " +
      "runner-up finish.",
    confirmed: true,
    outcomes: [player("aubry-bracco", "immunity")],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

/** True if this entry awards tribes (its recipients are TribeNames). */
export function isTribeChallenge(c: Challenge): boolean {
  return c.outcomes.some((o) => o.recipientType === "tribe");
}

/** All outcomes for a player across every challenge/journey. */
export function outcomesForPlayer(
  castId: string,
): { challenge: Challenge; outcome: Outcome }[] {
  const result: { challenge: Challenge; outcome: Outcome }[] = [];
  for (const c of challenges) {
    for (const o of c.outcomes) {
      if (o.recipientType === "player" && o.recipient === castId) {
        result.push({ challenge: c, outcome: o });
      }
    }
  }
  return result;
}

/** Challenges/journeys where a player received a given consequence. */
export function challengesWithConsequence(
  castId: string,
  consequence: Consequence,
): Challenge[] {
  return challenges.filter((c) =>
    c.outcomes.some(
      (o) =>
        o.recipientType === "player" &&
        o.recipient === castId &&
        o.consequence === consequence,
    ),
  );
}

/** Back-compat: challenges where a player "won" (immunity, reward, or advantage). */
export function challengesWonBy(castId: string): Challenge[] {
  const winning: Consequence[] = ["immunity", "reward", "advantage"];
  return challenges.filter((c) =>
    c.outcomes.some(
      (o) =>
        o.recipientType === "player" &&
        o.recipient === castId &&
        winning.includes(o.consequence),
    ),
  );
}

/** Tribe-challenge wins for a tribe name (immunity/reward at the tribe level). */
export function tribeOutcomes(
  name: TribeName,
): { challenge: Challenge; outcome: Outcome }[] {
  const result: { challenge: Challenge; outcome: Outcome }[] = [];
  for (const c of challenges) {
    for (const o of c.outcomes) {
      if (o.recipientType === "tribe" && o.recipient === name) {
        result.push({ challenge: c, outcome: o });
      }
    }
  }
  return result;
}

/** Only verified entries. */
export function confirmedChallenges(): Challenge[] {
  return challenges.filter((c) => c.confirmed !== false);
}

/**
 * Invariant from (C ∨ J) ⟹ (I ∨ R ∨ A ∨ P): every confirmed entry must have at
 * least one outcome. Returns the ids of any confirmed entries that violate it.
 */
export function entriesViolatingImplication(): string[] {
  return challenges
    .filter((c) => c.confirmed !== false && c.outcomes.length === 0)
    .map((c) => c.id);
}
