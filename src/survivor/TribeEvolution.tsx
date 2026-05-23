import { useMemo } from "react";
import {
  type TribeAssignment,
  castData,
  currentTribe,
  palette,
  tribeAtEpisode,
  tribeColors,
} from "../data/table";
import { findEliminationRecord } from "../data/connections";
import { handleImageError } from "./imageFallback";
import { readableOnBackground } from "./colorUtils";
import "./styles/tribeevolution.css";

interface JourneyCard {
  name: string;
  photo: string;
  journey: TribeAssignment[];
  eliminated?: number;
  eliminationType?: "tribalCouncil" | "injury";
}

function colorForTribeName(tribeName: string) {
  const fromList = tribeColors.find((t) => t.name === tribeName)?.color;
  if (fromList) return fromList;
  return (
    palette[tribeName.toLowerCase() as keyof typeof palette] || palette.warmGray
  );
}

export default function TribeEvolution() {
  const orderedPlayers: JourneyCard[] = useMemo(() => {
    const journeys = castData.map((player) => {
      const eliminationRecord = findEliminationRecord(player.id);
      return {
        name: player.name,
        photo: player.photo,
        journey: player.tribeJourney,
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
          player; card color is the tribe they were on when voted out (or their
          latest tribe if still in the game).
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
            const tribeName = player.eliminated
              ? tribeAtEpisode(player.journey, player.eliminated)
              : currentTribe(player.journey);
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
                    loading="lazy"
                    decoding="async"
                    onError={handleImageError}
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
                  <div
                    className="elimination-card-sub"
                    style={{ color: mutedColor }}
                  >
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
