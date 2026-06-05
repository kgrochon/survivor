import type { TribeName } from "./tribes";

/**
 * Season 50 challenge results. Used by the player detail panel to show what
 * each player has won. Populate as you watch / confirm through the episodes.
 *
 * The `winners` array holds different things depending on challenge type:
 *
 *   TRIBE CHALLENGES ("reward" | "immunity"):
 *     `winners` holds the WINNING TRIBE NAME(S) — e.g. ["Cila", "Kalo"].
 *     A challenge can have more than one winning tribe (e.g. Ep 3, where 1st
 *     and 2nd place were both safe). To find which players that covers, resolve
 *     each tribe's roster at that episode (see tribeAtEpisode in cast.ts) in
 *     the UI.
 *
 *   INDIVIDUAL CHALLENGES ("individual-immunity" | "individual-reward"):
 *     `winners` holds CAST IDS — usually one, or several for a shared/duo reward.
 *
 *   JOURNEYS ("journey"):
 *     Off-camp trips where players compete for advantages. `winners` holds the
 *     CAST IDS of whoever came out ahead (gained an advantage). Journeys can be
 *     messy — someone may gain while another loses a vote, or both happen at
 *     once — so use `detail` to record the full outcome, including any downside.
 *
 * STATUS: Episodes 1–3 are populated from published recaps. Episodes 4+ are
 * skeletons — outcomes weren't reported clearly enough to fill without guessing.
 * Unconfirmed entries are marked `confirmed: false` with empty winners.
 */
export interface Challenge {
  /** Stable kebab-case slug, e.g. `"ep03-immunity"`. */
  id: string;
  episode: number;
  /** In-game day the challenge took place (e.g. 3). Optional until confirmed. */
  day?: number;
  /** Optional name of the challenge (e.g. "Blind Leading the Blind"). */
  title?: string;
  type:
    | "reward"
    | "immunity"
    | "individual-immunity"
    | "individual-reward"
    | "journey";
  /** Free-text note about the challenge (format, outcome, caveats). */
  detail?: string;
  /**
   * For tribe challenges: the winning tribe name(s) (TribeName).
   * For individual challenges and journeys: the winning cast id(s).
   * Empty until the result is confirmed (see `confirmed`).
   */
  winners: string[];
  /**
   * False for skeleton entries whose winners haven't been verified yet.
   * Defaults to true for populated, sourced results.
   */
  confirmed?: boolean;
}

/** True for tribe challenges, whose `winners` hold tribe names rather than ids. */
export function isTribeChallenge(c: Challenge): boolean {
  return c.type === "reward" || c.type === "immunity";
}

