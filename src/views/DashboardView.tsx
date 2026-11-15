import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { castData, type CastMember } from "../data/cast";
import {
  twists,
  productionMembers,
  type Twist,
  type ProductionMember,
  type TwistOutcome,
  type TwistStep,
} from "../data/twists";
import { eliminated } from "../data/connections";
import { fanVotes, type FanVote } from "../data/fanVotes";
import { handleImageError } from "../lib/imageFallback";
import { useReveal } from "../lib/useReveal";
import pushPinIcon from "../img/pushpin.png";
import logoUrl from "../img/survivor-50-logo.png";
import {
  buildPlayerRecords,
  castTileId,
  voteCardId,
  type PlayerRecord,
  type VoteLensEntry,
} from "./playerRecords";
import { SKULL_PATH } from "./glyphs";
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

const EMPTY_LENS: ReadonlyMap<string, VoteLensEntry> = new Map();

type CastSort = "default" | "name" | "tribe" | "seasons" | "rank";

const CAST_SORT_OPTIONS: ReadonlyArray<{ value: CastSort; label: string }> = [
  { value: "default", label: "Featured" },
  { value: "name", label: "Name (A–Z)" },
  { value: "tribe", label: "Tribe" },
  { value: "seasons", label: "Seasons played" },
  { value: "rank", label: "Season rank" },
];

/**
 * Season-50 finish score, higher = better. The `eliminated` array is
 * chronological, so a later index means the player lasted longer; the
 * winner has no record and outranks everyone.
 */
function seasonRankScore(player: CastMember): number {
  const idx = eliminated.findIndex((e) => e.id === player.id);
  return idx === -1 ? eliminated.length : idx;
}

/** Return a new array of cast sorted by the chosen key (never mutates input). */
function sortCast(cast: CastMember[], sort: CastSort): CastMember[] {
  if (sort === "default") return cast;
  const byName = (a: CastMember, b: CastMember) => a.name.localeCompare(b.name);
  const copy = [...cast];
  switch (sort) {
    case "name":
      return copy.sort(byName);
    case "tribe":
      return copy.sort(
        (a, b) =>
          a.tribeJourney[0].tribe.localeCompare(b.tribeJourney[0].tribe) ||
          byName(a, b),
      );
    case "seasons":
      return copy.sort(
        (a, b) => b.seasons.length - a.seasons.length || byName(a, b),
      );
    case "rank":
      return copy.sort(
        (a, b) => seasonRankScore(b) - seasonRankScore(a) || byName(a, b),
      );
  }
}

/* The other half of the pair: you put their name down and they stayed.
   Ring, four ticks and a centre dot — thicker strokes than the drawing
   wants at reading size, because at 12px a hairline ring fills in. */
function CastCrosshair() {
  return (
    <svg
      className="dashboard-cast-crosshair"
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <path
        fillRule="evenodd"
        d="M12 3.4a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 0 0 0-17.2Zm0 3a5.6 5.6 0 1 1 0 11.2 5.6 5.6 0 0 1 0-11.2ZM10.7.6h2.6V5h-2.6V.6ZM10.7 19h2.6v4.4h-2.6V19ZM.6 10.7H5v2.6H.6v-2.6ZM19 10.7h4.4v2.6H19v-2.6ZM12 9.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8Z"
      />
    </svg>
  );
}

/* The shared skull glyph; the chip color shows through its sockets. */
function CastSkull() {
  return (
    <svg
      className="dashboard-cast-skull"
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <path
        fillRule="evenodd"
        d={SKULL_PATH}
      />
    </svg>
  );
}

/** The vote-lens badges, shared by the cast grid and the aside tree.
 *
 *  Voting against someone and ending them are two different facts, so
 *  they get two badges rather than one chip that tries to say both: the
 *  solid skull for "you ended them," the hollow crosshair for "you put
 *  their name down." The aim badge rides beside the skull only when its
 *  count says more than the skull already implies — a bare crosshair next
 *  to a skull would just repeat it, and 104 of the season's 127 vote pairs
 *  are skull pairs, so that repeat would land on most of the grid. */
