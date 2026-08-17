# Climbers Reader

The flipbook reader for Climbers. Next.js 14 App Router, React 18, **no runtime
dependencies beyond next/react** — the page turn is hand-written CSS keyframes
and a React reducer, not a library.

Modelled on the Millbrook reader (`fintechjunkie/millbrook`) and its
`docs/FLIPBOOK-EXTRACTION.md`. The mechanics are that design; the palette,
geometry and content pipeline are this project's.

This lives in a subdirectory and does **not** touch the legacy static site at
the repo root. That site still deploys to GitHub Pages exactly as before.

---

## Deploying to Vercel

One project, one setting that matters:

1. vercel.com → **Add New… → Project** → import `fintechjunkie/climbers-website`
2. **Root Directory: `reader`** ← this is the setting. Everything else is detected.
3. Framework preset: Next.js. Build command, output dir, install command: leave as detected.
4. Deploy.

Pushes to `main` redeploy automatically. No `vercel.json`, no rewrites, no env vars.

**Verify a deploy by grepping the live HTML for a string only the new build can
contain.** Checking that a route returns 200 proves nothing if that route
already existed, and Vercel does intermittently miss a push.

---

## Reading the layout

A **leaf** is one opening. On a wide screen you see both halves at once: prose
on the left, one illustration on the right. Below 900px a leaf becomes two
swipes — text, then picture — because that is a change to the navigation model
rather than to the layout, which is why it is a JS breakpoint and not a media
query.

The opener and the end card are leaves too. Neither is counted in the spread
counter: a threshold is not a page of the story.

### Why the pages are square

Millbrook's page is square but its plates were generated 3:2. A landscape image
in a square box is width-limited — it fills the width and reaches about two
thirds of the height, leaving a third of the page empty underneath. That is the
white space at the bottom of every Millbrook picture page.

**Author every plate square.** The page is square, the plate is square, the
picture covers the page corner to corner with nothing left over and nothing
cropped. It is also the native output shape of every image model worth using.

---

## Content pipeline

```
content/specs/*.md  ──npm run parse──>  content/volumes/*.json  ──import──>  the reader
```

Nothing is edited in the JSON. It is generated, and the reader imports it
statically so the whole set is validated at build time by the bundler.
`prebuild` runs `parse --check`, so **a production build fails if a spec was
edited without regenerating** rather than silently serving the old sentence.

There is no markdown dependency and no runtime parser. The spec format is:

```md
---
slug: p1
arc: the-climb
order: 1
series: The Climb
part: Prologue I
title: The Architect's Ascent
byline: Grey
epigraph: Malachus Archive, restricted entry.
---

## Opener
::: image
slug: p1-opener
shotType: Establishing, full spread
depicts: ...
:::

## Spread 1
::: image
slug: p1-s01
shotType: Wide, high angle
caption: The line printed under the picture.
depicts: What is happening in frame.
spoilerCheck: PASS. Why this does not give away a later beat.
hardConstraints: What must and must not be in frame.
prompt: |
  {{STYLE}}
  {{LOC:PEAK_CHAMBER}}
  {{CHAR:GREY}}
  ...
:::

### A section heading

A paragraph.

> An aside, set italic against a rule.
```

Two inline conventions, and deliberately only two: `**text**` renders as the
site's cyan glow, `*text*` as italic. Everything an author can write is
something they can predict.

### Commands

| | |
|---|---|
| `npm run dev` | dev server |
| `npm run parse` | specs → volume JSON |
| `npm run parse:check` | fail if the JSON is stale (runs on `prebuild`) |
| `npm run fill` | measure how full every page is (needs the server running) |
| `npm run build` | production build |

**`next build` and `next dev` cannot share a directory.** A production build
overwrites `.next` under a running dev server and every route then 500s, which
reads exactly like a real module error. After a build: stop dev, `rm -rf .next`,
restart.

---

## Page fit

Prose is written **against the page**. Pagination is authored, not computed, so
a spread that runs long does not reflow — it scrolls, which is reading a window
instead of reading a page.

`npm run parse` estimates page load as:

```
paragraph = max(words, 11) + 4        one line minimum, plus the gap after it
heading   = 30                        its own line plus the air above and below
```

The floors are the whole point. A three-word line of dialogue still occupies a
line and a gap, which makes it the most expensive prose on the page per word —
so a page of terse exchanges costs far more than its word count suggests. A
flat per-paragraph surcharge is not enough, and undercharging headings is what
put two of these volumes over.

**~340 page load is a full page; over ~342 will scroll somewhere.**
`npm run fill` is the authority — the parser warning is what tells you without
starting a browser.

### Slicing a part

Pages should be full, and the slack should collect in the LAST page of a part,
because a part break is a real pause in the story. Two things follow that are
easy to get wrong:

- **Do not balance a part evenly.** Minimising the fullest page pushes *every*
  page down, so a part that will not divide evenly becomes five 70% pages
  instead of three full ones and a short one.
- **A heading and its first paragraph are one indivisible unit.** Not "a
  heading may not end a page" — that rejects too many splits and unbalances
  what is left.

Current state, measured at 1280×720: Prologue I runs 82-99% on its body pages
with tails at 63%, 42% and 53%; the Tales run 72-105%.

---

## Plates

Square JPEGs in `public/plates/`, named for the slug in the spec:
`p1-s01.jpg`, `t1-opener.jpg`.

A missing plate renders as a labelled placeholder printing its own slug and shot
type, so **the reader doubles as the production checklist**: page through a
volume and every frame you see is a picture that still needs making, named in
the exact string the file has to be saved as. `npm run parse` prints the count.

One flat directory, one extension, both hardcoded in `components/Plate.js`.
That is a decision rather than an oversight — naming it means a format change
is one edit in one file.

---

## Adding a volume

1. Write `content/specs/<slug>.md`.
2. `npm run parse`.
3. Add the import and registry entry in `lib/data.js` (three lines — the static
   registry does not scale past a dozen and should be generated by then; at
   three it is still cheaper to read than a glob).
4. If it starts a new arc, add the arc to `ARCS` in `lib/series.js`, add a shelf
   page under `app/<arc>/page.js` and a reader route under
   `app/<arc>/[vol]/read/page.js`. Copy an existing pair — they are deliberately
   near-duplicates rather than one dynamic `/[arc]/[vol]/read`, which would sit
   at the site root and swallow every unknown top-level path.
