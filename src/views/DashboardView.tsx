import { useCallback, useMemo, useRef, useState } from "react";
import { castData, type CastMember } from "../data/cast";
import {
  twists,
  productionMembers,
  type Twist,
  type ProductionMember,
} from "../data/twists";
import { findEliminationRecord } from "../data/connections";
import { challengesWonBy } from "../data/challenges";
import { getSeasonSubtitle } from "../data/seasons";
import { TRIBE_COLORS } from "../data/tribes";
import { fanVotes } from "../data/fanVotes";
import { handleImageError } from "../lib/imageFallback";
import logoUrl from "../img/survivor-50-logo.png";
import "./styles/dashboard.css";

const CENTER_TWIST_ID = "in-the-hands-of-the-fans";

type Selection =
  | { kind: "player"; id: string }
  | { kind: "twist"; id: string }
  | null;

interface InvolvedAvatar {
  id: string;
  name: string;
  photo: string;
  kind: "player" | "production";
}

function resolveInvolved(
  ids: string[],
  players: Map<string, CastMember>,
  production: Map<string, ProductionMember>,
): InvolvedAvatar[] {
  return ids
    .map<InvolvedAvatar | null>((id) => {
      const p = players.get(id);
      if (p) return { id, name: p.name, photo: p.photo, kind: "player" };
      const prod = production.get(id);
      if (prod)
        return { id, name: prod.name, photo: prod.photo, kind: "production" };
      return null;
    })
    .filter((x): x is InvolvedAvatar => x !== null);
}

const ASIDE_MIN_WIDTH = 240;
const ASIDE_MAX_WIDTH = 560;
const ASIDE_DEFAULT_WIDTH = 320;

/** Other Season-50 castaways this player has played a prior season with. */
function findSharedHistory(player: CastMember): Array<{
  member: CastMember;
  sharedSeasons: number[];
}> {
  const mine = new Set(player.seasons.map((s) => s.season));
  const matches: Array<{ member: CastMember; sharedSeasons: number[] }> = [];
  for (const other of castData) {
    if (other.id === player.id) continue;
    const shared = other.seasons
      .map((s) => s.season)
      .filter((s) => mine.has(s));
    if (shared.length > 0) matches.push({ member: other, sharedSeasons: shared });
  }
  return matches.sort(
    (a, b) =>
      b.sharedSeasons.length - a.sharedSeasons.length ||
      a.member.name.localeCompare(b.member.name),
  );
}

function placementSummary(player: CastMember): {
  status: string;
  detail: string;
} {
  const elim = findEliminationRecord(player.id);
  if (!elim) return { status: "Sole Survivor", detail: "Winner of Season 50" };
  const type = elim.type;
  const label =
    type === "injury"
      ? "Medevac"
      : type === "fire"
        ? "Lost at fire"
        : type === "jury"
          ? "Jury vote (Final 3)"
          : "Voted out";
  return { status: `Out · Ep ${elim.episode}`, detail: label };
}

interface PlayerDetailProps {
  player: CastMember;
  onClose: () => void;
}

