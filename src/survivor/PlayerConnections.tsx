import { useState, useMemo } from "react";
import { castData, palette } from "../data/table";
import { findEliminationRecord } from "../data/connections";
import { handleImageError } from "./imageFallback";
import { readableOnBackground } from "./colorUtils";
import "./styles/connections.css";

type PlayerConnectionsProps = {
  showSpoilers: boolean;
};

export default function PlayerConnections({
  showSpoilers,
}: PlayerConnectionsProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  // Calculate connections between players (shared seasons)
  const connections = useMemo(() => {
    const connectionMap = new Map<string, Map<string, number[]>>();

    castData.forEach((player1) => {
      const player1Seasons = new Set(player1.seasons.map((s) => s.season));

      castData.forEach((player2) => {
        if (player1.name === player2.name) return;

        const sharedSeasons = player2.seasons
          .map((s) => s.season)
          .filter((season) => player1Seasons.has(season));

        if (sharedSeasons.length > 0) {
          if (!connectionMap.has(player1.name)) {
            connectionMap.set(player1.name, new Map());
          }
          connectionMap.get(player1.name)!.set(player2.name, sharedSeasons);
        }
      });
    });

    return connectionMap;
  }, []);

  const handlePlayerClick = (playerName: string) => {
    if (selectedPlayer === playerName) {
      setSelectedPlayer(null);
    } else {
      setSelectedPlayer(playerName);
    }
  };

  const handleContainerClick = () => {
    setSelectedPlayer(null);
    setHoveredPlayer(null);
  };

  // Sort players by number of connections
  const sortedPlayers = useMemo(() => {
    return [...castData].sort((a, b) => {
      const aConnections = connections.get(a.name)?.size || 0;
      const bConnections = connections.get(b.name)?.size || 0;
      return bConnections - aConnections;
    });
  }, [connections]);

  const displayPlayers = useMemo(() => {
    if (!showSpoilers || !showActiveOnly) return sortedPlayers;
    return sortedPlayers.filter((p) => !findEliminationRecord(p.id));
  }, [sortedPlayers, showActiveOnly, showSpoilers]);

  // Derive the active player — null it out if the underlying player has
  // been filtered out of the current view, so we don't need a cleanup
  // effect to chase stale selections.
  const rawActivePlayer = selectedPlayer || hoveredPlayer;
  const activePlayer =
    rawActivePlayer && displayPlayers.some((p) => p.name === rawActivePlayer)
      ? rawActivePlayer
      : null;
  const activeConnections = activePlayer ? connections.get(activePlayer) : null;

  return (
    <div className="connections-container" onClick={handleContainerClick}>
      <div className="connections-wrapper">
        {/* Overview */}
        <div className="survivor-overview">
          <p>Explore the web of relationships between returning players</p>
          <p className="survivor-subtext">
            Click or hover over a player to see their network
          </p>
        </div>

        {showSpoilers && (
          <div className="connections-toolbar">
            <div className="survivor-spoiler-wrap">
              <span
                className="survivor-spoiler-label"
                id="connections-show-active-label"
              >
                Show active players only
              </span>
              <button
                type="button"
                className={`survivor-spoiler-switch ${showActiveOnly ? "is-on" : ""}`}
                role="switch"
                aria-checked={showActiveOnly}
                aria-labelledby="connections-show-active-label"
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

        {/* Players Grid */}
        <div className="connections-grid">
          {displayPlayers.map((player) => {
            const tribeColor =
              palette[
                player.tribe[
                  player.tribe.length - 1
                ].toLowerCase() as keyof typeof palette
              ] || palette.ink;
            const isActive = activePlayer === player.name;
            const isConnected = activeConnections?.has(player.name);
            const isDimmed = activePlayer !== null && !isActive && !isConnected;
            const connectionCount = connections.get(player.name)?.size || 0;
            const sharedSeasons = activeConnections?.get(player.name) || [];

            const eliminationRecord = showSpoilers
              ? findEliminationRecord(player.id)
              : undefined;
            const isEliminated = !!eliminationRecord;
            const eliminationType = eliminationRecord?.type;

            const highlightNameColor = isEliminated
              ? "var(--color-text)"
              : readableOnBackground(tribeColor);
            const highlightCountColor = isEliminated
              ? "var(--color-text-muted)"
              : readableOnBackground(tribeColor) === "#ffffff"
                ? "rgba(255, 255, 255, 0.88)"
                : "var(--color-text-muted)";

            return (
              <div
                key={player.name}
                className={`connection-card ${isDimmed ? "dimmed" : ""} ${isActive ? "active" : ""} ${isConnected ? "connected" : ""} ${isEliminated ? "eliminated" : ""} ${eliminationType === "injury" ? "injury" : ""}`}
                role="button"
                tabIndex={0}
                aria-pressed={selectedPlayer === player.name}
                aria-label={`${player.name}, view shared seasons`}
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
                onMouseEnter={() =>
                  !selectedPlayer && setHoveredPlayer(player.name)
                }
                onMouseLeave={() => !selectedPlayer && setHoveredPlayer(null)}
                style={{
                  backgroundColor: isActive ? tribeColor : "#ffffff",
                  borderColor: isConnected ? tribeColor : "var(--color-text)",
                }}
              >
                <div className="connection-photo-container">
                  <img
                    src={player.photo}
                    alt={player.name}
                    className="connection-photo"
                    loading="lazy"
                    decoding="async"
                    onError={handleImageError}
                  />
                  {isEliminated && (
                    <div className="elimination-badge-conn">
                      {eliminationType === "injury" ? "INJURED" : "ELIMINATED"}
                    </div>
                  )}
                  {isConnected && sharedSeasons.length > 0 && (
                    <div
                      className="shared-seasons-badge"
                      style={{ backgroundColor: tribeColor }}
                    >
                      {sharedSeasons.length}
                    </div>
                  )}
                </div>
                <div className="connection-info">
                  <div
                    className="connection-name"
                    style={{
                      color: isActive
                        ? highlightNameColor
                        : "var(--color-text)",
                      fontWeight: isActive || isConnected ? 600 : 400,
                    }}
                  >
                    {player.name.split(" ")[0]}
                  </div>
                  <div
                    className="connection-count"
                    style={{
                      color: isActive
                        ? highlightCountColor
                        : "var(--color-text-muted)",
                    }}
                  >
                    {connectionCount}{" "}
                    {connectionCount === 1 ? "connection" : "connections"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
