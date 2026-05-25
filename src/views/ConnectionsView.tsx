import { useState, useMemo } from "react";
import { castData, currentTribe } from "../data/cast";
import { TRIBE_COLORS } from "../data/tribes";
import { PALETTE } from "../theme/palette";
import { handleImageError } from "../lib/imageFallback";
import { readableOnBackground } from "../lib/colorUtils";
import "./styles/connections.css";

export default function ConnectionsView() {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);

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

  const rawActivePlayer = selectedPlayer || hoveredPlayer;
  const activePlayer =
    rawActivePlayer && sortedPlayers.some((p) => p.name === rawActivePlayer)
      ? rawActivePlayer
      : null;
  const activeConnections = activePlayer ? connections.get(activePlayer) : null;

  return (
    <div className="connections-container" onClick={handleContainerClick}>
      <div className="connections-wrapper">
        {/* Players Grid */}
        <div className="connections-grid">
          {sortedPlayers.map((player) => {
            const tribeColor =
              TRIBE_COLORS[currentTribe(player.tribeJourney)] ?? PALETTE.ink;
            const isActive = activePlayer === player.name;
            const isConnected = activeConnections?.has(player.name);
            const isDimmed = activePlayer !== null && !isActive && !isConnected;
            const connectionCount = connections.get(player.name)?.size || 0;
            const sharedSeasons = activeConnections?.get(player.name) || [];

            const activeNameColor = readableOnBackground(tribeColor);
            const activeCountColor =
              activeNameColor === "#ffffff"
                ? "rgba(255, 255, 255, 0.88)"
                : "var(--color-text-muted)";

            return (
              <div
                key={player.name}
                className={`connection-card ${isDimmed ? "dimmed" : ""} ${isActive ? "active" : ""} ${isConnected ? "connected" : ""}`}
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
                  backgroundColor: isActive ? tribeColor : undefined,
                  borderColor: isConnected ? tribeColor : undefined,
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
                      color: isActive ? activeNameColor : undefined,
                      fontWeight: isActive || isConnected ? 600 : 400,
                    }}
                  >
                    {player.name.split(" ")[0]}
                  </div>
                  <div
                    className="connection-count"
                    style={{
                      color: isActive ? activeCountColor : undefined,
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