function PlayerDetail({ player, onClose }: PlayerDetailProps) {
  const elim = findEliminationRecord(player.id);
  const shared = useMemo(() => findSharedHistory(player), [player]);
  const challenges = useMemo(() => challengesWonBy(player.id), [player]);
  const { status, detail } = placementSummary(player);

  return (
    <div className="player-detail">
      <button
        type="button"
        className="player-detail-close"
        onClick={onClose}
        aria-label="Back to season overview"
      >
        ← Back
      </button>

      <div className="player-detail-portrait">
        <img
          src={player.httpPhoto}
          alt={player.name}
          loading="eager"
          decoding="async"
          onError={handleImageError}
        />
      </div>

      <header className="player-detail-head">
        <h2 className="player-detail-name">{player.name}</h2>
        <div className="player-detail-status">
          <span
            className={`player-detail-status-badge ${elim ? "" : "is-winner"}`}
          >
            {status}
          </span>
          <span className="player-detail-status-detail">{detail}</span>
        </div>
      </header>

      <section className="player-detail-section">
        <h3 className="player-detail-section-title">Tribe Timeline</h3>
        <ol className="player-detail-tribes">
          {(() => {
            // A tribe event only matters if the player was still in by the time
            // it started. Drop later tribes for anyone eliminated before them.
            const visible = elim
              ? player.tribeJourney.filter((e) => e.fromEpisode <= elim.episode)
              : player.tribeJourney;

            return visible.map((event, i) => {
              const next = visible[i + 1];
              // End-of-segment is the episode before the next tribe event,
              // or the elimination episode if there isn't one (clamped).
              let tillEp: number | null;
              if (next) {
                tillEp = elim
                  ? Math.min(next.fromEpisode - 1, elim.episode)
                  : next.fromEpisode - 1;
              } else {
                tillEp = elim ? elim.episode : null;
              }

              const rangeLabel =
                tillEp === null
                  ? `Ep ${event.fromEpisode}+`
                  : event.fromEpisode === tillEp
                    ? `Ep ${event.fromEpisode}`
                    : `Eps ${event.fromEpisode}–${tillEp}`;

              return (
                <li key={i} className="player-detail-tribe-row">
                  <span
                    className="player-detail-tribe-dot"
                    style={{ backgroundColor: TRIBE_COLORS[event.tribe] }}
                  />
                  <span className="player-detail-tribe-name">
                    {event.tribe}
                  </span>
                  <span className="player-detail-tribe-range">
                    {rangeLabel}
                  </span>
                </li>
              );
            });
          })()}
        </ol>
      </section>

      <section className="player-detail-section">
        <h3 className="player-detail-section-title">
          Past Seasons
          <span className="player-detail-section-count">
            {player.seasons.length}
          </span>
        </h3>
        <ol className="player-detail-seasons">
          {player.seasons
            .slice()
            .sort((a, b) => a.season - b.season)
            .map((s) => (
              <li key={s.season} className="player-detail-season-row">
                <span className="player-detail-season-num">S{s.season}</span>
                <span className="player-detail-season-title">
                  {getSeasonSubtitle(s.season)}
                </span>
              </li>
            ))}
        </ol>
      </section>

      <section className="player-detail-section">
        <h3 className="player-detail-section-title">
          Challenges Won
          <span className="player-detail-section-count">
            {challenges.length}
          </span>
        </h3>
        {challenges.length === 0 ? (
          <p className="player-detail-empty">No challenge wins logged yet.</p>
        ) : (
          <ol className="player-detail-challenges">
            {challenges.map((c) => (
              <li key={c.id} className="player-detail-challenge-row">
                <span className="player-detail-challenge-ep">
                  Ep {c.episode}
                </span>
                <span className="player-detail-challenge-title">
                  {c.title ?? challengeTypeLabel(c.type)}
                </span>
                <span className="player-detail-challenge-type">
                  {challengeTypeLabel(c.type)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="player-detail-section">
        <h3 className="player-detail-section-title">
          Played With
          <span className="player-detail-section-count">{shared.length}</span>
        </h3>
        {shared.length === 0 ? (
          <p className="player-detail-empty">
            No prior shared seasons with this cast.
          </p>
        ) : (
          <ul className="player-detail-played-with">
            {shared.map(({ member, sharedSeasons }) => (
              <li
                key={member.id}
                className="player-detail-played-row"
                title={`Shared: S${sharedSeasons.join(", S")}`}
              >
                <div className="player-detail-played-photo">
                  <img
                    src={member.photo}
                    alt={member.name}
                    loading="lazy"
                    onError={handleImageError}
                  />
                </div>
                <span className="player-detail-played-name">
                  {member.name.split(" ")[0]}
                </span>
                <span className="player-detail-played-count">
                  ×{sharedSeasons.length}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function challengeTypeLabel(type: string): string {
  switch (type) {
    case "individual-immunity":
      return "Individual Immunity";
    case "individual-reward":
      return "Individual Reward";
    case "immunity":
      return "Immunity";
    case "reward":
      return "Reward";
    default:
      return type;
  }
}

interface TwistDetailProps {
  twist: Twist;
  onClose: () => void;
}

function TwistDetail({ twist, onClose }: TwistDetailProps) {
  const involved = useMemo(() => {
    const playerMap = new Map<string, CastMember>();
    castData.forEach((p) => playerMap.set(p.id, p));
    const prodMap = new Map<string, ProductionMember>();
    productionMembers.forEach((m) => prodMap.set(m.id, m));
    return resolveInvolved(twist.involvedCast, playerMap, prodMap);
  }, [twist]);

  return (
    <div className="player-detail twist-detail">
      <button
        type="button"
        className="player-detail-close"
        onClick={onClose}
        aria-label="Back to season overview"
      >
        ← Back
      </button>

      <div className="twist-detail-art">
        <div className="twist-detail-art-glow" aria-hidden />
        <img
          src={twist.svgImage}
          alt=""
          className="twist-detail-art-img"
          loading="eager"
          decoding="async"
        />
      </div>

      <header className="player-detail-head">
        <span className="twist-detail-ep">
          EP {twist.episode.toString().padStart(2, "0")}
        </span>
        <h2 className="player-detail-name">{twist.title}</h2>
      </header>

      <section className="player-detail-section">
        <h3 className="player-detail-section-title">Mechanic</h3>
        <p className="twist-detail-text">{twist.mechanic}</p>
      </section>

      <section className="player-detail-section">
        <h3 className="player-detail-section-title">How it played out</h3>
        <p className="twist-detail-text">{twist.howItPlayedOut}</p>
      </section>

      {involved.length > 0 && (
        <section className="player-detail-section">
          <h3 className="player-detail-section-title">
            Involved
            <span className="player-detail-section-count">
              {involved.length}
            </span>
          </h3>
          <ul className="player-detail-played-with">
            {involved.map((a) => (
              <li
                key={a.id}
                className={`player-detail-played-row twist-detail-involved twist-detail-involved--${a.kind}`}
              >
                <div className="player-detail-played-photo">
                  {a.photo ? (
                    <img
                      src={a.photo}
                      alt={a.name}
                      loading="lazy"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="twist-detail-involved-fallback">
                      {a.name
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((p) => p[0])
                        .join("")}
                    </div>
                  )}
                </div>
                <span className="player-detail-played-name">
                  {a.name.split(" ")[0]}
                </span>
                {a.kind === "production" && (
                  <span className="twist-detail-involved-tag">Guest</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default function DashboardView() {
  const orderedTwists = useMemo(
    () => [...twists].sort((a, b) => a.episode - b.episode),
    [],
  );
  const centerTwist = useMemo(
    () => twists.find((t) => t.id === CENTER_TWIST_ID) ?? null,
    [],
  );
  const satelliteTwists = useMemo(
    () => orderedTwists.filter((t) => t.id !== CENTER_TWIST_ID),
    [orderedTwists],
  );

  const [asideWidth, setAsideWidth] = useState(ASIDE_DEFAULT_WIDTH);
  const [selection, setSelection] = useState<Selection>(null);
  const draggingRef = useRef(false);

  const selectedPlayer = useMemo(
    () =>
      selection?.kind === "player"
        ? castData.find((p) => p.id === selection.id) ?? null
        : null,
    [selection],
  );
  const selectedTwist = useMemo(
    () =>
      selection?.kind === "twist"
        ? twists.find((t) => t.id === selection.id) ?? null
        : null,
    [selection],
  );

  const togglePlayer = useCallback((id: string) => {
    setSelection((curr) =>
      curr?.kind === "player" && curr.id === id ? null : { kind: "player", id },
    );
  }, []);

  const toggleTwist = useCallback((id: string) => {
    setSelection((curr) =>
      curr?.kind === "twist" && curr.id === id ? null : { kind: "twist", id },
    );
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      draggingRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      const next = Math.max(
        ASIDE_MIN_WIDTH,
        Math.min(ASIDE_MAX_WIDTH, e.clientX),
      );
      setAsideWidth(next);
    },
    [],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      e.currentTarget.releasePointerCapture(e.pointerId);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    },
    [],
  );

  return (
    <div className="dashboard">
      <aside className="dashboard-aside" style={{ width: asideWidth }}>
        {selectedPlayer ? (
          <PlayerDetail
            player={selectedPlayer}
            onClose={() => setSelection(null)}
          />
        ) : selectedTwist ? (
          <TwistDetail
            twist={selectedTwist}
            onClose={() => setSelection(null)}
          />
        ) : (
          <>
            <img
              src={logoUrl}
              alt="Survivor 50 — In the Hands of the Fans"
              className="dashboard-aside-logo"
            />
            <div className="dashboard-aside-recap">
              <span className="dashboard-aside-eyebrow">The Premise</span>
              <p>
                Survivor's 50th season is the first one designed in public. CBS
                handed parts of the game to viewers — who voted on real rules
                and production choices — and to five celebrity superfans, who
                each pitched a signature twist.
              </p>
              <p>
                Twenty-four returning legends spanning every era of the show
                played for a record <strong>$2&nbsp;million</strong> prize.
              </p>
              <p className="dashboard-aside-hint">
                Click any cast member or twist to see details.
              </p>
            </div>
          </>
        )}
        <div
          className="dashboard-aside-handle"
          role="separator"
          aria-orientation="vertical"
          aria-valuenow={asideWidth}
          aria-valuemin={ASIDE_MIN_WIDTH}
          aria-valuemax={ASIDE_MAX_WIDTH}
          aria-label="Resize aside panel"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={() => setAsideWidth(ASIDE_DEFAULT_WIDTH)}
        />
      </aside>

      <div className="dashboard-main">
        <section className="dashboard-section dashboard-section--cast">
          <header className="dashboard-section-head">
            <span className="dashboard-section-eyebrow">Returning players</span>
            <h2 className="dashboard-section-title">Cast</h2>
            <span className="dashboard-section-count">{castData.length}</span>
          </header>
          <div className="dashboard-cast-grid">
            {castData.map((player) => {
              const isSelected =
                selection?.kind === "player" && selection.id === player.id;
              return (
                <button
                  key={player.id}
                  type="button"
                  className={`dashboard-cast-tile ${
                    isSelected ? "is-selected" : ""
                  }`}
                  title={player.name}
                  aria-pressed={isSelected}
                  onClick={() => togglePlayer(player.id)}
                >
                  <div className="dashboard-cast-photo">
                    <img
                      src={player.photo}
                      alt={player.name}
                      loading="lazy"
                      decoding="async"
                      onError={handleImageError}
                    />
                  </div>
                  <span className="dashboard-cast-name">
                    {player.name.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="dashboard-section dashboard-section--votes">
          <header className="dashboard-section-head">
            <span className="dashboard-section-eyebrow">
              In the Hands of the Fans
            </span>
            <h2 className="dashboard-section-title">Audience Votes</h2>
            <span className="dashboard-section-count">{fanVotes.length}</span>
          </header>
          <div className="dashboard-votes-strip">
            {fanVotes.map((vote) => (
              <article key={vote.id} className="dashboard-vote">
                <header className="dashboard-vote-head">
                  <span className="dashboard-vote-subject">{vote.subject}</span>
                  <span className="dashboard-vote-ep">
                    EP {vote.episodeRevealed.toString().padStart(2, "0")}
                  </span>
                </header>
                <ul className="dashboard-vote-options">
                  {vote.options.map((opt, i) => (
                    <li
                      key={i}
                      className={`dashboard-vote-option ${
                        opt.winner ? "is-winner" : ""
                      }`}
                    >
                      <span
                        className="dashboard-vote-marker"
                        aria-hidden
                      >
                        {opt.winner ? "✓" : "·"}
                      </span>
                      <span className="dashboard-vote-label">{opt.label}</span>
                      {opt.percentage !== undefined && (
                        <span className="dashboard-vote-percent">
                          {opt.percentage}%
                        </span>
                      )}
                      {opt.percentage !== undefined && (
                        <span
                          className="dashboard-vote-bar"
                          style={{ width: `${opt.percentage}%` }}
                          aria-hidden
                        />
                      )}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-section dashboard-section--twists">
          <header className="dashboard-section-head">
            <span className="dashboard-section-eyebrow">
              Audience-shaped chaos
            </span>
            <h2 className="dashboard-section-title">Twists</h2>
            <span className="dashboard-section-count">
              {orderedTwists.length}
            </span>
          </header>
          <div className="dashboard-twists-grid">
            {centerTwist && (
              <button
                type="button"
                className={`dashboard-twist dashboard-twist--center ${
                  selection?.kind === "twist" &&
                  selection.id === centerTwist.id
                    ? "is-selected"
                    : ""
                }`}
                onClick={() => toggleTwist(centerTwist.id)}
                aria-pressed={
                  selection?.kind === "twist" &&
                  selection.id === centerTwist.id
                }
                title={centerTwist.title}
              >
                <span className="dashboard-twist-glow" aria-hidden />
                <span className="dashboard-twist-ep-chip dashboard-twist-ep-chip--center">
                  The Premise
                </span>
                <img
                  className="dashboard-twist-img"
                  src={centerTwist.svgImage}
                  alt=""
                  loading="eager"
                  decoding="async"
                />
                <span className="dashboard-twist-label">
                  <span className="dashboard-twist-label-title">
                    {centerTwist.title}
                  </span>
                </span>
              </button>
            )}

            {satelliteTwists.map((twist) => {
              const isSelected =
                selection?.kind === "twist" && selection.id === twist.id;
              return (
                <button
                  key={twist.id}
                  type="button"
                  className={`dashboard-twist dashboard-twist--satellite ${
                    isSelected ? "is-selected" : ""
                  }`}
                  onClick={() => toggleTwist(twist.id)}
                  aria-pressed={isSelected}
                  title={twist.title}
                >
                  <span className="dashboard-twist-glow" aria-hidden />
                  <span className="dashboard-twist-ep-chip">
                    EP {twist.episode.toString().padStart(2, "0")}
                  </span>
                  <img
                    className="dashboard-twist-img"
                    src={twist.svgImage}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="dashboard-twist-label">
                    <span className="dashboard-twist-label-title">
                      {twist.title}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
