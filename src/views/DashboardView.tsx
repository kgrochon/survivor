import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { castData, type CastMember } from "../data/cast";
import {
  twists,
  productionMembers,
  type Twist,
  type ProductionMember,
} from "../data/twists";
import { findEliminationRecord } from "../data/connections";
import { getSeasonSubtitle } from "../data/seasons";
import { TRIBE_COLORS } from "../data/tribes";
import { fanVotes, type FanVote } from "../data/fanVotes";
import { handleImageError } from "../lib/imageFallback";
import { useReveal } from "../lib/useReveal";
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
  /** Jump to a different player's detail (used by Played With). */
  onSelectPlayer: (id: string) => void;
}

function PlayerDetail({ player, onClose, onSelectPlayer }: PlayerDetailProps) {
  const elim = findEliminationRecord(player.id);
  const shared = useMemo(() => findSharedHistory(player), [player]);
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
              <li key={member.id}>
                <button
                  type="button"
                  className="player-detail-played-row"
                  onClick={() => onSelectPlayer(member.id)}
                  title={`${member.name} — shared S${sharedSeasons.join(", S")}`}
                  aria-label={`View ${member.name}'s detail`}
                >
                  <div className="player-detail-played-photo">
                    <img
                      src={member.photo}
                      alt=""
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
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
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

/**
 * Section header that fades + slides its title in (with a torch-yellow
 * underline that draws across) the first time the section scrolls into
 * view. Honors `prefers-reduced-motion` via the underlying hook.
 */
/** Wraps a dashboard section to keep the JSX call sites tidy. */
function DashboardSection({
  id,
  modifier,
  title,
  count,
  children,
}: {
  id: string;
  modifier: string;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`dashboard-section ${modifier}`}>
      <SectionHead title={title} count={count} />
      {children}
    </section>
  );
}

function SectionHead({ title, count }: { title: string; count: number }) {
  const { ref, visible } = useReveal<HTMLElement>();
  return (
    <header
      ref={ref}
      className={`dashboard-section-head ${visible ? "is-revealed" : ""}`}
    >
      <h2 className="dashboard-section-title">{title}</h2>
      <span className="dashboard-section-count">{count}</span>
    </header>
  );
}

const NAV_SECTIONS: ReadonlyArray<{ id: string; label: string }> = [
  { id: "section-cast", label: "Cast" },
  { id: "section-votes", label: "Audience Votes" },
  { id: "section-twists", label: "Twists" },
];

/**
 * In-page navigation for the dashboard's main pane sections. Each link
 * smooth-scrolls to its target so the aside stays put while the main
 * content moves underneath.
 */
