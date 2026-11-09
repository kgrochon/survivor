import BloodMoonSVG from "../img/blood-moon.svg"
import BoomerangSVG from "../img/boomerang-idol.svg"
import DuoSVG from "../img/double-duo.svg"
import FansSVG from "../img/hands-of-the-fans.svg"
import UrnSVG from "../img/one-in-the-urn.svg"
import RiceSVG from "../img/rice-side-bet.svg"
import BewareSVG from "../img/super-beware-advantage.svg"
import ZacSVG from "../img/zac-brown-reward.svg"

/**
 * What a twist did to the person it landed on. The card draws a mark for
 * each, so the set stays small enough to read without a legend.
 */
export type TwistOutcome =
  | "played" // used what they were given
  | "unused" // held it and never played it
  | "safe" // came through the twist untouched
  | "won" // took the bet, the flip, the challenge
  | "failed" // tried and it did not work
  | "out"; // the twist ended their game

/**
 * One line of a twist's diagram: something happened to `to`, optionally
 * because `from` handed it to them.
 */
export interface TwistStep {
  /** Omit when nobody passed anything — then the row is just an outcome. */
  from?: string;
  to: string;
  /**
   * Omit where the handoff is the whole story. The boomerang does this:
   * marking who played theirs turned a diagram of three arrows into a
   * verdict on each recipient, which is more than the row needs to say.
   */
  outcome?: TwistOutcome;
  /** Three or four words. Any longer and the diagram is prose again. */
  note?: string;
}

/**
 * Replaces the `howItPlayedOut` paragraph on twists whose events are
 * relational — who gave what to whom, and who walked away. Narrative
 * twists (the season premise, a celebrity reward) have no such shape and
 * keep their prose.
 */
export interface TwistDiagram {
  /** Column heading over the sources. Omit when no step has a `from`. */
  fromLabel?: string;
  toLabel: string;
  steps: TwistStep[];
}

export interface Twist {
  id: string;
  title: string;
  episode: number;
  mechanic: string;
  howItPlayedOut: string;
  involvedCast: string[];
  svgImage: string;
  /** When present, the card draws this instead of `howItPlayedOut`. */
  diagram?: TwistDiagram;
}

/** Celebrities, hosts, and other non-cast participants referenced by twists. */
export interface ProductionMember {
  id: string;
  name: string;
  photo: string;
  episodes: number[];
}

export const productionMembers: ProductionMember[] = [
  {
    id: "billie-eilish",
    name: "Billie Eilish",
    photo: "",
    episodes: [1],
  },
  {
    id: "zac-brown",
    name: "Zac Brown",
    photo: "",
    episodes: [4],
  },
  {
    id: "jeff-probst",
    name: "Jeff Probst",
    photo: "",
    episodes: [9],
  },
  {
    id: "jimmy-fallon",
    name: "Jimmy Fallon",
    photo: "",
    episodes: [9],
  },
  {
    id: "mrbeast",
    name: "MrBeast",
    photo: "",
    episodes: [10],
  },
];

