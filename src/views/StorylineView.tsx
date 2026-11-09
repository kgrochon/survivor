// WIP: parked, not on the dashboard. See docs/journey-wip.md for status and
// how to put it back.
import { useEffect, useRef, useState } from "react";
import {
  buildStoryline,
  finalVotes,
  stopY,
  PHASES,
  START_TRIBES,
  type PlacedGroup,
  type StoryColumn,
  type StoryStop,
  type StoryThread,
  type Storyline,
  type VoteState,
} from "../data/storyline";
import { TRIBE_COLORS } from "../data/tribes";
import { SKULL_PATH } from "./glyphs";
import "./styles/storyline.css";

// Geometry, in SVG px. One column per tribal; the gutter holds the cast's
// faces and names on day 1.
const GUTTER = 132;
const COL_W = 54;
const LANE = 18;
const GROUP_GAP = 26;
const TOP = 96;
/** Room past FTC for the finalists' names and jury votes. */
const RIGHT = 150;
/** Extra room where the game changes shape (swap, merge…): the threads
 *  cross there, and need the run-up. */
const PHASE_GAP = 34;
/** The chart shrinks to fit its box, down to this; past it, it scrolls. */
const MIN_SCALE = 0.85;
/** How far a band runs past its first/last column. */
const CAP = 15;
const NODE_R = 4.5;

// The storyline is fixed data, so it is laid out once, up front.
const STORY = buildStoryline({ lane: LANE, groupGap: GROUP_GAP, top: TOP });

const COL_X: number[] = [];
STORY.columns.forEach((c, i) => {
  const prev = STORY.columns[i - 1];
  COL_X.push(
    !prev
      ? GUTTER
      : COL_X[i - 1] + COL_W + (prev.phase !== c.phase ? PHASE_GAP : 0),
  );
});

const x = (column: number) => COL_X[column];

const WIDTH = x(STORY.columns.length - 1) + RIGHT;
const HEIGHT = STORY.height + 8;

/** Finalist → jury votes, for their FTC labels. */
const JURY_VOTES = new Map(
  finalVotes(STORY.columns, STORY.threads).map(([t, n]) => [t.id, n]),
);

const FIRST_NAMES = new Map(STORY.threads.map((t) => [t.id, t.firstName]));
const name = (id: string) => FIRST_NAMES.get(id) ?? id;

/** The column whose centre is within half a column of `px`. */
function columnAt(px: number): number | null {
  let best: number | null = null;
  COL_X.forEach((cx, i) => {
    if (Math.abs(px - cx) < COL_W / 2) best = i;
  });
  return best;
}

/** The three marks a vote can make. An idol-cancelled vote draws as a
 *  plain "someone else" — the tooltip tells that story. */
type VoteMark = "boot" | "miss" | "none";

const markOf = (state: VoteState): VoteMark =>
  state === "nullified" ? "miss" : state;

const VOTE_LABEL: Record<VoteMark, string> = {
  boot: "Voted for who went home",
  miss: "Voted for someone else",
  none: "No vote",
};

interface StorylineViewProps {
  /** The dashboard's selected player; their thread stays lit. */
  selectedId: string | null;
  onSelect: (id: string) => void;
}

type Hover =
  | { kind: "stop"; thread: StoryThread; stop: StoryStop }
  | { kind: "column"; column: StoryColumn }
  | null;

/**
 * The season as a storyline: one thread per castaway, bundled into the
 * band of whatever group they were in, left to right through every
 * tribal. Thread color is the starting tribe; band tint is the tribe at
 * the time — so the swap shows up as threads crossing into new colors.
 */