function CastMark({ entry, name }: { entry: VoteLensEntry; name: string }) {
  const first = name.split(" ")[0];
  const times = `${entry.count} ${entry.count === 1 ? "time" : "times"}`;
  const showAim = !entry.out || entry.count > 1;
  return (
    <span className="dashboard-cast-marks">
      {entry.out && (
        <span
          className="dashboard-cast-mark is-out"
          title={`Voted out ${first}`}
        >
          <CastSkull />
        </span>
      )}
      {showAim && (
        <span
          className="dashboard-cast-mark is-missed"
          title={
            entry.out
              ? `Voted against ${first} ${times} before ending them`
              : `Voted against ${first} ${times}, but someone else sent them home`
          }
        >
          <CastCrosshair />
          {entry.count > 1 && (
            <span className="dashboard-cast-mark-count">
              &times;{entry.count}
            </span>
          )}
        </span>
      )}
    </span>
  );
}

/** What the ring and the marks on a tile mean, in words, from the
 *  selected player's side — the same facts the eye gets from the wash,
 *  the skull and the crosshair. Empty when there is nothing to say. */
function tileDescription(
  player: CastMember,
  selectedFirst: string | null,
  isPlayedWith: boolean,
  entry: VoteLensEntry | undefined,
): string {
  if (!selectedFirst) return "";
  const first = player.name.split(" ")[0];
  const parts: string[] = [];
  if (isPlayedWith) parts.push(`Past castmate of ${selectedFirst}.`);
  if (entry) {
    const times = `${entry.count} ${entry.count === 1 ? "time" : "times"}`;
    parts.push(
      entry.out
        ? entry.count > 1
          ? `${selectedFirst} voted ${first} out, after voting against them ${times}.`
          : `${selectedFirst} voted ${first} out.`
        : `${selectedFirst} voted against ${first} ${times}, but someone else sent them home.`,
    );
  }
  return parts.join(" ");
}

/** Scrolls the main pane to an element; the aside never moves. */
function scrollToElement(id: string, block: ScrollLogicalPosition) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block });
}

/** Every outcome maps onto one of four marks, so the diagram stays
 *  readable without a legend beside it. "Out" borrows the cast grid's
 *  skull, which already means exactly this. */
const OUTCOME_MARK: Record<TwistOutcome, { cls: string; label: string }> = {
  played: { cls: "is-ok", label: "Played it" },
  won: { cls: "is-ok", label: "Won" },
  safe: { cls: "is-ok", label: "Survived it" },
  unused: { cls: "is-none", label: "Never played it" },
  failed: { cls: "is-fail", label: "Failed" },
  out: { cls: "is-out", label: "Eliminated" },
};

function OutcomeGlyph({ outcome }: { outcome: TwistOutcome }) {
  const cls = OUTCOME_MARK[outcome].cls;
  if (cls === "is-out") return <CastSkull />;
  if (cls === "is-fail")
    return (
      <svg viewBox="0 0 24 24" aria-hidden focusable="false">
        <path d="M5.4 3.2 12 9.8l6.6-6.6 2.2 2.2L14.2 12l6.6 6.6-2.2 2.2L12 14.2l-6.6 6.6-2.2-2.2L9.8 12 3.2 5.4Z" />
      </svg>
    );
  if (cls === "is-none")
    // A struck-through ring: it existed, it never got used.
    return (
      <svg viewBox="0 0 24 24" aria-hidden focusable="false">
        <path
          fillRule="evenodd"
          d="M12 2.6a9.4 9.4 0 1 0 0 18.8 9.4 9.4 0 0 0 0-18.8Zm0 2.8a6.6 6.6 0 1 1 0 13.2 6.6 6.6 0 0 1 0-13.2Z"
        />
        <path d="M5.1 17.3 17.3 5.1l1.8 1.8L6.9 19.1Z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M9.6 19.2 2.4 12l2.3-2.3 4.9 4.9L19.3 4.9l2.3 2.3Z" />
    </svg>
  );
}

/** A face with the outcome stamped on its corner, the way a cast tile
 *  carries its vote-lens mark. */
