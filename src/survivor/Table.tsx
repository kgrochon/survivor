import { useState, useMemo } from "react";
import {
  type SeasonGroup,
  castData,
  currentTribe,
  eraStyles,
  getEra,
  palette,
} from "../data/table";
import { findEliminationRecord } from "../data/connections";
import { getSeasonSubtitle } from "../data/seasons";
import { handleImageError } from "./imageFallback";
import "./styles/table.css";

type TableProps = {
  showSpoilers: boolean;
};

// Build the era legend from the data so labels reflect the actual seasons
// present rather than a hardcoded range that drifts from `getEra`.
const seasonsByEra = new Map<string, number[]>();
castData.forEach((p) =>
  p.seasons.forEach((s) => {
    const era = getEra(s.season);
    const list = seasonsByEra.get(era);
    if (list) list.push(s.season);
    else seasonsByEra.set(era, [s.season]);
  }),
);
const eras = (Object.keys(eraStyles) as Array<keyof typeof eraStyles>).map(
  (key) => {
    const seasons = seasonsByEra.get(key) ?? [];
    if (seasons.length === 0) {
      return { key, label: eraStyles[key].label };
    }
    const min = Math.min(...seasons);
    const max = Math.max(...seasons);
    const range = min === max ? `${min}` : `${min}–${max}`;
    return { key, label: `${eraStyles[key].label} (${range})` };
  },
);