export default function StorylineView({
  selectedId,
  onSelect,
}: StorylineViewProps) {
  const story = STORY;

  const [hoverId, setHoverId] = useState<string | null>(null);
  const [hover, setHover] = useState<Hover>(null);
  const [pointer, setPointer] = useState<TipAnchor | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapRef.current!;
    const fit = new ResizeObserver(() =>
      setScale(Math.min(1, Math.max(MIN_SCALE, el.clientWidth / WIDTH))),
    );
    fit.observe(el);
    return () => fit.disconnect();
  }, []);

  const focusId = hoverId ?? selectedId;
  // The tribal under the pointer — also while the pointer is on one of its
  // nodes, so the column's votes don't blink out as you reach for them.
  const hoverColumn =
    hover?.kind === "column"
      ? hover.column
      : hover?.kind === "stop"
        ? story.columns[hover.stop.column]
        : null;
  const finalHovered = hoverColumn?.kind === "final";
  // At rest the chart is movement only; votes come up on demand.
  const showVotesAt = (threadId: string, column: number) =>
    focusId === threadId || hoverColumn?.index === column;
  const votesShowing = focusId !== null || hoverColumn !== null;

  // Which column the pointer is in, from x alone: threads and nodes sit
  // on top of the column, so per-column hit rects would flicker.
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const wrapEl = wrapRef.current!;
    const wrap = wrapEl.getBoundingClientRect();
    const px = e.clientX - wrap.left;
    setPointer({
      left: wrapEl.scrollLeft + px,
      top: e.clientY - wrap.top,
      flip: px > wrapEl.clientWidth - 260,
    });
    // A node's own enter handler owns the tooltip while it's under the pointer.
    if ((e.target as Element).closest(".storyline-stop")) return;
    const c = columnAt((e.clientX - box.left) / scale);
    const col = c === null ? null : story.columns[c];
    setHover(
      col && col.kind !== "start" ? { kind: "column", column: col } : null,
    );
  };

  return (
    <div className="storyline">
      <p className="storyline-takeaway">{story.takeaway}</p>
      <Legend votesShowing={votesShowing} />
      <div
        className="storyline-scroll"
        ref={wrapRef}
        onPointerLeave={() => {
          setHover(null);
          setHoverId(null);
          setPointer(null);
        }}
      >
        <svg
          className={`storyline-svg ${focusId ? "has-focus" : ""}`}
          width={WIDTH * scale}
          height={HEIGHT * scale}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Season 50 storyline: each castaway's tribe, votes and exit, tribal by tribal. A table version follows."
          onPointerMove={handlePointerMove}
        >
          <defs>
            <pattern
              id="storyline-hatch"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="6" height="6" className="storyline-hatch-bg" />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="6"
                className="storyline-hatch-line"
              />
            </pattern>
            <marker
              id="storyline-arrow"
              viewBox="0 0 6 6"
              refX="5"
              refY="3"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0 0L6 3L0 6Z" className="storyline-arrowhead" />
            </marker>
            {story.threads.map((t) => (
              <clipPath key={t.id} id={`storyline-face-${t.id}`}>
                <circle cx={GUTTER - 20} cy={stopY(story, t.id, 0)} r={9} />
              </clipPath>
            ))}
          </defs>

          <Header story={story} hoverColumn={hoverColumn} />
          <Bands story={story} layer="fill" />
          <TribalPills story={story} hoverColumn={hoverColumn} />

          {story.threads.map((t) => (
            <Thread
              key={t.id}
              story={story}
              thread={t}
              focused={focusId === t.id}
              dimmed={focusId !== null && focusId !== t.id}
              showJury={focusId === t.id || finalHovered}
              onEnter={() => setHoverId(t.id)}
              onLeave={() => setHoverId(null)}
              onSelect={() => onSelect(t.id)}
            />
          ))}

          <Bands story={story} layer="label" />

          <VoteArcs
            story={story}
            column={hoverColumn}
            focusId={hoverColumn ? null : focusId}
          />

          {story.threads.map((t) => (
            <Stops
              key={t.id}
              story={story}
              thread={t}
              dimmed={focusId !== null && focusId !== t.id}
              showVotesAt={(column) => showVotesAt(t.id, column)}
              onEnter={(stop) => {
                setHoverId(t.id);
                setHover({ kind: "stop", thread: t, stop });
              }}
              onLeave={() => {
                setHoverId(null);
                setHover(null);
              }}
              onSelect={() => onSelect(t.id)}
            />
          ))}
        </svg>

        {hover && pointer && (
          <Tooltip anchor={pointer}>
            {hover.kind === "stop" ? (
              <StopTip
                story={story}
                thread={hover.thread}
                stop={hover.stop}
                name={name}
              />
            ) : (
              <ColumnTip story={story} column={hover.column} name={name} />
            )}
          </Tooltip>
        )}
      </div>
      <StorylineTable story={story} name={name} />
    </div>
  );
}

// ----- chart layers ----------------------------------------------------------

