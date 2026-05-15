import { useMemo } from "react";
import { castData, palette, tribeColors } from "../data/table";
import { findEliminationRecord } from "./eliminationMatch";
import "./styles/tribeevolution.css";

interface JourneyCard {
  name: string;
  photo: string;
  tribes: string[];
  eliminated?: number;
  eliminationType?: "tribalCouncil" | "injury";
}

function parseColorToRgb(color: string): [number, number, number] | null {
  const c = color.trim();
  if (c.startsWith("#")) {
    const h = c.slice(1);
    const full =
      h.length === 3 ? h.split("").map((ch) => ch + ch).join("") : h;
    if (full.length !== 6) return null;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ];
  }
  const space = c.match(/rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  if (space) return [Number(space[1]), Number(space[2]), Number(space[3])];
  const comma = c.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (comma) return [Number(comma[1]), Number(comma[2]), Number(comma[3])];
  return null;
}

function readableOnBackground(bg: string): "#ffffff" | "#1A1A18" {
  const rgb = parseColorToRgb(bg);
  if (!rgb) return "#1A1A18";
  const [r, g, b] = rgb;
  const y = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return y > 0.55 ? "#1A1A18" : "#ffffff";
}

function colorForTribeName(tribeName: string) {
  const fromList = tribeColors.find((t) => t.name === tribeName)?.color;
  if (fromList) return fromList;
  return (
    palette[tribeName.toLowerCase() as keyof typeof palette] || palette.warmGray
  );
}

function tribeAtEpisode(tribes: string[], episode: number | undefined) {
  if (!episode || episode < 1) return tribes[tribes.length - 1];
  const idx = episode - 1;
  if (idx >= 0 && idx < tribes.length) return tribes[idx];
  return tribes[tribes.length - 1];
}

export default function TribeEvolution() {
  const orderedPlayers: JourneyCard[] = useMemo(() => {
    const journeys = castData.map((player) => {
      const eliminationRecord = findEliminationRecord(player.name);
      return {
        name: player.name,
        photo: player.photo,
        tribes: player.tribe,
        eliminated: eliminationRecord?.episode,
        eliminationType: eliminationRecord?.type,
      };
    });

    return journeys.sort((a, b) => {
      if (a.eliminated && b.eliminated) {
        if (a.eliminated !== b.eliminated) {
          return a.eliminated - b.eliminated;
        }
        return a.name.localeCompare(b.name);
      }
      if (a.eliminated) return -1;
      if (b.eliminated) return 1;
      return a.name.localeCompare(b.name);
    });
  }, []);

  return (
    <div className="tribe-evolution-container">
      <div className="tribe-evolution-wrapper">
        <p className="evolution-description">
          Elimination order for Season 50. Scroll horizontally to see each
          player; card color is the tribe they were on when voted out (or
          their latest tribe if still in the game).
        </p>

        <div className="evolution-legend">
          {tribeColors.map((tribe) => (
            <div key={tribe.name} className="legend-item">
              <div
                className="legend-color-box"
                style={{ backgroundColor: tribe.color }}
              />
              <span>{tribe.name}</span>
            </div>
          ))}
        </div>

        <div className="elimination-strip" role="list">
          {orderedPlayers.map((player) => {
            const tribeName = tribeAtEpisode(player.tribes, player.eliminated);
            const cardBg = colorForTribeName(tribeName);
            const textColor = readableOnBackground(cardBg);
            const mutedColor =
              textColor === "#ffffff"
                ? "rgba(255,255,255,0.85)"
                : "var(--color-text-muted)";

            const statusLine = player.eliminated
              ? `Episode ${player.eliminated}`
              : "Still in";
            const subLine = player.eliminated
              ? player.eliminationType === "injury"
                ? "Medical"
                : "Tribal"
              : null;

            return (
              <article
                key={player.name}
                className="elimination-card"
                role="listitem"
                style={{
                  backgroundColor: cardBg,
                  color: textColor,
                  borderColor: "var(--color-text)",
                }}
              >
                <div className="elimination-card-photo-wrap">
                  <img
                    src={player.photo}
                    alt={player.name}
                    className="elimination-card-photo"
                  />
                </div>
                <div className="elimination-card-name">
                  {player.name.split(" ")[0]}
                </div>
                <div
                  className="elimination-card-episode"
                  style={{ color: textColor }}
                >
                  {statusLine}
                </div>
                {subLine && (
                  <div className="elimination-card-sub" style={{ color: mutedColor }}>
                    {subLine}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