export const challenges: Challenge[] = [
  // ── Episode 1 — "One Epic Party" (3 starting tribes of 8) ──────────────
  {
    id: "ep01-reward",
    episode: 1,
    day: 1,
    title: "Marooning",
    type: "reward",
    detail:
      "Day 1 marooning/reward challenge (a nod to Borneo's 'Quest for Fire'). Vatu led " +
      "wire-to-wire — Stephenie's early lead was never lost — and won fire for camp " +
      "(flint + a bonfire). The fans had voted against marshmallows.",
    confirmed: true,
    winners: ["Vatu"],
  },
  {
    id: "ep01-immunity",
    episode: 1,
    day: 3,
    type: "immunity",
    detail:
      "Day 3 immunity challenge (obstacle wall, then puzzle). Kalo finished 1st and Vatu " +
      "2nd — both safe, with fishing-kit rewards attached (large kit for Kalo, small for " +
      "Vatu). Cila lost: Cirie was slow on the monkey-fist/wall-drop task. At the Night 3 " +
      "Tribal, Jenna was voted out 7-1 (one vote on Cirie). During this challenge Kyle of " +
      "Vatu injured his ankle on the wall; he was medically evacuated on Day 4.",
    confirmed: true,
    winners: ["Kalo", "Vatu"],
  },
  {
    id: "ep01-journey-supplies",
    episode: 1,
    day: 1,
    type: "journey",
    detail:
      "Day 1 supply duel: Coach vs. Ozzy vs. Q, all racing for the same key. Ozzy knocked " +
      "the key off but Coach dragged it over the line to win camp supplies for Kalo. On " +
      "the ensuing Exile Island stop, Q sold his vote to Ozzy — Q gained supplies but lost " +
      "his vote, while Ozzy gained an Extra Vote. Winners (gained an advantage): Coach " +
      "(supplies), Ozzy (extra vote).",
    confirmed: true,
    winners: ["coach-wade", "ozzy-lusth"],
  },
  {
    id: "ep01-journey-blockvote",
    episode: 1,
    day: 4,
    type: "journey",
    detail:
      "Day 4 journey: Mike White, Savannah, and Colby went, but only two could play (Mike " +
      "was sent back). Savannah won a Block-a-Vote advantage and kept her own vote; Colby " +
      "lost his vote.",
    confirmed: true,
    winners: ["savannah-louie"],
  },

  // ── Episode 2 — "Snakes in the Bag" ────────────────────────────────────
  {
    id: "ep02-reward",
    episode: 2,
    day: 5,
    type: "reward",
    detail:
      "Reward challenge: leap off a platform and smash a tile for a key, dive to retrieve " +
      "rings, then toss three rings onto targets. Cila finished 1st (full camp-improvement " +
      "kit), Kalo 2nd (smaller kit). Kamilla sat out for Kalo; Aubry missed her first key " +
      "attempt, costing Vatu time.",
    confirmed: true,
    winners: ["Cila", "Kalo"],
  },
  {
    id: "ep02-immunity",
    episode: 2,
    day: 6,
    type: "immunity",
    detail:
      "Immunity challenge ending in a snake-maze ball maneuver. Cila lost again — Ozzy, " +
      "Cirie, and Christian got stuck on the final snake puzzle — so Kalo and Vatu were " +
      "safe. At the Night 6 Tribal, Cirie steered the vote onto Savannah (the S49 winner) " +
      "using Savannah's hidden journey advantage as ammunition; Savannah went out 6-1 " +
      "(one vote on Ozzy).",
    confirmed: true,
    winners: ["Kalo", "Vatu"],
  },

  // ── Episode 3 — "Did You Vote for a Swap?" (swap to 3 tribes of ~7) ─────
  {
    id: "ep03-immunity",
    episode: 3,
    title: "Blind Leading the Blind",
    type: "immunity",
    detail:
      "First post-swap immunity: blindfolded obstacle course + puzzle, one caller per " +
      "tribe (Kamilla for Cila, Christian for Vatu, Chrissy for Kalo). Cila won 1st " +
      "(immunity + 4 chickens + flint), Kalo 2nd (immunity + 1 chicken). Vatu lost and " +
      "voted out Q. Both 1st and 2nd place tribes were safe.",
    confirmed: true,
    winners: ["Cila", "Kalo"],
  },

  // ── Episode 4 — "The Zac Brown Show" ───────────────────────────────────
  {
    id: "ep04-reward",
    episode: 4,
    type: "reward",
    detail:
      "Combined immunity+reward challenge; reward went only to 1st place — a fish dinner " +
      "and Zac Brown concert at the Sanctuary. Kalo won 1st and took the reward. Cila's " +
      "2nd place earned immunity but no reward; Vatu finished last.",
    confirmed: true,
    winners: ["Kalo"],
  },
  {
    id: "ep04-immunity",
    episode: 4,
    type: "immunity",
    detail:
      "Same challenge as ep04-reward (course + puzzle). Kalo won by a hair (1st), Cila " +
      "took 2nd — both safe. Vatu flopped, never reaching the puzzle, and went to Tribal, " +
      "where Christian flipped to blindside Mike White in a 3-2-1 vote.",
    confirmed: true,
    winners: ["Kalo", "Cila"],
  },

  // ── Episode 5 — "Operation Bad Blood" (first double elimination) ────────
  {
    id: "ep05-immunity",
    episode: 5,
    type: "immunity",
    detail:
      "Double-elimination twist: only ONE tribe could win immunity. Kalo won — Tiffany, " +
      "Coach, and Joe clutched the back half after Colby was benched injured — sending " +
      "BOTH Vatu and Cila to Tribal. Vatu voted out Angelina (4-1); Cila blindsided " +
      "Charlie (4-3) in the 'Operation Bad Blood' vote.",
    confirmed: true,
    winners: ["Kalo"],
  },

  // ── Episode 6 — "The Blood Moon" (merge; triple Tribal) ────────────────
  // Combined immunity+reward, "Chimney Sweeps" endurance. 15 players split into
  // 3 groups of 5; one immunity winner per group; each group then voted someone
  // out (3 boots: Kamilla 3-2, Genevieve 4-0 w/ Shot in the Dark, Colby 4-0).
  // Ozzy & Rizo were on Exile Island and sat the challenge out.
  {
    id: "ep06-individual-immunity",
    episode: 6,
    day: 13,
    title: "Chimney Sweeps",
    type: "individual-immunity",
    detail:
      "First post-merge immunity. Three group winners, each safe from their group's " +
      "Tribal: Christian, Dee, and Stephenie. (Stephenie's win was notable as her first " +
      "individual immunity since Guatemala, 21 years prior.)",
    confirmed: true,
    winners: ["christian-hubicki", "dee-valladares", "stephenie-lagrossa-kendrick"],
  },
  {
    id: "ep06-individual-reward",
    episode: 6,
    day: 13,
    title: "Chimney Sweeps",
    type: "individual-reward",
    detail:
      "Same challenge as ep06-individual-immunity. The player who lasted longest overall " +
      "won an Applebee's feast for their whole group of five — that was Stephenie. " +
      "(`winners` lists only the individual reward winner; her group shared the meal.)",
    confirmed: true,
    winners: ["stephenie-lagrossa-kendrick"],
  },

  // ── Episode 7 — "The Dragonslayer Strikes Back" (real merge; jury starts) ─
  {
    id: "ep07-journey",
    episode: 7,
    title: "When It Rains, It Pours",
    type: "journey",
    detail:
      "Stephenie was sent to Advantage Island by a random Shot-in-the-Dark draw. Holding " +
      "her arm up for a full hour (using her weaker left arm due to shoulder history), she " +
      "endured to win a Vote Steal. Stakes were win-advantage / lose-vote.",
    confirmed: true,
    winners: ["stephenie-lagrossa-kendrick"],
  },
  {
    id: "ep07-individual-reward",
    episode: 7,
    type: "individual-reward",
    detail:
      "First part of a two-part challenge (Mergatory team phase): the winning team earned " +
      "a Chinese takeout feast and advanced to the individual immunity round. Winning team: " +
      "Christian, Ozzy, Joe, Dee, Rick, Stephenie, Emily.",
    confirmed: true,
    winners: [
      "christian-hubicki",
      "ozzy-lusth",
      "joe-hunter",
      "dee-valladares",
      "rick-devens",
      "stephenie-lagrossa-kendrick",
      "emily-flippen",
    ],
  },
  {
    id: "ep07-individual-immunity",
    episode: 7,
    type: "individual-immunity",
    detail:
      "Second part (individual balance challenge) among the winning team. Ozzy won — his " +
      "first individual immunity in a long time — beating out Dee and Joe at the end. At " +
      "Tribal, Dee was voted out (first juror) despite playing her Shot in the Dark; Aubry " +
      "played her idol but it negated no votes.",
    confirmed: true,
    winners: ["ozzy-lusth"],
  },

  // ── Episode 8 — "Tied Destinies" (Double Duo twist) ────────────────────
  // 13 players split into pairs; Cirie drew the odd-one-out and went to Exile
  // with immunity. The winning PAIR took immunity + reward; one pair was voted
  // out together (Coach & Chrissy).
  {
    id: "ep08-journey",
    episode: 8,
    type: "journey",
    detail:
      "Cirie won the draw to sit out the Double Duo challenge and was sent to Exile Island " +
      "with immunity for the night. She found the phoenix-emblem coconut before the " +
      "hourglass ran out, returning to camp with her vote intact (and immunity). Counted " +
      "here as gaining safety/advantage, though not a challenge immunity win.",
    confirmed: true,
    winners: ["cirie-fields"],
  },
  {
    id: "ep08-individual-reward",
    episode: 8,
    title: "Tied Destinies (Double Duo)",
    type: "individual-reward",
    detail:
      "Pairs challenge; the winning duo took immunity plus a spaghetti feast. Joe and " +
      "Tiffany won, surging from last place at the end.",
    confirmed: true,
    winners: ["joe-hunter", "tiffany-ervin"],
  },
  {
    id: "ep08-individual-immunity",
    episode: 8,
    title: "Tied Destinies (Double Duo)",
    type: "individual-immunity",
    detail:
      "Same Double Duo challenge. The winning pair — Joe and Tiffany — were both immune. " +
      "At Tribal, Rick played a fake idol to spark chaos; the vote landed on the Coach & " +
      "Chrissy pair, who were voted out together (Coach's Shot in the Dark was a dud). " +
      "Cirie was also immune via her Exile win (see ep08-journey).",
    confirmed: true,
    winners: ["joe-hunter", "tiffany-ervin"],
  },

  // ── Episode 9 — "The Letter of Shame" (Jimmy Fallon episode) ───────────
  {
    id: "ep09-individual-immunity",
    episode: 9,
    type: "individual-immunity",
    detail:
      "Rice-negotiation twist: Jeff Probst himself competed against four players (Ozzy, " +
      "Joe, Tiffany, Jonathan); the tribe earned rice because all four outlasted him. The " +
      "challenge then resolved to individual immunity, won by Joe (his 2nd career immunity " +
      "win), beating Ozzy at the end. Christian was voted out at Tribal (forced to vote " +
      "for himself — see ep09-journey).",
    confirmed: true,
    winners: ["joe-hunter"],
  },
  {
    id: "ep09-journey",
    episode: 9,
    title: "Rachel LaMont Memorial Journey",
    type: "journey",
    detail:
      "Immunity winner Joe had to send one player on a Journey; Christian went (decided by " +
      "rock-paper-scissors). A jigsaw puzzle under a strict time limit: finish to win the " +
      "'One in the Urn' extra-vote advantage, fail and take a walk of shame plus bad news. " +
      "Christian failed — he could only cast his Tribal vote for himself, and gave his " +
      "Shot in the Dark to Jonathan. No advantage was gained, so `winners` is intentionally " +
      "empty (this is a confirmed result, not an unfilled skeleton).",
    confirmed: true,
    winners: [],
  },

  // ── Episode 10 — "Double or Nothing" (Auction / MrBeast) ───────────────
  {
    id: "ep10-individual-immunity",
    episode: 10,
    type: "individual-immunity",
    detail:
      "Ball-balancing challenge that came down to Tiffany, Joe, and Ozzy. Tiffany won — " +
      "her 2nd individual immunity of the season. (The episode also featured an Auction, a " +
      "reward bidding event, not recorded as a challenge.) Stephenie was voted out at " +
      "Tribal after a Vote-Steal gambit failed.",
    confirmed: true,
    winners: ["tiffany-ervin"],
  },
  {
    id: "ep10-journey",
    episode: 10,
    title: "MrBeast Super Beware Advantage (coin flip)",
    type: "journey",
    detail:
      "Do-or-Die-style twist from the MrBeast advantage. One player flipped a gold coin: " +
      "call it right to gain immunity, a public idol, a spot in the final nine, and double " +
      "the prize pot; call it wrong and be eliminated outright. Rick volunteered, called it " +
      "correctly, and gained all of the above (immunity + idol). Counted as an advantage " +
      "win, not a challenge immunity win.",
    confirmed: true,
    winners: ["rick-devens"],
  },

  // ── Episode 11 — "New Era, Same Fate" (split Tribal; double boot) ───────
  {
    id: "ep11-individual-immunity",
    episode: 11,
    title: "Bermuda Triangles",
    type: "individual-immunity",
    detail:
      "Balance-at-sea challenge. Tiffany appeared to edge Jonathan by half a second, but a " +
      "production footage review found she hadn't made the one-foot transition in time, so " +
      "the win was awarded to Jonathan (his 2nd career win in this challenge). His immunity " +
      "came with a split-Tribal advantage: two random groups of four, and Jonathan attended " +
      "BOTH Tribals and voted in each. Double elimination — Emily voted out from the first " +
      "group (Rick idoled himself, forcing a tie; Cirie's extra vote sealed it on the " +
      "re-vote), and Ozzy blindsided with an idol in his pocket from the second.",
    confirmed: true,
    winners: ["jonathan-young"],
  },

  // ── Episode 12 — "Big Threat Hunting" (double boot) ────────────────────
  // Two immunity challenges / two Tribals. Rick voted out first (unanimous,
  // failed Shot in the Dark), then Cirie voted out 4-2 at final six.
  {
    id: "ep12-individual-immunity-1",
    episode: 12,
    type: "individual-immunity",
    detail:
      "First immunity of the double boot. Joe won (a challenge he'd won before) plus a BBQ " +
      "feast (see ep12-individual-reward). Rick was then voted out unanimously as first " +
      "boot of the night; his Shot in the Dark failed.",
    confirmed: true,
    winners: ["joe-hunter"],
  },
  {
    id: "ep12-individual-reward",
    episode: 12,
    type: "individual-reward",
    detail:
      "BBQ feast attached to the first immunity win; Joe shared it with Cirie and Rizo.",
    confirmed: true,
    winners: ["joe-hunter", "cirie-fields", "rizo-velovic"],
  },
  {
    id: "ep12-individual-immunity-2",
    episode: 12,
    type: "individual-immunity",
    detail:
      "Second immunity of the double boot, a word puzzle. Tiffany won on her own after Joe " +
      "and Jonathan botched their spelling. With Tiffany safe, Cirie was voted out 4-2 at " +
      "final six (only Tiffany voted with her); Rizo held his idol for final five.",
    confirmed: true,
    winners: ["tiffany-ervin"],
  },
  // ── Episode 13 — Finale (aired May 20, 2026) ───────────────────────────
  // Final five: Tiffany, Rizo, Aubry, Joe, Jonathan.
  // Two immunity challenges, a final-4 fire-making round, then Final Tribal.
  // Boot order: Tiffany (5th), Rizo (4th, lost fire-making), then Aubry won
  // over Jonathan and Joe at Final Tribal Council.
  {
    id: "ep13-individual-immunity-f5",
    episode: 13,
    type: "individual-immunity",
    detail:
      "Final-five immunity. Jonathan won, beating Tiffany by seconds. Tiffany was then " +
      "voted out in 5th place.",
    confirmed: true,
    winners: ["jonathan-young"],
  },
  {
    id: "ep13-individual-immunity-f4",
    episode: 13,
    title: "Simmotion",
    type: "individual-immunity",
    detail:
      "Final immunity (final four). Aubry won 'Simmotion', securing a spot in the final " +
      "three. She advanced with Joe; Jonathan and Rizo went to a fire-making duel, which " +
      "Jonathan won — eliminating Rizo in 4th (Rizo had played his idol at final five and, " +
      "as in his prior season, lost fire-making at final four). At Final Tribal Council, " +
      "Aubry Bracco won Survivor 50 over Jonathan Young and Joe Hunter — her win coming " +
      "ten years after her runner-up finish in Kaoh Rong.",
    confirmed: true,
    winners: ["aubry-bracco"],
  },
];

/**
 * Lookup: every challenge whose `winners` array contains the given value.
 * NOTE: for tribe challenges `winners` holds tribe names, so passing a cast id
 * only matches individual challenges. To credit tribe wins, resolve the player's
 * tribe at the episode (cast.ts) and match on that in the UI.
 */
export function challengesWonBy(castId: string): Challenge[] {
  return challenges.filter((c) => c.winners.includes(castId));
}

/** Only the challenges whose results have been verified. */
export function confirmedChallenges(): Challenge[] {
  return challenges.filter((c) => c.confirmed !== false);
}