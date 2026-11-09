# Accessibility & pre-deploy todo

**Status:** code work complete (2026-11-08); two human checks and the commit decision remain. Findings from an axe-core run on the dev server plus a manual
keyboard / screen-reader pass over `DashboardView.tsx` and `dashboard.css`. Work top to bottom;
each item lists the fix and how to verify it. Tick the box when verified, not when edited.

Verification tools: axe DevTools (or `axe.run()` in the console), Tab/Shift-Tab through the
whole page, VoiceOver (⌘F5) on Safari or Chrome, Chrome DevTools device toolbar at 390px.

---

## P0 — blocks deploy

### 1. Focus management on twist flip / close
- [x] On flip, move focus to `.twist-close` after the front face becomes `inert`
      (`TwistCard`, `DashboardView.tsx` ~L364). Use a ref + `useEffect` on `isFlipped`.
- [x] On close, return focus to the `.twist-flip` button that opened it.
- [x] Add Escape to close the flipped card (keydown on the card, or document-level while
      `selection.kind === "twist"`).
- **Verify:** Tab to a card, Enter, Tab once → lands on ×. Escape → card closes and focus is back
      on the card. `document.activeElement` is never `<body>` mid-flow.

### 2. Focus management on vote guess
- [x] Stop using `disabled` on `.dashboard-vote-option-button` after a guess (it drops focus).
      Use `aria-disabled="true"` and ignore clicks in `handleGuess` (already guards on `revealed`).
- [x] Collapsed loser rows: add `hidden` / `aria-hidden` once `phase === "collapsed"` so they
      leave the a11y tree (they currently stay in at 9px tall).
- **Verify:** Tab to an option, Enter → focus stays on that option; results read out.

### 3. Vote result announcement
- [x] Add one `aria-live="polite"` region per `VoteCard` that fills in after reveal:
      "Correct — the audience picked X (NN%)" / "Not quite — the audience picked X".
- [x] Expose the ✓ / ✗ meaning: swap the `aria-hidden` marker span for visually-hidden text, or
      put the result in the live region above and leave the glyph decorative.
- **Verify:** VoiceOver announces the outcome after a guess and after "Reveal all".

### 4. Cast tile focus indicator
- [x] Replace `outline: none` on `.dashboard-cast-tile:focus-visible` (`dashboard.css` ~L464)
      with a visible ring: e.g. `outline: 3px solid var(--color-ink); outline-offset: 3px`.
- [x] Make focused ≠ selected: selected keeps the green photo field + lift; focus adds the ring.
- **Verify:** Tab through the grid; ring is obvious on every tile, including a selected one.
      Ring vs canvas ≥ 3:1.

### 5. Vote-lens marks + "past castmate" exposed to assistive tech
- [x] Build a description string per tile when a player is selected:
      "Past castmate", "Voted out by <selected>", "Voted against N times…". Put it in a
      visually-hidden `<span id>` inside the tile and reference it with `aria-describedby`.
- [x] Keep the `title` tooltips on the marks for mouse users; the hidden text is the source of
      truth for readers.
- [x] Add a `.visually-hidden` utility to `global.css` (used by items 3, 5, 7).
- **Verify:** Select a player; VoiceOver on another tile reads name + relationship.

### 6. Landmarks and heading level one
- [x] Wrap `.dashboard-main` in `<main>` (`DashboardView.tsx` ~L807).
- [x] Add an `<h1>`: either promote the logo (`<h1><a><img alt="Survivor 50 — In the Hands of
      the Fans"/></a></h1>`) or add a visually-hidden `<h1>` before the sections.
- [x] Give each `<section>` an `aria-labelledby` pointing at its `<h2>` so they become named
      regions.
- **Verify:** axe reports 0 `landmark-one-main`, `page-has-heading-one`, `region` violations.

## P1 — should fix

### 7. Accessible names and decorative images
- [x] Cast tile: image `alt=""`, tile gets `aria-label={player.name}` (drop `title` or keep for
      hover only). Removes "Jenna Lewis-Dougherty Jenna".
- [x] Push pin: `alt=""` (`DashboardView.tsx` ~L659).
- [x] Twist front title `<span class="twist-title">` → `<h3>` (back already is `<h3>`).
- **Verify:** Rotor / headings list shows every twist; tile names read once.

