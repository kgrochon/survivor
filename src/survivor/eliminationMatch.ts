import { eliminated, type Eliminated } from "../data/connections";

const normalizeName = (name: string) =>
  name.toLowerCase().replace(/[^a-z\s]/g, "").trim();

const firstName = (name: string) => normalizeName(name).split(/\s+/)[0] || "";

function levenshteinDistance(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0),
  );

  for (let i = 0; i <= a.length; i += 1) dp[i]![0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0]![j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(
        dp[i - 1]![j] + 1,
        dp[i]![j - 1] + 1,
        dp[i - 1]![j - 1] + cost,
      );
    }
  }

  return dp[a.length]![b.length]!;
}

export function matchesEliminationRecord(
  playerName: string,
  eliminatedName: string,
) {
  const playerNormalized = normalizeName(playerName);
  const eliminatedNormalized = normalizeName(eliminatedName);

  if (
    playerNormalized.includes(eliminatedNormalized) ||
    eliminatedNormalized.includes(playerNormalized)
  ) {
    return true;
  }

  const playerFirst = firstName(playerName);
  const eliminatedFirst = firstName(eliminatedName);
  if (!playerFirst || !eliminatedFirst) return false;
  if (playerFirst === eliminatedFirst) return true;

  return levenshteinDistance(playerFirst, eliminatedFirst) <= 1;
}

export function findEliminationRecord(
  playerName: string,
): Eliminated | undefined {
  return eliminated.find((el) =>
    matchesEliminationRecord(playerName, el.name),
  );
}