function Header({
  story,
  hoverColumn,
}: {
  story: Storyline;
  hoverColumn: StoryColumn | null;
}) {
  const cols = story.columns;
  return (
    <g className="storyline-header">
      {PHASES.map((phase, i) => {
        const inPhase = cols.filter(
          (c) => c.phase === phase.id && c.kind !== "start",
        );
        if (inPhase.length === 0) return null;
        const x0 = x(inPhase[0].index) - COL_W / 2 + 4;
        const x1 = x(inPhase[inPhase.length - 1].index) + COL_W / 2 - 4;
        return (
          <g key={phase.id}>
            <line
              x1={x0}
              x2={x1}
              y1={22}
              y2={22}
              className="storyline-phase-rule"
            />
            <text x={x0} y={15} className="storyline-phase-label">
              {phase.label}
            </text>
            {i > 0 && (
              <line
                x1={x(inPhase[0].index) - (COL_W + PHASE_GAP) / 2}
                x2={x(inPhase[0].index) - (COL_W + PHASE_GAP) / 2}
                y1={22}
                y2={story.height}
                className="storyline-phase-divider"
              />
            )}
          </g>
        );
      })}
      {cols.map((c) => (
        <g
          key={c.index}
          className={`storyline-col-head ${hoverColumn?.index === c.index ? "is-hover" : ""}`}
        >
          <text x={x(c.index)} y={42} className="storyline-col-label">
            {c.kind === "start" ? "" : c.label}
          </text>
          <text x={x(c.index)} y={55} className="storyline-col-sublabel">
            {c.sublabel}
          </text>
        </g>
      ))}
    </g>
  );
}

/** Group bands: one ribbon per group instance across its run of columns.
 *  Drawn twice — fills under the threads, labels over them — so a thread
 *  crossing a band's corner can't cover its name. */
function Bands({
  story,
  layer,
}: {
  story: Storyline;
  layer: "fill" | "label";
}) {
  const runs = new Map<string, PlacedGroup[]>();
  for (const col of story.groups) {
    for (const g of col)
      (runs.get(g.key) ?? runs.set(g.key, []).get(g.key)!).push(g);
  }
  const pad = LANE / 2 + 3;
  return (
    <g className={`storyline-bands is-${layer}`}>
      {/* The jury needs no band: its dotted lines only show on demand. */}
      {[...runs.values()]
        .filter((run) => run[0].kind !== "jury")
        .map((run) => {
          const first = run[0];
          const last = run[run.length - 1];
          const top = run.map((g) => [x(g.column), g.y0 - pad] as const);
          const bot = run
            .map((g) => [x(g.column), g.y1 + pad] as const)
            .reverse();
          const capL = first.column === 0 ? 6 : CAP;
          if (layer === "label") {
            return (
              <text
                key={first.key}
                x={x(first.column) - capL + 2}
                y={first.y0 - pad - 4}
                className="storyline-band-label"
              >
                {first.label}
              </text>
            );
          }
          const d = [
            `M${top[0][0] - capL},${top[0][1]}`,
            `L${top[0][0]},${top[0][1]}`,
            ...curveThrough(top),
            `L${x(last.column) + CAP},${top[top.length - 1][1]}`,
            `L${x(last.column) + CAP},${bot[0][1]}`,
            `L${bot[0][0]},${bot[0][1]}`,
            ...curveThrough(bot),
            `L${bot[bot.length - 1][0] - capL},${bot[bot.length - 1][1]}`,
            "Z",
          ].join(" ");
          return (
            <g key={first.key} className={`storyline-band is-${first.kind}`}>
              {/* Only a real tribe gets a tint; merge-era groups stay
                  neutral, so none of them can pass for Kalo. */}
              <path
                d={d}
                style={
                  first.kind === "tribe" ? { fill: first.color } : undefined
                }
              />
            </g>
          );
        })}
    </g>
  );
}

/** On the hovered tribal, a pill around the players who were there. */
function TribalPills({
  story,
  hoverColumn,
}: {
  story: Storyline;
  hoverColumn: StoryColumn | null;
}) {
  if (!hoverColumn) return null;
  const groups = story.groups[hoverColumn.index].filter((g) =>
    hoverColumn.attending.includes(g.key),
  );
  if (groups.length === 0) return null;
  const y0 = Math.min(...groups.map((g) => g.y0)) - LANE / 2;
  const y1 = Math.max(...groups.map((g) => g.y1)) + LANE / 2;
  return (
    <rect
      x={x(hoverColumn.index) - 11}
      y={y0}
      width={22}
      height={y1 - y0}
      rx={11}
      className="storyline-pill"
    />
  );
}