### 8. Minimum text size
- [x] Raise 9.5–11px text to a 12px floor: `.twist-actor-name`, `.twist-ep`, `.twist-back-label`,
      `.dashboard-cast-sort-label`, `.dashboard-cast-legend li`, `.twist-diagram-note`,
      `.twist-actor-initials`, `.dashboard-cast-mark`.
- [x] Re-check the twist back body doesn't overflow at 311px card width after the bump
      (`scrollHeight - clientHeight` on `.twist-back-body`).
- **Verify:** `getComputedStyle` min font-size across the page ≥ 12px; no clipped twist text.

### 9. Sort control
- [x] Hover + focus on `.dashboard-cast-sort-select` should both show the focus outline
      (hover currently floods ink and hides the ring).
- [x] Label bump is covered by item 8.

## P2 — pre-production hygiene (not a11y)

### 10. Lint clean
- [x] `useReveal.ts` L24: return early-visible via `useState(() => reducedMotion)` initializer
      instead of `setVisible` in the effect.
- [x] `DashboardView.tsx` L634 / L641: reveal/reset signals — derive from props or handle in
      the click handler via a callback instead of setState-in-effect.
- [x] `SurvivorPage.tsx` L16: move/delete `useActiveSection` (unused) so the file only exports
      the component.
- [x] `TwistsView.tsx` L159: inline the `useMemo` callback, or delete the file (item 11).
- **Verify:** `npm run lint` → 0 problems. `npm run typecheck` still clean.

### 11. Dead code
- [x] Delete the commented-out JSX in `SurvivorPage.tsx` and its unused imports/hook.
- [x] Remove unrendered views: `TwistsView`, `SeasonsView`, `ConnectionsView`, `TreeNav` and
      their css. Keep `StorylineView` / `storyline.ts` / `glyphs.ts` (parked, see
      `journey-wip.md`; `glyphs.ts` is live).
- [x] Remove the `tree-*` and `player-detail-*` rules from `dashboard.css` if nothing uses them.
- **Verify:** `npm run build` passes; grep for each removed name returns nothing.

### 12. Assets and repo state
- [x] Shrink `hands-of-the-fans.svg` (609 KB → 80 KB) and `one-in-the-urn.svg` (245 KB → 143 KB).
      SVGO was the wrong tool: each file is a Figma export with one embedded base64 PNG that
      was >95% of the bytes. The logo (951px, drawn ~96 CSS px wide) is now a 400px JPEG; the
      moon (299px, drawn ~80 CSS px, needs alpha) is now a 200px PNG. Geometry untouched.
- [x] Moved the five `s-*.png` storyline screenshots to `docs/storyline-shots/` (delete if unwanted).
- [x] Committed as one commit (the redesign WIP and this session's edits were interleaved in
      `DashboardView.tsx` and `dashboard.css`, and no pre-session snapshot of the stylesheet
      existed to split against). Still untracked by choice: `docs/storyline-shots/`. Still
      present but unimported: `src/data/seasons.ts`, `src/data/challenges.ts`.
- **Verify:** `git status` clean; `dist/assets` largest svg well under 200 KB.

### 13. Final pass
- [x] Full axe run: 0 violations. 41 `color-contrast` incompletes, all "could not determine
      background" (select chevron gradient, cast-name pseudo-element, twist front under the
      transparent flip button); each pair measured by hand ≥ 4.5:1 (canvas on blue 5.66, ink on
      white 15+, canvas on ink chip 15.9).
- [x] Keyboard-only walk (real Tab presses, focus logged): 64 stops per cycle = logo + 3 nav +
      select + 24 tiles + 2 controls + 25 vote options + 8 flips. Focus leaves the document only
      at the wrap to browser chrome. No trap.
- [ ] **Human step.** VoiceOver walk of one tile selection, one vote, one twist. (Accessible
      names and descriptions verified programmatically; the actual reading order and verbosity
      need ears.)
- [ ] **Human step.** Spot-check on a real phone: twist card flip at ≤ 390px wide, header nav
      fits. (Passed in a 390px iframe simulation: no overflow, nav fits, cards 343×552.)
