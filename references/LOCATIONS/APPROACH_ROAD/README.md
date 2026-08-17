# the approach road

Token: `{{LOC:APPROACH_ROAD}}`
Required file: `loc-approach-road.png`

Use `loc-approach-road.png` as the required visual reference whenever this location appears. Preserve the exact layout, palette and construction. 

**Status: NOT LOCKED — no canonical image yet.**

## What this has to hold

Runs from the Tower gate down past The Prism. Transit hub across the street with a surveillance node above it. p3 spreads 19-20.

## How to lock this

1. Generate the canonical image. One figure, plain
   ground, nothing from a story beat in frame — this is a reference sheet, not
   a plate.
2. Save it in this folder as exactly `loc-approach-road.png`.
3. Paste the description into `block` for `APPROACH_ROAD` in
   `content/roster.json`, and set `locked` to `true`.
4. Run `npm run prompts`. It will start attaching this file to every prompt
   that uses the token.

## Deviations from the block as written, and what was decided about each

_Record here anything the generated image does differently from the description,
and whether it was kept. Millbrook's reference folders do this and it is the
most useful part of them: the image is the authority, so when the two disagree
the description is what has to change._