function TwistActor({
  id,
  outcome,
  lookup,
}: {
  id: string;
  outcome?: TwistOutcome;
  lookup: (id: string) => { name: string; photo: string } | null;
}) {
  const person = lookup(id);
  const name = person?.name ?? id;
  const mark = outcome ? OUTCOME_MARK[outcome] : null;
  return (
    <span className="twist-actor">
      <span className="twist-actor-photo">
        {person?.photo ? (
          <img
            src={person.photo}
            alt=""
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <span className="twist-actor-initials" aria-hidden>
            {name
              .split(/\s+/)
              .slice(0, 2)
              .map((w) => w[0])
              .join("")}
          </span>
        )}
        {mark && outcome && (
          <span className={`twist-actor-mark ${mark.cls}`} title={mark.label}>
            <OutcomeGlyph outcome={outcome} />
          </span>
        )}
      </span>
      <span className="twist-actor-name">{name.split(" ")[0]}</span>
    </span>
  );
}

function TwistDiagramView({
  fromLabel,
  toLabel,
  steps,
  lookup,
}: {
  fromLabel?: string;
  toLabel: string;
  steps: readonly TwistStep[];
  lookup: (id: string) => { name: string; photo: string } | null;
}) {
  const hasSource = steps.some((st) => st.from);
  // Nothing passed, nothing marked, nothing noted — the diagram is a cast
  // list, and seven of those stacked one per row would run off the card.
  const isRoster =
    !hasSource && steps.every((st) => !st.outcome && !st.note);
  return (
    <div className="twist-diagram">
      <div className={`twist-diagram-heads ${hasSource ? "has-source" : ""}`}>
        {hasSource && <span>{fromLabel}</span>}
        <span>{toLabel}</span>
      </div>
      <ul className={`twist-diagram-rows ${isRoster ? "is-roster" : ""}`}>
        {steps.map((st, i) => (
          <li
            className="twist-diagram-row"
            key={`${st.from ?? ""}-${st.to}-${i}`}
          >
            {hasSource && (
              <>
                {st.from ? (
                  <TwistActor id={st.from} lookup={lookup} />
                ) : (
                  <span className="twist-actor" aria-hidden />
                )}
                <span className="twist-arrow" aria-hidden />
              </>
            )}
            <TwistActor id={st.to} outcome={st.outcome} lookup={lookup} />
            {/* The mark carries the outcome; this says the one thing the
                mark cannot. Both are optional — a row can be just an
                arrow between two people. */}
            {(st.note || st.outcome) && (
              <span className="twist-diagram-note">
                {st.note ?? (st.outcome ? OUTCOME_MARK[st.outcome].label : "")}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * One twist, as a card that turns over. The front is the illustration at
 * the size it was drawn for; the back carries the whole record, so reading
 * a twist never pushes the rest of the page down the screen.
 */
function TwistCard({
  twist,
  isPremise,
  isFlipped,
  onToggle,
}: {
  twist: Twist;
  isPremise: boolean;
  isFlipped: boolean;
  onToggle: () => void;
}) {
  const flipRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  /* Set by this card's own buttons, so focus follows only a flip the user
     made here — not a card closed from the background or by opening
     another one. */
  const followFocus = useRef(false);

  const toggleFromButton = () => {
    followFocus.current = true;
    onToggle();
  };

  // The face that just left is inert now, so the focus that was on its
  // button is gone with it; hand it to the face that arrived.
  useEffect(() => {
    if (!followFocus.current) return;
    followFocus.current = false;
    (isFlipped ? closeRef : flipRef).current?.focus();
  }, [isFlipped]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && isFlipped) {
      e.stopPropagation();
      toggleFromButton();
    }
  };

  const { involved, lookup } = useMemo(() => {
    const playerMap = new Map<string, CastMember>();
    castData.forEach((pl) => playerMap.set(pl.id, pl));
    const prodMap = new Map<string, ProductionMember>();
    productionMembers.forEach((m) => prodMap.set(m.id, m));
    return {
      involved: resolveInvolved(twist.involvedCast, playerMap, prodMap),
      lookup: (id: string) => {
        const pl = playerMap.get(id);
        if (pl) return { name: pl.name, photo: pl.photo };
        const pr = prodMap.get(id);
        return pr ? { name: pr.name, photo: pr.photo } : null;
      },
    };
  }, [twist]);

  const epLabel = isPremise
    ? "The Premise"
    : `EP ${twist.episode.toString().padStart(2, "0")}`;

  return (
    <div
      className={`twist-card ${isPremise ? "is-premise" : ""} ${
        isFlipped ? "is-flipped" : ""
      }`}
      onKeyDown={handleKeyDown}
    >
      <div className="twist-card-inner">
        {/* Only the face in view is in the accessibility tree — a
            backface-visibility:hidden element is still read aloud. */}
        <div
          className="twist-face twist-front"
          aria-hidden={isFlipped}
          inert={isFlipped || undefined}
        >
          <span className="twist-ep">{epLabel}</span>
          <img
            className="twist-art"
            src={twist.svgImage}
            alt=""
            loading="lazy"
            decoding="async"
          />
          {/* A heading, so the twists are in the outline before any card
              is turned; the back has its own h3 and is inert meanwhile. */}
          <h3 className="twist-title">{twist.title}</h3>
          <button
            type="button"
            className="twist-flip"
            ref={flipRef}
            onClick={toggleFromButton}
            aria-label={`${twist.title} — read the details`}
          >
            <span className="twist-flip-chip" aria-hidden>
              Details
            </span>
          </button>
        </div>

        <div
          className="twist-face twist-back"
          aria-hidden={!isFlipped}
          inert={!isFlipped || undefined}
        >
          <div className="twist-back-head">
            <span className="twist-ep twist-ep--back">{epLabel}</span>
            <button
              type="button"
              className="twist-close"
              ref={closeRef}
              onClick={toggleFromButton}
              aria-label={`Close ${twist.title}`}
            >
              <span aria-hidden>&times;</span>
            </button>
          </div>
          <h3 className="twist-back-title">{twist.title}</h3>
          {/* The body scrolls when a record outruns the card. Focusable so
              the keyboard can scroll it; named so the stop makes sense. */}
          <div
            className="twist-back-body"
            tabIndex={0}
            role="region"
            aria-label={`${twist.title}: details`}
          >
            <p className="twist-back-label">Mechanic</p>
            <p className="twist-back-text">{twist.mechanic}</p>
            {/* The rule stays in words — a diagram cannot state a rule.
                What happened is drawn instead, wherever the events have a
                shape to draw. */}
            {twist.diagram ? (
              <TwistDiagramView
                fromLabel={twist.diagram.fromLabel}
                toLabel={twist.diagram.toLabel}
                steps={twist.diagram.steps}
                lookup={lookup}
              />
            ) : (
              <>
                <p className="twist-back-label">How it played out</p>
                <p className="twist-back-text">{twist.howItPlayedOut}</p>
                {involved.length > 0 && (
                  <>
                    <p className="twist-back-label">Involved</p>
                    <ul className="twist-back-cast">
                      {involved.map((a) => (
                        <li key={a.id} className="twist-back-cast-item">
                          <span className="twist-back-cast-photo">
                            {a.photo ? (
                              <img
                                src={a.photo}
                                alt=""
                                loading="lazy"
                                onError={handleImageError}
                              />
                            ) : (
                              <span className="twist-back-cast-initials">
                                {a.name
                                  .split(/\s+/)
                                  .slice(0, 2)
                                  .map((w) => w[0])
                                  .join("")}
                              </span>
                            )}
                          </span>
                          <span className="twist-back-cast-name">
                            {a.name.split(" ")[0]}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
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
  const titleId = `${id}-title`;
  return (
    <section
      id={id}
      className={`dashboard-section ${modifier}`}
      // Named by its own heading, so it is a region a reader can jump to.
      aria-labelledby={titleId}
    >
      <SectionHead title={title} titleId={titleId} count={count} />
      {children}
    </section>
  );
}

function SectionHead({
  title,
  titleId,
  count,
}: {
  title: string;
  titleId: string;
  count: number;
}) {
  const { ref, visible } = useReveal<HTMLElement>();
  return (
    <header
      ref={ref}
      className={`dashboard-section-head ${visible ? "is-revealed" : ""}`}
    >
      <h2 id={titleId} className="dashboard-section-title">
        {title}
      </h2>
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
 * Scroll-spy over NAV_SECTIONS, driving the masthead's current-section
 * state.
 */
function useActiveSection(): [string, (id: string) => void] {
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
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (inBand[0]) setActiveId(inBand[0].target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return [activeId, setActiveId];
}

/**
 * Sticky masthead. The aside used to carry the identity and a full tree of
 * every player, vote and twist; the sections already hold all of that, so
 * what is left is the logo and a way to reach each section. Same scroll-spy
 * the tree used, at every width — there is no second nav to disagree with.
 */
function DashboardHeader({ activeId }: { activeId: string }) {
  const go = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToElement(id, "start");
  };

  return (
    <header className="dashboard-header">
      <a
        className="dashboard-header-brand"
        href={`#${NAV_SECTIONS[0].id}`}
        onClick={go(NAV_SECTIONS[0].id)}
      >
        <img
          src={logoUrl}
          alt="Survivor 50 — In the Hands of the Fans"
          className="dashboard-header-logo"
        />
      </a>
      <nav className="dashboard-header-nav" aria-label="Sections">
        {NAV_SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`dashboard-header-link ${
              activeId === s.id ? "is-active" : ""
            }`}
            aria-current={activeId === s.id ? "true" : undefined}
            onClick={go(s.id)}
          >
            {s.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

/**
 * Audience-vote card with a "guess first" interaction. The options render as
 * neutral buttons until the user picks one; after that, the real results
 * (percentages, winner highlight) are revealed and the card scores the guess.
 */
function VoteCard({
  vote,
  forceRevealed,
}: {
  vote: FanVote;
  /** "Reveal all": show the result without a pick. Reset remounts the
   *  card (by key) rather than unwinding it, so nothing here listens for
   *  a reset. */
  forceRevealed: boolean;
}) {
  const [guessIndex, setGuessIndex] = useState<number | null>(null);
  /** The 1s "current UI" beat after reveal has passed: losers fold away. */
  const [collapsed, setCollapsed] = useState(false);
  const hasGuessed = guessIndex !== null;
  const userPickWasRight =
    hasGuessed && vote.options[guessIndex].winner === true;

  /** Results are shown once the user guesses OR "Reveal all" fires. */
  const revealed = hasGuessed || forceRevealed;
  /**
   * Three-stage flow, derived rather than stored so a prop change needs no
   * effect to catch it:
   *   interactive → revealed (1s of "current UI") → collapsed (losers fade,
   *   leaving the winner slid up to the top).
   */
  const phase: "interactive" | "revealed" | "collapsed" = !revealed
    ? "interactive"
    : collapsed
      ? "collapsed"
      : "revealed";

  const articleRef = useRef<HTMLElement>(null);
  const winnerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (phase !== "revealed") return;
    const id = window.setTimeout(() => {
      // The losing rows are about to go inert. If the user's focus is on
      // one of them (a wrong guess, made by keyboard), hand it to the
      // winner before the row vanishes under it.
      if (articleRef.current?.contains(document.activeElement)) {
        winnerRef.current?.focus();
      }
      setCollapsed(true);
    }, 1000);
    return () => window.clearTimeout(id);
  }, [phase]);

  const handleGuess = (i: number) => {
    if (revealed) return;
    setGuessIndex(i);
  };

  /* What a screen reader hears once the result is in. Only a guess made on
     this card speaks here; "Reveal all" announces once, from its button,
     rather than eleven times from eleven cards. */
  const winner = vote.options.find((o) => o.winner);
  const winnerText = winner
    ? `${winner.label}${
        winner.percentage !== undefined ? ` with ${winner.percentage}%` : ""
      }`
    : "";
  const announcement =
    revealed && hasGuessed && winner
      ? `${userPickWasRight ? "Correct" : "Not quite"}. The audience picked ${winnerText}.`
      : "";

  return (
    <div
      id={voteCardId(vote.id)}
      className="dashboard-vote-card"
      style={{ position: "relative" }}
    >
      <img className="push-pin" src={pushPinIcon} alt="" />
      <article
        ref={articleRef}
        className={`dashboard-vote ${revealed ? "is-answered" : ""} ${
          hasGuessed ? (userPickWasRight ? "is-correct" : "is-wrong") : ""
        } phase-${phase}`}
      >
        <header className="dashboard-vote-head">
          <span className="dashboard-vote-subject">{vote.subject}</span>
        </header>
        {/* Always mounted, so the region exists before it gets text. */}
        <p className="visually-hidden" aria-live="polite">
          {announcement}
        </p>

        <ul className="dashboard-vote-options">
          {vote.options.map((opt, i) => {
            const isUserPick = guessIndex === i;
            const showResult = revealed;
            const isCollapsing = phase === "collapsed" && !opt.winner;
            return (
              <li
                key={i}
                className={`dashboard-vote-option ${
                  showResult && opt.winner ? "is-winner" : ""
                } ${isUserPick ? "is-user-pick" : ""} ${
                  isCollapsing ? "is-collapsing" : ""
                }`}
                /* A collapsed row is 0px tall — out of the tree too. */
                inert={isCollapsing || undefined}
              >
                {/* aria-disabled, not disabled: a disabled button drops
                    focus to <body>, and handleGuess already ignores
                    clicks once the result is showing. */}
                <button
                  type="button"
                  ref={opt.winner ? winnerRef : undefined}
                  className="dashboard-vote-option-button"
                  onClick={() => handleGuess(i)}
                  aria-disabled={revealed || undefined}
                  aria-pressed={isUserPick}
                >
                  <span className="dashboard-vote-marker" aria-hidden>
                    {showResult && opt.winner
                      ? "✓"
                      : isUserPick && !opt.winner
                        ? "✗"
                        : "·"}
                  </span>
                  {/* The glyph and the green/red flood say it to the eye;
                      this says it to the reader. */}
                  {showResult && opt.winner && (
                    <span className="visually-hidden">Audience pick: </span>
                  )}
                  {showResult && isUserPick && !opt.winner && (
                    <span className="visually-hidden">Your guess: </span>
                  )}
                  <span className="dashboard-vote-label">{opt.label}</span>
                  {showResult && opt.percentage !== undefined && (
                    <span className="dashboard-vote-percent">
                      {opt.percentage}%
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </article>
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
  /** The premise leads, then the season in episode order. */
  const allTwists = useMemo(
    () => (centerTwist ? [centerTwist, ...satelliteTwists] : satelliteTwists),
    [centerTwist, satelliteTwists],
  );

  const [selection, setSelection] = useState<Selection>(null);
  const [votesRevealed, setVotesRevealed] = useState(false);
  /** Bumped on Reset: the strip remounts and every card starts over. */
  const [votesEpoch, setVotesEpoch] = useState(0);
  const [voteControlsNote, setVoteControlsNote] = useState("");
  const [castSort, setCastSort] = useState<CastSort>("default");

  const sortedCast = useMemo(() => sortCast(castData, castSort), [castSort]);

  /** Every player's castmates and voting record — the season's data,
   *  computed once; the grid's vote-lens reads it. */
  const records = useMemo(() => buildPlayerRecords(), []);

  // Played-with ring keys off selection only — hovering shouldn't
  // ripple through the grid.
  const activePlayerId = selection?.kind === "player" ? selection.id : null;
  const activeRecord: PlayerRecord | null = activePlayerId
    ? (records.get(activePlayerId) ?? null)
    : null;
  const playedWithIds = activeRecord?.castmates ?? null;
  const voteLens: ReadonlyMap<string, VoteLensEntry> =
    activeRecord?.votes ?? EMPTY_LENS;
  const activeFirstName = activePlayerId
    ? (castData.find((p) => p.id === activePlayerId)?.name.split(" ")[0] ??
      null)
    : null;

  const [activeSectionId] = useActiveSection();

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

  /**
   * Clicks that don't land on an interactive control (tile, sort select, vote
   * option, etc.) are treated as "click the background" and deselect the
   * currently-open detail. Tile clicks handle their own toggle via togglePlayer,
   * so their onClick fires and stops before this bubble-phase handler runs.
   */
  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const target = e.target as HTMLElement;
      if (
        target.closest(
          'button, a, input, select, textarea, label, [role="button"]',
        )
      ) {
        return;
      }
      setSelection(null);
    },
    [],
  );

  return (
    <div className="dashboard">
      <DashboardHeader activeId={activeSectionId} />

      <main className="dashboard-main" onClick={handleBackgroundClick}>
        {/* The page's one h1. The logo in the header says this to the eye;
            the heading says it to the outline. */}
        <h1 className="visually-hidden">
          Survivor 50: In the Hands of the Fans
        </h1>
        <DashboardSection
          id="section-cast"
          modifier="dashboard-section--cast"
          title="Cast"
          count={castData.length}
        >
          <div className="dashboard-cast-controls">
            <ul className="dashboard-cast-legend">
              <li className="is-played">Past Castmate</li>
              <li>
                <span className="dashboard-cast-mark is-out" aria-hidden>
                  <CastSkull />
                </span>
                Voted Out
              </li>
              <li>
                <span className="dashboard-cast-mark is-missed" aria-hidden>
                  <CastCrosshair />
                </span>
                Voted Against
              </li>
            </ul>
            <label className="dashboard-cast-sort">
              <span className="dashboard-cast-sort-label">Order by</span>
              <select
                className="dashboard-cast-sort-select"
                value={castSort}
                onChange={(e) => setCastSort(e.target.value as CastSort)}
              >
                {CAST_SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="dashboard-cast-grid">
            {sortedCast.map((player, tileIndex) => {
              const isSelected =
                selection?.kind === "player" && selection.id === player.id;
              const isPlayedWith = playedWithIds?.has(player.id) ?? false;
              // Vote-lens: when a player is selected, project THEIR voting
              // record onto every other tile.
              const lensEntry = voteLens.get(player.id);
              const description = isSelected
                ? ""
                : tileDescription(
                    player,
                    activeFirstName,
                    isPlayedWith,
                    lensEntry,
                  );
              const descId = `${castTileId(player.id)}-desc`;
              return (
                <button
                  key={player.id}
                  id={castTileId(player.id)}
                  type="button"
                  className={`dashboard-cast-tile ${
                    isSelected ? "is-selected" : ""
                  } ${isPlayedWith ? "is-played-with" : ""}`}
                  title={player.name}
                  /* The full name, once: the photo is decorative and the
                     visible label is only the first name. */
                  aria-label={player.name}
                  aria-pressed={isSelected}
                  aria-describedby={description ? descId : undefined}
                  onClick={() => togglePlayer(player.id)}
                  style={
                    {
                      // Staggers the marker stroke across the grid.
                      "--tile-i": tileIndex,
                    } as React.CSSProperties
                  }
                >
                  <div className="dashboard-cast-photo">
                    <img
                      src={player.photo}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={handleImageError}
                    />
                  </div>
                  {lensEntry && (
                    <CastMark
                      // Remounts on every change of selection, so the
                      // punch-in replays instead of React reusing a node
                      // that has already finished animating.
                      key={`${activePlayerId}-${lensEntry.out}`}
                      entry={lensEntry}
                      name={player.name}
                    />
                  )}
                  <span className="dashboard-cast-name">
                    {player.name.split(" ")[0]}
                  </span>
                  {description && (
                    <span id={descId} className="visually-hidden">
                      {description}
                    </span>
                  )}
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
          <div className="dashboard-votes-controls">
            <button
              type="button"
              className="dashboard-votes-control"
              onClick={() => {
                setVotesRevealed(true);
                setVoteControlsNote(
                  `All ${fanVotes.length} audience results revealed.`,
                );
              }}
            >
              Reveal all
            </button>
            <button
              type="button"
              className="dashboard-votes-control"
              onClick={() => {
                setVotesRevealed(false);
                setVotesEpoch((n) => n + 1);
                setVoteControlsNote("Audience results hidden.");
              }}
            >
              Reset
            </button>
            <p className="visually-hidden" aria-live="polite">
              {voteControlsNote}
            </p>
          </div>
          <div className="dashboard-votes-strip" key={votesEpoch}>
            {fanVotes.map((vote) => (
              <VoteCard
                key={vote.id}
                vote={vote}
                forceRevealed={votesRevealed}
              />
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
            {allTwists.map((twist) => (
              <TwistCard
                key={twist.id}
                twist={twist}
                isPremise={twist.id === CENTER_TWIST_ID}
                isFlipped={
                  selection?.kind === "twist" && selection.id === twist.id
                }
                onToggle={() => toggleTwist(twist.id)}
              />
            ))}
          </div>
        </DashboardSection>
      </main>
    </div>
  );
}
