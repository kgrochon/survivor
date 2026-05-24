import { castData } from "./cast";

export interface Eliminated {
  /** Stable id matching a `castData` member. */
  id: string;
  episode: number;
  type: "tribalCouncil" | "injury";
}

export const eliminated: Eliminated[] = [
  { id: "jenna-lewis-dougherty", episode: 1, type: "tribalCouncil" },
  { id: "kyle-fraser", episode: 1, type: "injury" },
  { id: "savannah-louie", episode: 2, type: "tribalCouncil" },
  { id: "q-burdette", episode: 3, type: "tribalCouncil" },
  { id: "mike-white", episode: 4, type: "tribalCouncil" },
  { id: "charlie-davis", episode: 5, type: "tribalCouncil" },
  { id: "angelina-keeley", episode: 5, type: "tribalCouncil" },
  { id: "kamilla-karthigesu", episode: 6, type: "tribalCouncil" },
  { id: "genevieve-mushaluk", episode: 6, type: "tribalCouncil" },
  { id: "colby-donaldson", episode: 6, type: "tribalCouncil" },
  { id: "dee-valladares", episode: 7, type: "tribalCouncil" },
  { id: "chrissy-hofbeck", episode: 8, type: "tribalCouncil" },
  { id: "coach-wade", episode: 8, type: "tribalCouncil" },
  { id: "christian-hubicki", episode: 9, type: "tribalCouncil" },
  { id: "stephenie-lagrossa-kendrick", episode: 10, type: "tribalCouncil" },
  { id: "emily-flippen", episode: 11, type: "tribalCouncil" },
  { id: "ozzy-lusth", episode: 11, type: "tribalCouncil" },
  { id: "rick-devens", episode: 12, type: "tribalCouncil" },
  { id: "cirie-fields", episode: 12, type: "tribalCouncil" },
];

const eliminatedById = new Map(eliminated.map((record) => [record.id, record]));

/** Look up a player's elimination record by their stable `castData` id. */
export function findEliminationRecord(id: string): Eliminated | undefined {
  return eliminatedById.get(id);
}

// Dev-time sanity check: surface typos that the old fuzzy matcher silently tolerated.
if (import.meta.env.DEV) {
  const knownIds = new Set(castData.map((p) => p.id));
  for (const record of eliminated) {
    if (!knownIds.has(record.id)) {
      console.warn(
        `connections: eliminated record references unknown cast id "${record.id}"`,
      );
    }
  }
}
