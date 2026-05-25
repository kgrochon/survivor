import { useMemo } from "react";
import {
  type TribeAssignment,
  castData,
  currentTribe,
  tribeAtEpisode,
} from "../data/cast";
import { TRIBE_COLORS, TRIBES } from "../data/tribes";
import { findEliminationRecord } from "../data/connections";
import { handleImageError } from "../lib/imageFallback";
import { readableOnBackground } from "../lib/colorUtils";
import "./styles/journeys.css";

interface JourneyCard {
  name: string;
  photo: string;
  journey: TribeAssignment[];
  eliminated?: number;
  eliminationType?: "tribalCouncil" | "injury" | "fire" | "jury";
}

export default function JourneysView() {
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
          {TRIBES.map((tribe) => (
            <div key={tribe} className="legend-item">
              <div
                className="legend-color-box"
                style={{ backgroundColor: TRIBE_COLORS[tribe] }}
              />
              <span>{tribe}</span>
            </div>
          ))}
        </div>

        <div className="elimination-strip" role="list">
          {orderedPlayers.map((player) => {
            const tribeName = player.eliminated
              ? tribeAtEpisode(player.journey, player.eliminated)
              : currentTribe(player.journey);
            const cardBg = TRIBE_COLORS[tribeName];
            const textColor = readableOnBackground(cardBg);
            const mutedColor =
              textColor === "#ffffff"
                ? "rgba(255,255,255,0.85)"
                : "var(--color-text-muted)";

            const isWinner = !player.eliminated;
            const statusLine = isWinner
              ? "Winner"
              : `Episode ${player.eliminated}`;
            const subLine = isWinner
              ? "Sole Survivor"
              : player.eliminationType === "injury"
                ? "Medical"
                : player.eliminationType === "fire"
                  ? "Fire"
                  : player.eliminationType === "jury"
                    ? "Jury"
                    : "Tribal";

            return (
              <article
                key={player.name}
                className={`elimination-card ${isWinner ? "is-winner" : ""}`}
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
                <div
                  className="elimination-card-sub"
                  style={{ color: mutedColor }}
                >
                  {subLine}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