export default function Table({ showSpoilers }: TableProps) {
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const seasonGroups: SeasonGroup[] = useMemo(() => {
    const map = new Map<
      number,
      {
        subtitle: string;
        players: Map<string, { id: string; photo: string; tribe: string }>;
      }
    >();
    castData.forEach((player) => {
      player.seasons.forEach((s) => {
        if (!map.has(s.season)) {
          map.set(s.season, {
            subtitle: getSeasonSubtitle(s.season),
            players: new Map(),
          });
        }
        map.get(s.season)!.players.set(player.name, {
          id: player.id,
          photo: player.photo,
          tribe: currentTribe(player.tribeJourney),
        });
      });
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([season, data]) => ({
        season,
        subtitle: data.subtitle,
        players: Array.from(data.players.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([name, { id, photo, tribe }]) => ({ id, name, photo, tribe })),
      }));
  }, []);

  const playerSeasons = useMemo(() => {
    const map = new Map<string, number[]>();
    castData.forEach((p) =>
      map.set(
        p.name,
        p.seasons.map((s) => s.season),
      ),
    );
    return map;
  }, []);

  const displaySeasonGroups = useMemo(() => {
    if (!showSpoilers || !showActiveOnly) return seasonGroups;
    return seasonGroups
      .map((group) => ({
        ...group,
        players: group.players.filter((p) => !findEliminationRecord(p.id)),
      }))
      .filter((group) => group.players.length > 0);
  }, [seasonGroups, showSpoilers, showActiveOnly]);

  // Derive the active player — null it out if the underlying player has
  // been filtered out of the current view, so we don't need a cleanup
  // effect to chase stale selections.
  const rawActivePlayer = selectedPlayer || hoveredPlayer;
  const activePlayer =
    rawActivePlayer &&
    displaySeasonGroups.some((g) =>
      g.players.some((p) => p.name === rawActivePlayer),
    )
      ? rawActivePlayer
      : null;
  const highlightedSeasons = activePlayer
    ? new Set(playerSeasons.get(activePlayer) || [])
    : new Set<number>();

  const handlePlayerClick = (playerName: string) => {
    if (selectedPlayer === playerName) {
      setSelectedPlayer(null);
    } else {
      setSelectedPlayer(playerName);
    }
  };

  const handleContainerClick = () => {
    if (selectedPlayer !== null) {
      setSelectedPlayer(null);
      setHoveredPlayer(null);
    }
  };

  return (
    <div className="survivor-table-container" onClick={handleContainerClick}>
      <div className="survivor-table-wrapper">
        {/* Overview */}
        <div className="survivor-overview">
          <p>
            A comprehensive timeline of all Season 50 contestants across their
            Survivor careers
          </p>
          <p className="survivor-subtext">
            Click or hover over any player to see all the seasons they competed
            in.
          </p>
        </div>

        {showSpoilers && (
          <div className="table-toolbar">
            <div className="survivor-spoiler-wrap">
              <span
                className="survivor-spoiler-label"
                id="table-show-active-label"
              >
                Show active players only
              </span>
              <button
                type="button"
                className={`survivor-spoiler-switch ${showActiveOnly ? "is-on" : ""}`}
                role="switch"
                aria-checked={showActiveOnly}
                aria-labelledby="table-show-active-label"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActiveOnly((v) => !v);
                }}
              >
                <span className="survivor-spoiler-thumb" aria-hidden />
              </button>
            </div>
          </div>
        )}

        {/* Era Legend */}
        <div className="era-legend">
          {eras.map((e) => (
            <div key={e.key} className="era-item">
              <div
                className="era-dot"
                style={{ backgroundColor: eraStyles[e.key].color }}
              />
              <span className="era-label">{e.label}</span>
            </div>
          ))}
        </div>

        {/* Season Blocks */}
        <div className="seasons-container">
          {displaySeasonGroups.map((group, i) => {
            const era = getEra(group.season);
            const style = eraStyles[era];
            const isHighlighted = highlightedSeasons.has(group.season);
            const isDimmed = activePlayer !== null && !isHighlighted;

            return (
              <div
                key={group.season}
                className={`season-row ${isDimmed ? "dimmed" : ""} ${isHighlighted ? "highlighted" : ""}`}
                style={{
                  animation: `fadeInUp 0.4s ease ${i * 0.04}s both`,
                  borderLeft: `4px solid ${style.color}`,
                  backgroundColor: `${style.color}${isHighlighted ? "ad" : "36"}`,
                }}
              >
                {/* Season Label */}
                <div
                  className="season-label"
                  style={{
                    backgroundColor: isHighlighted
                      ? style.color
                      : "transparent",
                  }}
                >
                  <div className="season-number">Season {group.season}</div>
                  <div className="season-subtitle">{group.subtitle}</div>
                </div>

                {/* Players Grid */}
                <div className="players-container">
                  {group.players.map((player) => {
                    const timesPlayed =
                      playerSeasons.get(player.name)?.length || 1;
                    const isThisPlayerActive = activePlayer === player.name;
                    const isPlayerDimmed =
                      activePlayer !== null &&
                      !isThisPlayerActive &&
                      !isHighlighted;
                    const tribeColor =
                      palette[
                        player.tribe.toLowerCase() as keyof typeof palette
                      ] || palette.ink;

                    const eliminationRecord = showSpoilers
                      ? findEliminationRecord(player.id)
                      : undefined;
                    const isEliminated = !!eliminationRecord;
                    const eliminationType = eliminationRecord?.type;

                    return (
                      <div
                        key={player.name}
                        className={`player-card ${isPlayerDimmed ? "dimmed" : ""} ${isEliminated ? "eliminated" : ""} ${eliminationType === "injury" ? "injury" : ""}`}
                        role="button"
                        tabIndex={0}
                        aria-pressed={selectedPlayer === player.name}
                        aria-label={`${player.name}, view seasons`}
                        onMouseEnter={() =>
                          !selectedPlayer && setHoveredPlayer(player.name)
                        }
                        onMouseLeave={() =>
                          !selectedPlayer && setHoveredPlayer(null)
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayerClick(player.name);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePlayerClick(player.name);
                          }
                        }}
                        style={{
                          backgroundColor: tribeColor,
                        }}
                      >
                        {/* Photo with frame */}
                        <div className="photo-frame">
                          <img
                            src={player.photo}
                            alt={player.name}
                            className="player-photo"
                            loading="lazy"
                            decoding="async"
                            onError={handleImageError}
                          />
                          {/* Elimination badge */}
                          {isEliminated && (
                            <div className="elimination-badge">
                              {eliminationType === "injury"
                                ? "INJURED"
                                : "ELIMINATED"}
                            </div>
                          )}
                          {/* Times played badge */}
                          {timesPlayed > 1 && (
                            <div
                              className="times-played-badge"
                              style={{ backgroundColor: tribeColor }}
                            >
                              {timesPlayed}×
                            </div>
                          )}
                        </div>

                        {/* Name */}
                        <div
                          className="player-name"
                          style={{
                            fontWeight: isThisPlayerActive ? 600 : 400,
                            color: "black",
                          }}
                        >
                          {player.name.split(" ")[0]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
