/**
 * Audience votes for "In the Hands of the Fans" — the fan polling that
 * shaped Survivor 50's rules and production. Sourced from the wiki page:
 * https://en.wikipedia.org/wiki/Survivor_50:_In_the_Hands_of_the_Fans
 *
 * One record per question; multiple questions per polling date. The
 * `episodeRevealed` is when the result was implemented on the show.
 */
export interface FanVoteOption {
  label: string;
  /** Share of votes (0-100). Omitted if the wiki didn't publish one. */
  percentage?: number;
  /** True for the option that the audience picked. */
  winner: boolean;
}

export interface FanVote {
  id: string;
  /** ISO date (YYYY-MM-DD) when the vote was decided. */
  date: string;
  /** Short topic, e.g. "Tribe colors" or "Idols". */
  subject: string;
  options: FanVoteOption[];
  /** Episode the chosen outcome was first visible on the show. */
  episodeRevealed: number;
}

export const fanVotes: FanVote[] = [
  // --- February 26, 2025 ---
  {
    id: "tribe-colors",
    date: "2025-02-26",
    subject: "Tribe colors",
    options: [
      { label: "Blue, orange, and green", winner: false },
      { label: "Orange, teal, and magenta", winner: true },
      { label: "Green, red, and yellow", winner: false },
    ],
    episodeRevealed: 1,
  },
  {
    id: "rice",
    date: "2025-02-26",
    subject: "Rice",
    options: [
      { label: "Give them rice!", percentage: 40, winner: false },
      { label: "Make players earn it!", percentage: 60, winner: true },
    ],
    episodeRevealed: 1,
  },
  {
    id: "final-four-fire-making",
    date: "2025-02-26",
    subject: "Final four fire-making",
    options: [
      { label: "Keep it", percentage: 60, winner: true },
      { label: "Lose it", percentage: 40, winner: false },
    ],
    episodeRevealed: 13,
  },
  {
    id: "vote-reveal-reunion",
    date: "2025-02-26",
    subject: "Vote reveal & reunion",
    options: [
      { label: "Do it live in Los Angeles!", winner: true },
      { label: "Keep it in Fiji!", winner: false },
    ],
    episodeRevealed: 13,
  },

  // --- March 19, 2025 ---
  {
    id: "final-four-challenge",
    date: "2025-03-19",
    subject: "Final four challenge",
    options: [
      { label: "Pinball Wizard", winner: false },
      { label: "The Obstacle Course", winner: false },
      { label: "Simmotion", percentage: 43, winner: true },
    ],
    episodeRevealed: 13,
  },
  {
    id: "advantages",
    date: "2025-03-19",
    subject: "Advantages",
    options: [
      { label: "Minimal power", winner: false },
      { label: "Strategic power", winner: false },
      { label: "Dynamic power", winner: true },
    ],
    episodeRevealed: 1,
  },
  {
    id: "tribe-switch",
    date: "2025-03-19",
    subject: "Tribe switch",
    options: [
      { label: "Yes", percentage: 78, winner: true },
      { label: "No", percentage: 22, winner: false },
    ],
    episodeRevealed: 3,
  },

  // --- April 16, 2025 ---
  {
    id: "immunity-necklace",
    date: "2025-04-16",
    subject: "Immunity necklace",
    options: [
      { label: "Design A (a medallion)", percentage: 16, winner: false },
      { label: "Design B (a decorative bird)", percentage: 84, winner: true },
    ],
    episodeRevealed: 6,
  },
  {
    id: "tribe-supplies",
    date: "2025-04-16",
    subject: "Tribe supplies",
    options: [
      {
        label: "Give them their camp supplies!",
        percentage: 47,
        winner: false,
      },
      {
        label: "Make them earn their camp supplies!",
        percentage: 53,
        winner: true,
      },
    ],
    episodeRevealed: 1,
  },
  {
    id: "twists",
    date: "2025-04-16",
    subject: "Twists",
    options: [
      {
        label: "I don't like twists — keep them rare!",
        percentage: 37,
        winner: false,
      },
      {
        label: "I love twists — bring them on!",
        percentage: 63,
        winner: true,
      },
    ],
    episodeRevealed: 6,
  },

  // --- May 14, 2025 ---
  {
    id: "idols",
    date: "2025-05-14",
    subject: "Idols",
    options: [
      { label: "No", percentage: 20, winner: false },
      { label: "Yes", percentage: 80, winner: true },
    ],
    episodeRevealed: 1,
  },
];