function SectionNav() {
  const handleNavigate =
    (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

  return (
    <nav className="dashboard-aside-nav" aria-label="Dashboard sections">
      <span className="dashboard-aside-eyebrow">Sections</span>
      <ul>
        {NAV_SECTIONS.map((s, i) => (
          <li key={s.id}>
            <a href={`#${s.id}`} onClick={handleNavigate(s.id)}>
              <span className="dashboard-aside-nav-num">
                {(i + 1).toString().padStart(2, "0")}
              </span>
              <span className="dashboard-aside-nav-label">{s.label}</span>
              <span className="dashboard-aside-nav-arrow" aria-hidden>
                →
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Fixed bottom tab bar, shown only on mobile (CSS-gated). Thumb-reachable
 * section navigation with a scroll-spy active state — replaces the buried
 * in-aside nav on small screens.
 */
function MobileNav() {
  const [activeId, setActiveId] = useState<string>(NAV_SECTIONS[0].id);

  useEffect(() => {
    const sections = NAV_SECTIONS.map((s) =>
      document.getElementById(s.id),
    ).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    // A thin band across the viewport's vertical middle; whichever section
    // occupies it is "current".
    const observer = new IntersectionObserver(
      (entries) => {
        const inBand = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (inBand[0]) setActiveId(inBand[0].target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleNavigate =
    (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

  return (
    <nav className="dashboard-mobile-nav" aria-label="Sections">
      {NAV_SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={`dashboard-mobile-nav-item ${
            activeId === s.id ? "is-active" : ""
          }`}
          aria-current={activeId === s.id ? "true" : undefined}
          onClick={handleNavigate(s.id)}
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}

/**
 * Audience-vote card with a "guess first" interaction. The options render as
 * neutral buttons until the user picks one; after that, the real results
 * (percentages, winner highlight) are revealed and the card scores the guess.
 */
function VoteCard({ vote }: { vote: FanVote }) {
  const [guessIndex, setGuessIndex] = useState<number | null>(null);
  /**
   * Three-stage flow after a guess:
   *   interactive → revealed (1s of "current UI") → collapsed (losers fade,
   *   leaving the winner slid up to the top).
   */
  const [phase, setPhase] = useState<"interactive" | "revealed" | "collapsed">(
    "interactive",
  );
  const hasGuessed = guessIndex !== null;
  const userPickWasRight =
    hasGuessed && vote.options[guessIndex].winner === true;

  useEffect(() => {
    if (phase !== "revealed") return;
    const id = window.setTimeout(() => setPhase("collapsed"), 1000);
    return () => window.clearTimeout(id);
  }, [phase]);

  const handleGuess = (i: number) => {
    if (hasGuessed) return;
    setGuessIndex(i);
    setPhase("revealed");
  };

  return (
    <article
      className={`dashboard-vote ${hasGuessed ? "is-answered" : ""} ${
        hasGuessed
          ? userPickWasRight
            ? "is-correct"
            : "is-wrong"
          : ""
      } phase-${phase}`}
    >
      <header className="dashboard-vote-head">
        <span className="dashboard-vote-subject">{vote.subject}</span>
      </header>

      {!hasGuessed && (
        <></>
        // <p className="dashboard-vote-prompt">What did the audience pick?</p>
      )}

      <ul className="dashboard-vote-options">
        {vote.options.map((opt, i) => {
          const isUserPick = guessIndex === i;
          const showResult = hasGuessed;
          const isCollapsing = phase === "collapsed" && !opt.winner;
          return (
            <li
              key={i}
              className={`dashboard-vote-option ${
                showResult && opt.winner ? "is-winner" : ""
              } ${isUserPick ? "is-user-pick" : ""} ${
                isCollapsing ? "is-collapsing" : ""
              }`}
            >
              <button
                type="button"
                className="dashboard-vote-option-button"
                onClick={() => handleGuess(i)}
                disabled={hasGuessed}
                aria-pressed={isUserPick}
              >
                <span className="dashboard-vote-marker" aria-hidden>
                  {showResult && opt.winner
                    ? "✓"
                    : isUserPick && !opt.winner
                      ? "✗"
                      : "·"}
                </span>
                <span className="dashboard-vote-label">{opt.label}</span>
                {showResult && opt.percentage !== undefined && (
                  <span className="dashboard-vote-percent">
                    {opt.percentage}%
                  </span>
                )}
                {showResult && opt.percentage !== undefined && (
                  <span
                    className="dashboard-vote-bar"
                    style={{ width: `${opt.percentage}%` }}
                    aria-hidden
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </article>
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
  const [asideOpen, setAsideOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [selection, setSelection] = useState<Selection>(null);
  const draggingRef = useRef(false);

  const toggleAside = useCallback(() => setAsideOpen((v) => !v), []);

  const effectiveAsideWidth = asideOpen ? asideWidth : 0;

  /** Auto-open the aside whenever something gets selected so the new
   *  detail content is visible. Never auto-closes — that stays user-driven. */
  useEffect(() => {
    if (selection !== null) setAsideOpen(true);
  }, [selection]);

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
      setIsDragging(true);
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
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    },
    [],
  );

  return (
    <div
      className={`dashboard ${asideOpen ? "" : "is-aside-collapsed"} ${
        selection !== null ? "is-detail-open" : ""
      }`}
    >
      <aside
        className={`dashboard-aside ${isDragging ? "is-dragging" : ""}`}
        style={{ width: effectiveAsideWidth }}
        aria-hidden={!asideOpen}
        inert={!asideOpen || undefined}
      >
        {selectedPlayer ? (
          <PlayerDetail
            player={selectedPlayer}
            onClose={() => setSelection(null)}
            onSelectPlayer={togglePlayer}
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
            <SectionNav />
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

      {/* Floating toggle. Tracks the right edge of the aside when open,
          parks at left:0 when collapsed. */}
      <button
        type="button"
        className={`dashboard-aside-toggle ${asideOpen ? "is-open" : "is-closed"}`}
        onClick={toggleAside}
        style={{ left: effectiveAsideWidth }}
        aria-label={asideOpen ? "Collapse aside panel" : "Open aside panel"}
        aria-expanded={asideOpen}
      >
        <span aria-hidden>{asideOpen ? "‹" : "›"}</span>
      </button>

      <div className="dashboard-main">
        <DashboardSection
          id="section-cast"
          modifier="dashboard-section--cast"
          title="Cast"
          count={castData.length}
        >
          <div className="dashboard-cast-grid">
            {castData.map((player) => {
              const isSelected =
                selection?.kind === "player" && selection.id === player.id;
              const startingTribe = player.tribeJourney[0].tribe;
              const tribeColor = TRIBE_COLORS[startingTribe];
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
                  style={
                    {
                      "--player-tribe-color": tribeColor,
                    } as React.CSSProperties
                  }
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
        </DashboardSection>

        <DashboardSection
          id="section-votes"
          modifier="dashboard-section--votes"
          title="Audience Votes"
          count={fanVotes.length}
        >
          <div className="dashboard-votes-strip">
            {fanVotes.map((vote) => (
              <VoteCard key={vote.id} vote={vote} />
            ))}
          </div>
        </DashboardSection>

        <DashboardSection
          id="section-twists"
          modifier="dashboard-section--twists"
          title="Twists"
          count={orderedTwists.length}
        >
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
        </DashboardSection>
      </div>

      {/* Mobile-only: tap-away backdrop behind the detail bottom sheet. */}
      {selection !== null && (
        <div
          className="dashboard-sheet-backdrop"
          onClick={() => setSelection(null)}
          aria-hidden
        />
      )}

      <MobileNav />
    </div>
  );
}
