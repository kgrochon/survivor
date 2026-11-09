# Journey storyline: work in progress

**Status:** parked (2026-11-04). It's off the dashboard, but all the code is kept and still
type-checks. Come back to it once it's simple enough to read at a glance.

## What it is
A storyline chart of Season 50. It has one thread per castaway, running left to right through
every tribal council:
- **Thread colour** is the player's starting tribe.
- **Band** is the tribe or team they were in at that point: swap tribes, E6 teams, Exile Island,
  the merge, E11 teams.
- **Exits** are marked with a skull, a medevac cross or a fire icon, plus a name.
- **FTC** labels the finalists with their jury votes (Aubry 8–3–0).
- **Hover** a tribal or a player to see who voted for whom, the tallies and the jury lines.
- A `<details>` table lists every tribal.

## Files
| File | Role |
|---|---|
| `src/data/storyline.ts` | Pure data and layout: columns, threads, group placement, per-tribe head counts, `finalVotes`, the takeaway sentence, and the dev-only `checkStoryline` assertions |
| `src/views/StorylineView.tsx` | The SVG chart, tooltips, legend and table |
| `src/views/styles/storyline.css` | Styles, all prefixed `storyline-` |
| `src/views/glyphs.ts` | `SKULL_PATH`, which the Cast section also uses |

The old `JourneysView.tsx` and `journeys.css` were deleted and replaced by these files.

## Putting it back on the page
In `src/views/DashboardView.tsx`:

```tsx
import { listCouncils } from "../data/voteHelpers";
import StorylineView from "./StorylineView";

/** Tribal councils in the Journey section, final tribal included. */
const TRIBAL_COUNT = listCouncils().filter((c) => !c.round || c.round === 1).length;

// NAV_SECTIONS, after Cast:
{ id: "section-journey", label: "Journey" },

// After the Cast <DashboardSection>, before Audience Votes:
<DashboardSection
  id="section-journey"
  modifier="dashboard-section--journey"
  title="Journey"
  count={TRIBAL_COUNT}
>
  <StorylineView selectedId={activePlayerId} onSelect={togglePlayer} />
</DashboardSection>
```

## Why it's parked
The feedback each round was that there was too much to take in at once. The chart has already
been cut back twice:
1. **Votes only on demand.** Vote nodes, arcs, attendance pills and jury lines appear only on
   hover. The vote marks were reduced from 5 to 3, and the E11 tied round was folded into its
   revote.
2. **One story at rest.** An analyst review added numbered callouts, juror tags and a "still in
   the game" bar strip. Together they were too much, so all three came out again. What's left at
   rest is one headline sentence, a one-line legend, the threads, the exits and the labelled
   finalists.

Even so, it's a lot: 24 threads, about 20 columns, several band types and 24 exit labels.

## Ideas for next time
- **Merge the E6 and E11 team sub-bands into one merge band.** This is the next simplification
  to try.
- Drop the column sublabels ("Cila", "Merge"…). The band labels already carry that information.
- Show a static overview first and let the reader expand to the full storyline. Or try small
  multiples per phase.
- Ideas from the review that were never built:
  - a per-player voting record, e.g. "with the majority 9 of 11"
  - names repeated at the start of each phase
  - grouping columns by episode (E5 and E6 have more than one tribal)
  - a fallback for touch screens, since all the detail is hover-only
- Things removed that could come back in a lighter form:
  - the head count by starting tribe (it's still in the column tooltip)
  - the "J" juror marker
  - the callouts (E6 Exile, merge numbers, E8 paired vote, E11 tie, FTC)

## Known limits
- The chart shrinks to fit down to 85% scale. Below about a 1350px-wide box it scrolls
  horizontally.
- Team rosters for E6 and E11 are written by hand in `storyline.ts`. `votes.ts` can't tell us
  about Exile Island or Jonathan's immunity.