export const twists: Twist[] = [
  {
    id: "in-the-hands-of-the-fans",
    title: "In the Hands of the Fans",
    episode: 0,
    mechanic:
      "The season's defining premise. Viewers vote on real game mechanics and production choices, while celebrity superfans pitch and lend their names to special twists and advantages.",
    howItPlayedOut:
      "During Survivor 48's airing, fans voted on elements including whether players started with rice (no), whether the finale would be revealed live in LA (yes), and buff colors. Combined with twists from Eilish, Fallon, Brown, and MrBeast, it made Survivor 50 the first season where the audience genuinely shaped the game's design.",
    involvedCast: [],
    svgImage: FansSVG,
  },
  {
    id: "billie-eilish-boomerang-idol",
    title: "The Billie Eilish Boomerang Idol",
    episode: 1,
    mechanic:
      "The finder can’t play this idol right away. They must give it to another player. If that player is voted out while still holding it, the idol boomerangs back to the finder for good.",
    howItPlayedOut:
      "Genevieve Mushaluk found two and sent them to Ozzy Lusth and Rizo Velovic. Christian Hubicki found a third and sent it to Aubry Bracco. Of the three recipients, Aubry was the only one who actually played her idol.",
    involvedCast: [
      "billie-eilish",
      "genevieve-mushaluk",
      "ozzy-lusth",
      "rizo-velovic",
      "christian-hubicki",
      "aubry-bracco",
    ],
    svgImage: BoomerangSVG,
    // Genevieve appears twice because she found two idols; two finds,
    // two handoffs, two separate fates.
    diagram: {
      fromLabel: "Found",
      toLabel: "Gave it to",
      steps: [
        { from: "genevieve-mushaluk", to: "ozzy-lusth" },
        { from: "genevieve-mushaluk", to: "rizo-velovic" },
        { from: "christian-hubicki", to: "aubry-bracco" },
      ],
    },
  },
  {
    id: "zac-brown-reward",
    title: "The Zac Brown Reward",
    episode: 4,
    mechanic:
      "A celebrity reward challenge. Tribes compete for immunity and a premium beachside reward hosted by a guest star — in this case, a feast and a private concert.",
    howItPlayedOut:
      "In episode 4, country star and Survivor superfan Zac Brown speared fish for the winning tribe and joined them for a feast of plantains, beans, and rice, capped by a private acoustic concert. It was the season's first on-island celebrity cameo, and players called it one of the best rewards in show history.",
    involvedCast: ["zac-brown"],
    svgImage: ZacSVG,
    // No outcomes here: everyone named simply went. With nothing to mark
    // and nothing to note, the card lays this out as a wrapped roster
    // rather than seven one-line rows.
    diagram: {
      toLabel: "Won the reward",
      steps: [
        { to: "colby-donaldson" },
        { to: "coach-wade" },
        { to: "aubry-bracco" },
        { to: "genevieve-mushaluk" },
        { to: "joe-hunter" },
        { to: "tiffany-ervin" },
        { to: "chrissy-hofbeck" },
      ],
    },
  },
  {
    id: "blood-moon",
    title: "The Blood Moon (Triple Elimination)",
    episode: 6,
    mechanic:
      "A merge-kickoff twist where the tribe is divided into three groups that each compete for individual immunity, then attend three separate, back-to-back Tribal Councils — sending three players home in a single night.",
    howItPlayedOut:
      "On Day 13, the 17-player merge tribe was hit with the twist. Ozzy Lusth found an advantage that sent him and Rizo Velovic to Exile Island, sparing them. The remaining 15 split into Orange, Pink, and Teal groups. Kamilla Karthigesu was blindsided, Genevieve Mushaluk's Shot in the Dark failed, and Colby Donaldson — battling a torn ligament and severe foot infection — was unanimously voted out.",
    involvedCast: [
      "ozzy-lusth",
      "rizo-velovic",
      "kamilla-karthigesu",
      "genevieve-mushaluk",
      "colby-donaldson",
    ],
    svgImage: BloodMoonSVG,
    diagram: {
      toLabel: "Three Tribals, one night",
      steps: [
        { to: "ozzy-lusth", outcome: "safe", note: "Exile" },
        { to: "rizo-velovic", outcome: "safe", note: "Exile" },
        { to: "kamilla-karthigesu", outcome: "out", note: "Blindsided" },
        {
          to: "genevieve-mushaluk",
          outcome: "out",
          note: "Shot in the Dark failed",
        },
        { to: "colby-donaldson", outcome: "out", note: "Unanimous" },
      ],
    },
  },
  {
    id: "double-duo",
    title: "The Double Duo",
    episode: 8,
    mechanic:
      "Players pair up before the immunity challenge, then learn their fates are linked. They vote as individuals, but each vote targets a duo — and both members of the chosen pair are eliminated together. Idols and Shots in the Dark, if played, protect both partners.",
    howItPlayedOut:
      "Cirie Fields was the odd one out, sent to Exile to find a marked coconut among 2,000 (she succeeded, earning safety and a vote). Rick Devens pulled off a fake idol bluff to protect himself and Aubry. The alliance then pivoted and sent home Coach Wade and Chrissy Hofbeck in the show's first-ever paired elimination.",
    involvedCast: [
      "cirie-fields",
      "rick-devens",
      "aubry-bracco",
      "coach-wade",
      "chrissy-hofbeck",
    ],
    svgImage: DuoSVG,
    diagram: {
      toLabel: "Linked fates",
      steps: [
        {
          to: "cirie-fields",
          outcome: "safe",
          note: "Exile, found the coconut",
        },
        { to: "rick-devens", outcome: "safe", note: "Fake idol bluff" },
        { to: "aubry-bracco", outcome: "safe", note: "Covered by the bluff" },
        { to: "coach-wade", outcome: "out", note: "Voted out as a pair" },
        { to: "chrissy-hofbeck", outcome: "out", note: "Voted out as a pair" },
      ],
    },
  },
  {
    id: "probst-rice-side-bet",
    title: "Jeff Probst Joins the Challenge (The Rice Side Bet)",
    episode: 9,
    mechanic:
      "A reframed rice negotiation. Instead of sitting out a challenge for rice, players make a side bet against the host himself — a group of them must each outlast Jeff Probst in an endurance challenge. If even one fails, the rice is forfeited; if all outlast him, the tribe earns it.",
    howItPlayedOut:
      "A Jimmy Fallon idea, polled live on The Tonight Show. For the first time in 50 seasons, Jeff competed against the players. Jonathan, Joe, Ozzy, and Tiffany took the bet. Jeff dropped after seven and a half minutes — to relentless trash-talk from the players — and all four bettors outlasted him, winning the rice.",
    involvedCast: [
      "jeff-probst",
      "jimmy-fallon",
      "jonathan-young",
      "joe-hunter",
      "ozzy-lusth",
      "tiffany-ervin",
    ],
    svgImage: RiceSVG,
    diagram: {
      toLabel: "The side bet",
      steps: [
        { to: "jonathan-young", outcome: "won", note: "Outlasted" },
        { to: "joe-hunter", outcome: "won", note: "Outlasted" },
        { to: "ozzy-lusth", outcome: "won", note: "Outlasted" },
        { to: "tiffany-ervin", outcome: "won", note: "Outlasted" },
        { to: "jeff-probst", outcome: "failed", note: "Dropped at 7:30" },
      ],
    },
  },
  {
    id: "jimmy-fallon-one-in-the-urn",
    title: 'The Jimmy Fallon "One in the Urn"',
    episode: 9,
    mechanic:
      "A journey advantage with steep risk. The player must complete a puzzle within a time limit. Success earns an extra vote pre-loaded into the urn before Tribal begins. Failure flips it into a penalty — and the player must publicly reveal the outcome to the tribe.",
    howItPlayedOut:
      "Joe Hunter sent Christian Hubicki on the journey via a rock-paper-scissors tournament. Christian failed the puzzle, triggering the worst-case penalty: for the first time in Survivor history, a player was forced to write down their own name at Tribal Council. He was eliminated in a 6-3-2 vote.",
    involvedCast: ["jimmy-fallon", "joe-hunter", "christian-hubicki"],
    svgImage: UrnSVG,
    diagram: {
      fromLabel: "Sent by",
      toLabel: "Went on the journey",
      steps: [
        {
          from: "joe-hunter",
          to: "christian-hubicki",
          outcome: "out",
          note: "Failed, forced to write his own name",
        },
      ],
    },
  },
  {
    id: "The MrBeast Super Beware Advantage",
    title: "The MrBeast Super Beware Advantage",
    episode: 10,
    mechanic:
      "A high-stakes coin flip. One player volunteers (or the group goes to rocks to decide who) to flip a coin and call heads or tails. A correct call grants immunity, a hidden idol, and doubles the season's prize money. A wrong call eliminates the flipper instantly, with no vote held.",
    howItPlayedOut:
      "MrBeast revealed the coin at Tribal after arriving at the auction with a mystery briefcase. Rick Devens immediately volunteered, called heads, and won — granting himself safety and pushing the prize pot to a record $2 million. The chaotic live Tribal that followed sent Stephenie LaGrossa Kendrick home.",
    involvedCast: ["mrbeast", "rick-devens", "stephenie-lagrossa-kendrick"],
    svgImage: BewareSVG,
    diagram: {
      toLabel: "The coin flip",
      steps: [
        { to: "rick-devens", outcome: "won", note: "Called heads, idol + $2M" },
        {
          to: "stephenie-lagrossa-kendrick",
          outcome: "out",
          note: "Voted out at the Tribal that followed",
        },
      ],
    },
  },
];

interface GameFact {
  id: string;
  name: string;
  stat: string;
  twistId?: string;
  banner?: string;
}

export const gameFacts: GameFact[] = [
  {
    id: "sole-survivor",
    name: "Sole Survivor",
    stat: "Aubry Bracco",
    banner: "Wins Season 50 in an 8–3–0 Vote",
  },
  {
    id: "winning-pot",
    name: "Winning Pot",
    stat: "$2M",
    banner: "Rick Devens Wins $2M Coin Flip Twist",
    twistId: "The MrBeast Super Beware Advantage"
  },
  {
    id: "castaways",
    name: "Castaways",
    stat: "24",
    banner: "Largest Cast in Show History",
  },
{
  id: "premiere-length",
  name: "Premiere Runtime",
  stat: "3 Hours",
  banner: "Longest Non-Finale Episode Ever",
},
{
  id: "season-days",
  name: "Days Played",
  stat: "26",
}

]