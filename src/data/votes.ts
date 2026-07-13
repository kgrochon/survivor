// Survivor Season 50 — vote tracking (complete, all 13 episodes)
//
// One row per vote cast. Query helpers live in voteHelpers.ts.
// Conventions:
//   - `tribal` + `council` + `round` identify a distinct voting round.
//     Multi-council episodes: 5, 6, 8, 11, 12. Revote: ep11 council 1.
//   - `ineligible: true` — voter forfeited their vote (Shot in the Dark, or a
//     sold/lost/stolen vote); `target` stays "".
//   - `nullified: true` — vote was cast but not counted (negated by an idol).
//   - `ballot` groups multi-target ballots (ep8 paired double-elimination;
//     Cirie's extra votes) — same id = one physical ballot.
//   - `voteType: "finale"` — jury voting FOR the winner (voter=juror, target=finalist).
//   - Non-vote exits produce no rows: Kyle (injury, ep1), Rizo (fire-making, ep13).
//   - Quirks preserved as aired: Christian voted himself (ep9); Ozzy's bought
//     extra vote (ep1) was never used.

export interface Vote {
  episode: number;
  tribal: string;        // "cila" | "vatu" | "kalo" | "merge"
  council?: number;      // ordinal within an episode when >1 tribal (1, 2, 3...); omit if only one
  voter: string;         // cast member id
  target: string;        // cast member id voted for (fill in)
  nullified?: boolean;   // true if an idol/advantage negated this vote
  ineligible?: boolean;  // true if voter couldn't vote (e.g. sold/blocked vote); target stays ""
  ballot?: string;       // groups multi-target ballots (e.g. paired-vote double eliminations); same id = one physical ballot
  round?: number;        // for tied tribals: 1 = initial vote, 2 = revote; omit if single round
  voteType?: "elimination" | "finale"; // "finale" = jury voting FOR a winner (voter=juror, target=finalist). Default treated as "elimination".
}

