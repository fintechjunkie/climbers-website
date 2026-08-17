# Pixels

Token: `{{CHAR:PIXELS}}`
Required file: `char-pixels-canonical.png`

Use `char-pixels-canonical.png` as the required visual reference whenever this figure appears. Preserve the exact face, silhouette, proportions and coloration. Clothing may change only where the wardrobe rows below permit it.

**Status: NOT LOCKED — no canonical image yet.**

## What this has to hold

Synthetic courier. His face is a DISPLAY SURFACE, not a face: pale blue grid when he wants it to show nothing, blank dark glass in a pale frame when he wants to show less than that. Which state he is in is dramatic information and is specified per spread.

## Wardrobe rows

- `{{WARDROBE:PIXELS_GRID}}` — Pale blue grid pattern on the visor — what he shows when he wants to show nothing. t1 spreads 1-2.
- `{{WARDROBE:PIXELS_BLANK}}` — No colour, no pattern, just dark glass in a pale frame — what he shows when the grid would be information. t1 spreads 3-4.

## How to lock this

1. Generate the canonical image. One figure, full body, neutral pose, plain
   ground, nothing from a story beat in frame — this is a reference sheet, not
   a plate.
2. Save it in this folder as exactly `char-pixels-canonical.png`.
3. Paste the description into `block` for `PIXELS` in
   `content/roster.json`, and set `locked` to `true`.
4. Run `npm run prompts`. It will start attaching this file to every prompt
   that uses the token.

## Deviations from the block as written, and what was decided about each

_Record here anything the generated image does differently from the description,
and whether it was kept. Millbrook's reference folders do this and it is the
most useful part of them: the image is the authority, so when the two disagree
the description is what has to change._