function Thread({
  story,
  thread,
  focused,
  dimmed,
  showJury,
  onEnter,
  onLeave,
  onSelect,
}: {
  story: Storyline;
  thread: StoryThread;
  focused: boolean;
  dimmed: boolean;
  /** A juror's dotted line to the finalist they backed — on demand only. */
  showJury: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onSelect: () => void;
}) {
  const pts = (stops: StoryStop[]) =>
    stops.map(
      (s) => [x(s.column), stopY(story, thread.id, s.column)!] as const,
    );
  const exitAt = thread.stops.findIndex((s) => s.exit);
  const inPlay = thread.stops.slice(0, exitAt + 1);
  const jury = thread.stops.slice(exitAt);

  const start = pts(inPlay);
  const live = [
    `M${GUTTER - 8},${start[0][1]}`,
    `L${start[0][0]},${start[0][1]}`,
    ...curveThrough(start),
  ].join(" ");
  const juryPath =
    showJury && jury.length > 1
      ? ["M" + pts(jury)[0].join(","), ...curveThrough(pts(jury))].join(" ")
      : null;

  return (
    <g
      className={`storyline-thread ${focused ? "is-focused" : ""} ${dimmed ? "is-dimmed" : ""}`}
      style={{ "--thread": thread.color } as React.CSSProperties}
      role="button"
      aria-label={`${thread.name}: highlight in the cast`}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onClick={onSelect}
    >
      {juryPath && <path d={juryPath} className="storyline-thread-jury" />}
      <path d={live} className="storyline-thread-casing" />
      <path d={live} className="storyline-thread-line" />
      <path d={live} className="storyline-thread-hit" />
      {juryPath && <path d={juryPath} className="storyline-thread-hit" />}

      <g
        className="storyline-face"
        role="button"
        tabIndex={0}
        aria-label={`${thread.name}, started on ${thread.startTribe}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        onFocus={onEnter}
        onBlur={onLeave}
      >
        <text
          x={GUTTER - 34}
          y={start[0][1] + 3.5}
          className="storyline-face-name"
        >
          {thread.firstName}
        </text>
        <circle
          cx={GUTTER - 20}
          cy={start[0][1]}
          r={10}
          className="storyline-face-ring"
        />
        <image
          href={thread.photo}
          x={GUTTER - 29}
          y={start[0][1] - 9}
          width={18}
          height={18}
          preserveAspectRatio="xMidYMin slice"
          clipPath={`url(#storyline-face-${thread.id})`}
        />
      </g>
    </g>
  );
}

function Stops({
  story,
  thread,
  dimmed,
  showVotesAt,
  onEnter,
  onLeave,
  onSelect,
}: {
  story: Storyline;
  thread: StoryThread;
  dimmed: boolean;
  /** Vote nodes are hidden until their column or player is in focus. */
  showVotesAt: (column: number) => boolean;
  onEnter: (stop: StoryStop) => void;
  onLeave: () => void;
  onSelect: () => void;
}) {
  const last = story.columns.length - 1;
  return (
    <g className={`storyline-stops ${dimmed ? "is-dimmed" : ""}`}>
      {thread.stops.map((s) => {
        if (!s.exit && !(s.vote && showVotesAt(s.column))) return null;
        const cx = x(s.column);
        const cy = stopY(story, thread.id, s.column)!;
        const finale = s.column === last;
        return (
          <g
            key={s.column}
            className="storyline-stop"
            role="button"
            aria-label={`${thread.firstName}, ${story.columns[s.column].label}`}
            onPointerEnter={() => onEnter(s)}
            onPointerLeave={onLeave}
            onClick={onSelect}
          >
            {s.exit ? (
              <ExitGlyph kind={s.exit} cx={cx} cy={cy} />
            ) : (
              <VoteNode mark={markOf(s.vote!.state)} cx={cx} cy={cy} />
            )}
            {s.exit && (
              <text
                x={cx + 12}
                y={cy + 3.5}
                className={`storyline-exit-label ${finale ? "is-final" : ""}`}
              >
                {thread.firstName}
                {finale ? finaleSuffix(thread.id, s.exit) : EXIT_SUFFIX[s.exit]}
              </text>
            )}
            <circle cx={cx} cy={cy} r={9} className="storyline-hit" />
          </g>
        );
      })}
    </g>
  );
}

/** Glyphs other than the skull name themselves, so the legend needn't. */
const EXIT_SUFFIX: Record<NonNullable<StoryStop["exit"]>, string> = {
  voted: "",
  injury: " · medevac",
  fire: " · lost fire",
  finalist: "",
  winner: " · Sole Survivor",
};

/** At FTC every finalist's label carries their jury votes. */
function finaleSuffix(
  id: string,
  kind: NonNullable<StoryStop["exit"]>,
): string {
  const n = JURY_VOTES.get(id) ?? 0;
  const votes = `${n} vote${n === 1 ? "" : "s"}`;
  return kind === "winner" ? ` wins · ${votes}` : ` · ${votes}`;
}

/** Hover a column for its votes; focus a player for theirs. */
function VoteArcs({
  story,
  column,
  focusId,
}: {
  story: Storyline;
  column: StoryColumn | null;
  focusId: string | null;
}) {
  const cols = column ? [column] : focusId ? story.columns : [];
  const arcs: React.ReactNode[] = [];
  for (const col of cols) {
    if (col.kind !== "council" || !col.council) continue;
    col.council.votes.forEach((v, i) => {
      if (!v.target) return;
      if (!column && v.voter !== focusId && v.target !== focusId) return;
      const y1 = stopY(story, v.voter, col.index);
      const y2 = stopY(story, v.target, col.index);
      if (y1 === undefined || y2 === undefined) return;
      const cx = x(col.index);
      const d =
        v.voter === v.target
          ? `M${cx + 5},${y1 - 2} C${cx + 22},${y1 - 14} ${cx + 22},${y1 + 14} ${cx + 6},${y1 + 3}`
          : (() => {
              const k = Math.min(14 + Math.abs(y2 - y1) * 0.3, COL_W * 0.9);
              // Repeat ballots (extra/stolen votes) fan out a little.
              const fan = v.ballot && /extra|stolen/.test(v.ballot) ? 6 : 0;
              return `M${cx + 5},${y1} C${cx + k + fan},${y1} ${cx + k + fan},${y2} ${cx + NODE_R + 2},${y2}`;
            })();
      arcs.push(
        <path
          key={`${col.index}-${i}`}
          d={d}
          className={`storyline-arc ${v.nullified ? "is-nullified" : ""}`}
          markerEnd="url(#storyline-arrow)"
        />,
      );
    });
  }
  return <g className="storyline-arcs">{arcs}</g>;
}

// ----- glyphs ----------------------------------------------------------------

function VoteNode({
  mark,
  cx,
  cy,
}: {
  mark: VoteMark;
  cx: number;
  cy: number;
}) {
  return (
    <g className={`storyline-node is-${mark}`}>
      <circle cx={cx} cy={cy} r={NODE_R} />
      {mark === "none" && (
        <line x1={cx - 3.2} y1={cy + 3.2} x2={cx + 3.2} y2={cy - 3.2} />
      )}
    </g>
  );
}

function ExitGlyph({
  kind,
  cx,
  cy,
}: {
  kind: NonNullable<StoryStop["exit"]>;
  cx: number;
  cy: number;
}) {
  return (
    <g className={`storyline-exit is-${kind}`}>
      <circle cx={cx} cy={cy} r={kind === "winner" ? 10 : 8} />
      {kind === "voted" && (
        <path
          d={SKULL_PATH}
          fillRule="evenodd"
          transform={`translate(${cx - 6.5} ${cy - 6.5}) scale(${13 / 24})`}
        />
      )}
      {kind === "injury" && (
        <path
          d={`M${cx - 1.6} ${cy - 5}h3.2v3.4h3.4v3.2h-3.4V${cy + 5}h-3.2v-3.4h-3.4v-3.2h3.4Z`}
        />
      )}
      {kind === "fire" && (
        <path
          d={`M${cx} ${cy - 5.5}c1.2 2.2 3.6 3.4 3.6 6.4a3.6 3.6 0 0 1-7.2 0c0-1.6.8-2.6 1.6-3.4.1 1.2.6 2 1.4 2.4-.4-2.2.2-3.8.6-5.4Z`}
        />
      )}
      {kind === "winner" && (
        <path
          d={`M${cx} ${cy - 5}l1.5 3.2 3.4.4-2.5 2.3.7 3.4-3.1-1.7-3.1 1.7.7-3.4-2.5-2.3 3.4-.4Z`}
          transform={`translate(${cx} ${cy}) scale(1.35) translate(${-cx} ${-cy})`}
        />
      )}
    </g>
  );
}

// ----- tooltip ---------------------------------------------------------------

/** Pointer position inside the scroller, in its scrolled content box. */
interface TipAnchor {
  left: number;
  top: number;
  /** Near the right edge: open to the left of the pointer instead. */
  flip: boolean;
}

function Tooltip({
  anchor,
  children,
}: {
  anchor: TipAnchor;
  children: React.ReactNode;
}) {
  return (
    <div
      className="storyline-tooltip"
      role="status"
      style={{
        left: anchor.left + (anchor.flip ? -16 : 16),
        top: anchor.top + 14,
        transform: anchor.flip ? "translateX(-100%)" : undefined,
      }}
    >
      {children}
    </div>
  );
}

function columnTitle(col: StoryColumn): string {
  if (col.kind === "fire") return "Episode 13 · Fire-making";
  if (col.kind === "final") return "Final Tribal Council";
  const which = col.priorRound ? " · revote" : "";
  return `Episode ${col.episode} · ${col.sublabel} tribal${which}`;
}

function StopTip({
  story,
  thread,
  stop,
  name,
}: {
  story: Storyline;
  thread: StoryThread;
  stop: StoryStop;
  name: (id: string) => string;
}) {
  const col = story.columns[stop.column];
  const v = stop.vote;
  const wrote = v ? groupTargets(v.targets, name) : "";
  const firstVote = col.priorRound?.council.votes.filter(
    (r) => r.voter === thread.id && r.target,
  );
  return (
    <>
      <p className="storyline-tip-title">{thread.name}</p>
      <p className="storyline-tip-sub">{columnTitle(col)}</p>
      {firstVote && firstVote.length > 0 && (
        <p>
          First vote:{" "}
          {groupTargets(
            firstVote.map((r) => ({ id: r.target })),
            name,
          )}
          {firstVote.every((r) => r.nullified) && " — cancelled by an idol"}
        </p>
      )}
      {v && (
        <p>
          {v.state === "none"
            ? "No vote"
            : v.state === "nullified"
              ? `Voted ${wrote} — cancelled by an idol`
              : `${col.priorRound ? "Revote" : "Voted"}: ${wrote}`}
        </p>
      )}
      {v && (v.received > 0 || v.cancelled > 0) && (
        <p>
          {v.received} vote{v.received === 1 ? "" : "s"} against
          {v.cancelled > 0 && ` (+${v.cancelled} cancelled by idol)`}
        </p>
      )}
      {stop.exit && (
        <p className="storyline-tip-exit">{exitLine(stop.exit, col)}</p>
      )}
    </>
  );
}

function exitLine(
  kind: NonNullable<StoryStop["exit"]>,
  col: StoryColumn,
): string {
  switch (kind) {
    case "voted":
      return `Voted out ${col.tally.map(([, n]) => n).join("–")}`;
    case "injury":
      return "Medically evacuated";
    case "fire":
      return "Lost fire-making";
    case "finalist":
      return "Finalist · lost the jury vote";
    case "winner":
      return "Sole Survivor";
  }
}

function ColumnTip({
  story,
  column,
  name,
}: {
  story: Storyline;
  column: StoryColumn;
  name: (id: string) => string;
}) {
  if (column.kind === "fire") {
    return (
      <>
        <p className="storyline-tip-title">{columnTitle(column)}</p>
        <p>{column.exits.map(name).join(", ")} lost fire and joined the jury</p>
        <p className="storyline-tip-sub storyline-tip-count">
          Still in:{" "}
          {START_TRIBES.map((t) => `${t} ${column.remaining[t]}`).join(" · ")}
        </p>
      </>
    );
  }
  const tally =
    column.kind === "final"
      ? finalVotes(story.columns, story.threads).map(
          ([t, n]) => [t.id, n] as [string, number],
        )
      : column.tally;
  return (
    <>
      <p className="storyline-tip-title">{columnTitle(column)}</p>
      <ul className="storyline-tip-tally">
        {tally.map(([id, n]) => (
          <li
            key={id}
            className={
              column.exits.includes(id) && column.kind !== "final"
                ? "is-out"
                : ""
            }
          >
            <span>{name(id)}</span>
            <span>{n}</span>
          </li>
        ))}
      </ul>
      <p className="storyline-tip-sub storyline-tip-count">
        Still in:{" "}
        {START_TRIBES.map((t) => `${t} ${column.remaining[t]}`).join(" · ")}
      </p>
      {column.priorRound && (
        <p className="storyline-tip-sub">
          After a {column.priorRound.tally.map(([, n]) => n).join("–")} tie (
          {column.priorRound.tally.map(([id]) => name(id)).join(", ")})
        </p>
      )}
    </>
  );
}

/** "Emily ×2", "Chrissy & Coach". */
function groupTargets(
  targets: Array<{ id: string }>,
  name: (id: string) => string,
): string {
  const counts = new Map<string, number>();
  for (const t of targets) counts.set(t.id, (counts.get(t.id) ?? 0) + 1);
  return [...counts]
    .map(([id, n]) => (n > 1 ? `${name(id)} ×${n}` : name(id)))
    .join(" & ");
}

// ----- legend & table --------------------------------------------------------

/** One line. The vote key stands in for the hint while votes are showing. */
function Legend({ votesShowing }: { votesShowing: boolean }) {
  const marks: VoteMark[] = ["boot", "miss", "none"];
  return (
    <ul className="storyline-legend">
      <li className="storyline-legend-head">Starting tribe</li>
      {START_TRIBES.map((t) => (
        <li key={t}>
          <svg width="22" height="10" aria-hidden>
            <line
              x1="1"
              x2="21"
              y1="5"
              y2="5"
              style={{ stroke: TRIBE_COLORS[t] }}
              className="storyline-legend-line"
            />
          </svg>
          {t}
        </li>
      ))}
      <li>
        <svg width="18" height="18" aria-hidden>
          <ExitGlyph kind="voted" cx={9} cy={9} />
        </svg>
        Voted out
      </li>
      {votesShowing ? (
        marks.map((m) => (
          <li key={m}>
            <svg width="12" height="12" aria-hidden>
              <VoteNode mark={m} cx={6} cy={6} />
            </svg>
            {VOTE_LABEL[m]}
          </li>
        ))
      ) : (
        <li className="storyline-legend-hint">
          Hover a tribal or a player to see the votes
        </li>
      )}
    </ul>
  );
}

function StorylineTable({
  story,
  name,
}: {
  story: Storyline;
  name: (id: string) => string;
}) {
  const rows = story.columns.filter((c) => c.kind !== "start");
  return (
    <details className="storyline-table">
      <summary>Every tribal as a table</summary>
      <table>
        <thead>
          <tr>
            <th scope="col">Tribal</th>
            <th scope="col">Votes</th>
            <th scope="col">Voters</th>
            <th scope="col">Left the game</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.index}>
              <th scope="row">{columnTitle(c)}</th>
              <td>
                {c.tally.map(([id, n]) => `${name(id)} ${n}`).join(", ") || "—"}
              </td>
              <td>
                {c.council
                  ? [...new Set(c.council.votes.map((v) => v.voter))]
                      .map(name)
                      .join(", ")
                  : "—"}
              </td>
              <td>{exitsCell(story, c)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

function exitsCell(story: Storyline, col: StoryColumn): string {
  if (col.kind === "final") {
    const winner = story.threads.find((t) => t.outcome === "winner");
    return `${winner ? name(winner.id) : "?"} wins · ${col.exits.map(name).join(", ")} runners-up`;
  }
  if (col.exits.length === 0) return "—";
  const how = new Map(story.threads.map((t) => [t.id, t.outcome]));
  return col.exits
    .map((id) =>
      how.get(id) === "injury"
        ? `${name(id)} (medevac)`
        : how.get(id) === "fire"
          ? `${name(id)} (lost fire)`
          : name(id),
    )
    .join(", ");
}

// ----- path helper -----------------------------------------------------------

/** Horizontal S-curves through successive points (excluding the first M). */
function curveThrough(pts: ReadonlyArray<readonly [number, number]>): string[] {
  const out: string[] = [];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    if (y0 === y1) {
      out.push(`L${x1},${y1}`);
    } else {
      const mx = (x0 + x1) / 2;
      out.push(`C${mx},${y0} ${mx},${y1} ${x1},${y1}`);
    }
  }
  return out;
}
