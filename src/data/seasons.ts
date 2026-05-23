/**
 * Subtitles for every Survivor season referenced by the cast roster.
 * Centralised so fixing a typo in "Kaôh Rōng" (or any other subtitle)
 * happens in one place instead of being duplicated across every cast
 * member who appeared on that season.
 */
export const SEASONS: Record<number, string> = {
  1: "Borneo",
  2: "The Australian Outback",
  8: "All-Stars",
  10: "Palau",
  11: "Guatemala",
  12: "Panama-Exile Island",
  13: "Cook Islands",
  16: "Micronesia",
  18: "Tocantins",
  20: "Heroes vs. Villains",
  23: "South Pacific",
  32: "Kaôh Rōng",
  34: "Game Changers",
  35: "Heroes vs. Healers vs. Hustlers",
  37: "David vs. Goliath",
  38: "Edge of Extinction",
  42: "Survivor 42",
  45: "Survivor 45",
  46: "Survivor 46",
  47: "Survivor 47",
  48: "Survivor 48",
  49: "Survivor 49",
};

/** Subtitle for a season, falling back to `Survivor N` if not in the catalog. */
export function getSeasonSubtitle(season: number): string {
  return SEASONS[season] ?? `Survivor ${season}`;
}