export const votes: Vote[] = [
  // Episode 1 — Cila tribal — jenna-lewis-dougherty voted out
  { episode: 1, tribal: "cila", voter: "jenna-lewis-dougherty", target: "cirie-fields" },
  { episode: 1, tribal: "cila", voter: "cirie-fields", target: "jenna-lewis-dougherty" },
  { episode: 1, tribal: "cila", voter: "ozzy-lusth", target: "jenna-lewis-dougherty" },
  { episode: 1, tribal: "cila", voter: "christian-hubicki", target: "jenna-lewis-dougherty" },
  { episode: 1, tribal: "cila", voter: "rick-devens", target: "jenna-lewis-dougherty" },
  { episode: 1, tribal: "cila", voter: "emily-flippen", target: "jenna-lewis-dougherty" },
  { episode: 1, tribal: "cila", voter: "joe-hunter", target: "jenna-lewis-dougherty" },
  { episode: 1, tribal: "cila", voter: "savannah-louie", target: "jenna-lewis-dougherty" },

  // Episode 2 — Cila tribal — savannah-louie voted out
  { episode: 2, tribal: "cila", voter: "cirie-fields", target: "savannah-louie" },
  { episode: 2, tribal: "cila", voter: "ozzy-lusth", target: "savannah-louie" },
  { episode: 2, tribal: "cila", voter: "christian-hubicki", target: "savannah-louie" },
  { episode: 2, tribal: "cila", voter: "rick-devens", target: "savannah-louie" },
  { episode: 2, tribal: "cila", voter: "emily-flippen", target: "savannah-louie" },
  { episode: 2, tribal: "cila", voter: "joe-hunter", target: "savannah-louie" },
  { episode: 2, tribal: "cila", voter: "savannah-louie", target: "ozzy-lusth" },

  // Episode 3 — Vatu tribal — q-burdette voted out
  { episode: 3, tribal: "vatu", voter: "stephenie-lagrossa-kendrick", target: "angelina-keeley" },
  { episode: 3, tribal: "vatu", voter: "ozzy-lusth", target: "q-burdette" },
  { episode: 3, tribal: "vatu", voter: "christian-hubicki", target: "q-burdette" },
  { episode: 3, tribal: "vatu", voter: "angelina-keeley", target: "q-burdette" },
  { episode: 3, tribal: "vatu", voter: "mike-white", target: "q-burdette" },
  { episode: 3, tribal: "vatu", voter: "emily-flippen", target: "q-burdette" },
  { episode: 3, tribal: "vatu", voter: "q-burdette", target: "", ineligible: true },

  // Episode 4 — Vatu tribal — mike-white voted out
  { episode: 4, tribal: "vatu", voter: "stephenie-lagrossa-kendrick", target: "mike-white" },
  { episode: 4, tribal: "vatu", voter: "ozzy-lusth", target: "angelina-keeley" },
  { episode: 4, tribal: "vatu", voter: "christian-hubicki", target: "mike-white" },
  { episode: 4, tribal: "vatu", voter: "angelina-keeley", target: "emily-flippen" },
  { episode: 4, tribal: "vatu", voter: "mike-white", target: "emily-flippen" },
  { episode: 4, tribal: "vatu", voter: "emily-flippen", target: "mike-white" },

  // Episode 5 — Cila tribal — charlie-davis voted out
  { episode: 5, tribal: "cila", council: 1, voter: "cirie-fields", target: "charlie-davis" },
  { episode: 5, tribal: "cila", council: 1, voter: "rick-devens", target: "rizo-velovic" },
  { episode: 5, tribal: "cila", council: 1, voter: "jonathan-young", target: "rizo-velovic" },
  { episode: 5, tribal: "cila", council: 1, voter: "dee-valladares", target: "charlie-davis" },
  { episode: 5, tribal: "cila", council: 1, voter: "charlie-davis", target: "rizo-velovic" },
  { episode: 5, tribal: "cila", council: 1, voter: "kamilla-karthigesu", target: "charlie-davis" },
  { episode: 5, tribal: "cila", council: 1, voter: "rizo-velovic", target: "charlie-davis" },

  // Episode 5 — Vatu tribal — angelina-keeley voted out
  { episode: 5, tribal: "vatu", council: 2, voter: "stephenie-lagrossa-kendrick", target: "angelina-keeley" },
  { episode: 5, tribal: "vatu", council: 2, voter: "ozzy-lusth", target: "angelina-keeley" },
  { episode: 5, tribal: "vatu", council: 2, voter: "christian-hubicki", target: "angelina-keeley" },
  { episode: 5, tribal: "vatu", council: 2, voter: "angelina-keeley", target: "stephenie-lagrossa-kendrick" },
  { episode: 5, tribal: "vatu", council: 2, voter: "emily-flippen", target: "angelina-keeley" },

  // Episode 6 — Orange team tribal (council 1) — kamilla-karthigesu voted out
  { episode: 6, tribal: "merge", council: 1, voter: "chrissy-hofbeck", target: "kamilla-karthigesu" },
  { episode: 6, tribal: "merge", council: 1, voter: "jonathan-young", target: "kamilla-karthigesu" },
  { episode: 6, tribal: "merge", council: 1, voter: "stephenie-lagrossa-kendrick", target: "kamilla-karthigesu" },
  { episode: 6, tribal: "merge", council: 1, voter: "kamilla-karthigesu", target: "chrissy-hofbeck" },
  { episode: 6, tribal: "merge", council: 1, voter: "tiffany-ervin", target: "chrissy-hofbeck" },

  // Episode 6 — Purple team tribal (council 2) — genevieve-mushaluk voted out
  // Genevieve played Shot in the Dark (not safe); received all 4 votes
  { episode: 6, tribal: "merge", council: 2, voter: "aubry-bracco", target: "genevieve-mushaluk" },
  { episode: 6, tribal: "merge", council: 2, voter: "christian-hubicki", target: "genevieve-mushaluk" },
  { episode: 6, tribal: "merge", council: 2, voter: "joe-hunter", target: "genevieve-mushaluk" },
  { episode: 6, tribal: "merge", council: 2, voter: "rick-devens", target: "genevieve-mushaluk" },
  { episode: 6, tribal: "merge", council: 2, voter: "genevieve-mushaluk", target: "", ineligible: true }, // Shot in the Dark (forfeited vote)

  // Episode 6 — Blue team tribal (council 3) — colby-donaldson voted out
  // Colby ineligible to vote (lost vote)
  { episode: 6, tribal: "merge", council: 3, voter: "cirie-fields", target: "colby-donaldson" },
  { episode: 6, tribal: "merge", council: 3, voter: "coach-wade", target: "colby-donaldson" },
  { episode: 6, tribal: "merge", council: 3, voter: "dee-valladares", target: "colby-donaldson" },
  { episode: 6, tribal: "merge", council: 3, voter: "emily-flippen", target: "colby-donaldson" },
  { episode: 6, tribal: "merge", council: 3, voter: "colby-donaldson", target: "", ineligible: true },

  // Episode 7 — Merge tribal — dee-valladares voted out
  // Dee used Shot in the Dark (not safe, forfeited vote); Aubry played Hidden Immunity Idol (0 votes against her, nullified nothing)
  { episode: 7, tribal: "merge", voter: "stephenie-lagrossa-kendrick", target: "tiffany-ervin" },
  { episode: 7, tribal: "merge", voter: "cirie-fields", target: "dee-valladares" },
  { episode: 7, tribal: "merge", voter: "ozzy-lusth", target: "tiffany-ervin" },
  { episode: 7, tribal: "merge", voter: "coach-wade", target: "tiffany-ervin" },
  { episode: 7, tribal: "merge", voter: "aubry-bracco", target: "dee-valladares" },
  { episode: 7, tribal: "merge", voter: "chrissy-hofbeck", target: "dee-valladares" },
  { episode: 7, tribal: "merge", voter: "christian-hubicki", target: "dee-valladares" },
  { episode: 7, tribal: "merge", voter: "rick-devens", target: "dee-valladares" },
  { episode: 7, tribal: "merge", voter: "jonathan-young", target: "dee-valladares" },
  { episode: 7, tribal: "merge", voter: "dee-valladares", target: "", ineligible: true },
  { episode: 7, tribal: "merge", voter: "emily-flippen", target: "dee-valladares" },
  { episode: 7, tribal: "merge", voter: "tiffany-ervin", target: "coach-wade" },
  { episode: 7, tribal: "merge", voter: "joe-hunter", target: "tiffany-ervin" },
  { episode: 7, tribal: "merge", voter: "rizo-velovic", target: "dee-valladares" },

  // Episode 8 — Merge tribal — DOUBLE ELIMINATION — chrissy-hofbeck AND coach-wade voted out
  // Paired-vote tribal: each voter cast one ballot naming TWO targets (recorded as two rows per voter, ballot: "8a").
  // Coach used Shot in the Dark (not safe, forfeited vote).
  // Result: Chrissy & Coach 10 ballots, Aubry & Rick 1 (Jonathan), Emily & Rizo 1 (Chrissy).
  { episode: 8, tribal: "merge", voter: "aubry-bracco", target: "chrissy-hofbeck", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "aubry-bracco", target: "coach-wade", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "christian-hubicki", target: "chrissy-hofbeck", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "christian-hubicki", target: "coach-wade", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "cirie-fields", target: "chrissy-hofbeck", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "cirie-fields", target: "coach-wade", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "emily-flippen", target: "chrissy-hofbeck", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "emily-flippen", target: "coach-wade", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "joe-hunter", target: "chrissy-hofbeck", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "joe-hunter", target: "coach-wade", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "ozzy-lusth", target: "chrissy-hofbeck", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "ozzy-lusth", target: "coach-wade", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "rick-devens", target: "chrissy-hofbeck", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "rick-devens", target: "coach-wade", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "rizo-velovic", target: "chrissy-hofbeck", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "rizo-velovic", target: "coach-wade", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "stephenie-lagrossa-kendrick", target: "chrissy-hofbeck", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "stephenie-lagrossa-kendrick", target: "coach-wade", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "tiffany-ervin", target: "chrissy-hofbeck", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "tiffany-ervin", target: "coach-wade", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "jonathan-young", target: "aubry-bracco", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "jonathan-young", target: "rick-devens", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "chrissy-hofbeck", target: "emily-flippen", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "chrissy-hofbeck", target: "rizo-velovic", ballot: "8a" },
  { episode: 8, tribal: "merge", voter: "coach-wade", target: "", ineligible: true }, // Shot in the Dark

  // Episode 9 — Merge tribal — christian-hubicki voted out (6-3-2)
  { episode: 9, tribal: "merge", voter: "stephenie-lagrossa-kendrick", target: "rick-devens" },
  { episode: 9, tribal: "merge", voter: "cirie-fields", target: "christian-hubicki" },
  { episode: 9, tribal: "merge", voter: "ozzy-lusth", target: "rick-devens" },
  { episode: 9, tribal: "merge", voter: "aubry-bracco", target: "christian-hubicki" },
  { episode: 9, tribal: "merge", voter: "christian-hubicki", target: "christian-hubicki" },
  { episode: 9, tribal: "merge", voter: "rick-devens", target: "ozzy-lusth" },
  { episode: 9, tribal: "merge", voter: "jonathan-young", target: "rick-devens" },
  { episode: 9, tribal: "merge", voter: "emily-flippen", target: "ozzy-lusth" },
  { episode: 9, tribal: "merge", voter: "tiffany-ervin", target: "christian-hubicki" },
  { episode: 9, tribal: "merge", voter: "joe-hunter", target: "christian-hubicki" },
  { episode: 9, tribal: "merge", voter: "rizo-velovic", target: "christian-hubicki" },

  // Episode 10 — Merge tribal — stephenie-lagrossa-kendrick voted out (8-2)
  // Stephenie stole Rick's vote; she cast 2 votes (both vs Aubry). Rick cast none.
  { episode: 10, tribal: "merge", voter: "stephenie-lagrossa-kendrick", target: "aubry-bracco", ballot: "10-steph-own" },
  { episode: 10, tribal: "merge", voter: "stephenie-lagrossa-kendrick", target: "aubry-bracco", ballot: "10-steph-stolen" }, // Rick's stolen vote
  { episode: 10, tribal: "merge", voter: "cirie-fields", target: "stephenie-lagrossa-kendrick" },
  { episode: 10, tribal: "merge", voter: "ozzy-lusth", target: "stephenie-lagrossa-kendrick" },
  { episode: 10, tribal: "merge", voter: "aubry-bracco", target: "stephenie-lagrossa-kendrick" },
  { episode: 10, tribal: "merge", voter: "rick-devens", target: "", ineligible: true }, // vote stolen by Stephenie
  { episode: 10, tribal: "merge", voter: "jonathan-young", target: "stephenie-lagrossa-kendrick" },
  { episode: 10, tribal: "merge", voter: "emily-flippen", target: "stephenie-lagrossa-kendrick" },
  { episode: 10, tribal: "merge", voter: "tiffany-ervin", target: "stephenie-lagrossa-kendrick" },
  { episode: 10, tribal: "merge", voter: "joe-hunter", target: "stephenie-lagrossa-kendrick" },
  { episode: 10, tribal: "merge", voter: "rizo-velovic", target: "stephenie-lagrossa-kendrick" },

  // Episode 11 — Magenta team tribal (council 1) — emily-flippen voted out (via tie -> revote)
  // Jonathan won immunity and voted at BOTH councils this episode.
  // Round 1: Cirie played EXTRA VOTE (2 votes vs Emily). Rick played HIDDEN IMMUNITY IDOL
  //   -> votes against Rick (Jonathan, Tiffany) NOT counted (nullified).
  //   Counted round 1: Cirie 2 (Emily, Rick), Emily 2 (Cirie x2) => TIE.
  { episode: 11, tribal: "merge", council: 1, round: 1, voter: "cirie-fields", target: "emily-flippen", ballot: "11m-cirie-own" },
  { episode: 11, tribal: "merge", council: 1, round: 1, voter: "cirie-fields", target: "emily-flippen", ballot: "11m-cirie-extra" }, // extra vote
  { episode: 11, tribal: "merge", council: 1, round: 1, voter: "emily-flippen", target: "cirie-fields" },
  { episode: 11, tribal: "merge", council: 1, round: 1, voter: "rick-devens", target: "cirie-fields" },
  { episode: 11, tribal: "merge", council: 1, round: 1, voter: "jonathan-young", target: "rick-devens", nullified: true }, // idol
  { episode: 11, tribal: "merge", council: 1, round: 1, voter: "tiffany-ervin", target: "rick-devens", nullified: true }, // idol
  // Round 2 (revote) — Emily voted out 4-2. Cirie used EXTRA VOTE again (2 vs Emily).
  { episode: 11, tribal: "merge", council: 1, round: 2, voter: "cirie-fields", target: "emily-flippen", ballot: "11m-r2-cirie-own" },
  { episode: 11, tribal: "merge", council: 1, round: 2, voter: "cirie-fields", target: "emily-flippen", ballot: "11m-r2-cirie-extra" }, // extra vote
  { episode: 11, tribal: "merge", council: 1, round: 2, voter: "jonathan-young", target: "emily-flippen" },
  { episode: 11, tribal: "merge", council: 1, round: 2, voter: "tiffany-ervin", target: "emily-flippen" },
  { episode: 11, tribal: "merge", council: 1, round: 2, voter: "emily-flippen", target: "cirie-fields" },
  { episode: 11, tribal: "merge", council: 1, round: 2, voter: "rick-devens", target: "cirie-fields" },

  // Episode 11 — Teal team tribal (council 2) — ozzy-lusth voted out (4-1)
  { episode: 11, tribal: "merge", council: 2, voter: "ozzy-lusth", target: "aubry-bracco" },
  { episode: 11, tribal: "merge", council: 2, voter: "aubry-bracco", target: "ozzy-lusth" },
  { episode: 11, tribal: "merge", council: 2, voter: "joe-hunter", target: "ozzy-lusth" },
  { episode: 11, tribal: "merge", council: 2, voter: "jonathan-young", target: "ozzy-lusth" },
  { episode: 11, tribal: "merge", council: 2, voter: "rizo-velovic", target: "ozzy-lusth" },

  // Episode 12 — Merge tribal (council 1) — rick-devens voted out (6-0)
  // Rick used Shot in the Dark (not safe, forfeited vote).
  { episode: 12, tribal: "merge", council: 1, voter: "cirie-fields", target: "rick-devens" },
  { episode: 12, tribal: "merge", council: 1, voter: "aubry-bracco", target: "rick-devens" },
  { episode: 12, tribal: "merge", council: 1, voter: "rick-devens", target: "", ineligible: true }, // Shot in the Dark
  { episode: 12, tribal: "merge", council: 1, voter: "jonathan-young", target: "rick-devens" },
  { episode: 12, tribal: "merge", council: 1, voter: "tiffany-ervin", target: "rick-devens" },
  { episode: 12, tribal: "merge", council: 1, voter: "joe-hunter", target: "rick-devens" },
  { episode: 12, tribal: "merge", council: 1, voter: "rizo-velovic", target: "rick-devens" },

  // Episode 12 — Merge tribal (council 2) — cirie-fields voted out (4-2)
  { episode: 12, tribal: "merge", council: 2, voter: "cirie-fields", target: "aubry-bracco" },
  { episode: 12, tribal: "merge", council: 2, voter: "aubry-bracco", target: "cirie-fields" },
  { episode: 12, tribal: "merge", council: 2, voter: "jonathan-young", target: "cirie-fields" },
  { episode: 12, tribal: "merge", council: 2, voter: "tiffany-ervin", target: "aubry-bracco" },
  { episode: 12, tribal: "merge", council: 2, voter: "joe-hunter", target: "cirie-fields" },
  { episode: 12, tribal: "merge", council: 2, voter: "rizo-velovic", target: "cirie-fields" },

  // Episode 13 — Final 5 tribal — tiffany-ervin voted out (4-1)
  // Rizo played Hidden Immunity Idol (0 votes against him, nullified nothing).
  { episode: 13, tribal: "merge", voter: "aubry-bracco", target: "tiffany-ervin" },
  { episode: 13, tribal: "merge", voter: "jonathan-young", target: "tiffany-ervin" },
  { episode: 13, tribal: "merge", voter: "tiffany-ervin", target: "aubry-bracco" },
  { episode: 13, tribal: "merge", voter: "joe-hunter", target: "tiffany-ervin" },
  { episode: 13, tribal: "merge", voter: "rizo-velovic", target: "tiffany-ervin" },

  // Episode 13 — FINAL TRIBAL COUNCIL — Jury vote for winner
  // Final 3: Aubry, Jonathan, Joe (Rizo lost fire-making — no votes). Aubry wins 8-3-0.
  // voter = juror, target = finalist they voted to win.
  { episode: 13, tribal: "final", voteType: "finale", voter: "christian-hubicki", target: "aubry-bracco" },
  { episode: 13, tribal: "final", voteType: "finale", voter: "cirie-fields", target: "aubry-bracco" },
  { episode: 13, tribal: "final", voteType: "finale", voter: "dee-valladares", target: "aubry-bracco" },
  { episode: 13, tribal: "final", voteType: "finale", voter: "emily-flippen", target: "aubry-bracco" },
  { episode: 13, tribal: "final", voteType: "finale", voter: "ozzy-lusth", target: "aubry-bracco" },
  { episode: 13, tribal: "final", voteType: "finale", voter: "rick-devens", target: "aubry-bracco" },
  { episode: 13, tribal: "final", voteType: "finale", voter: "rizo-velovic", target: "aubry-bracco" },
  { episode: 13, tribal: "final", voteType: "finale", voter: "tiffany-ervin", target: "aubry-bracco" },
  { episode: 13, tribal: "final", voteType: "finale", voter: "chrissy-hofbeck", target: "jonathan-young" },
  { episode: 13, tribal: "final", voteType: "finale", voter: "coach-wade", target: "jonathan-young" },
  { episode: 13, tribal: "final", voteType: "finale", voter: "stephenie-lagrossa-kendrick", target: "jonathan-young" },

];
