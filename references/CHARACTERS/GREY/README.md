# Grey

Token: `{{CHAR:GREY}}`
Required file: `char-grey-canonical.png`

Use `char-grey-canonical.png` as the required visual reference whenever this figure appears. Preserve the exact face, silhouette, proportions and coloration. Clothing may change only where the wardrobe rows below permit it.

**Status: LOCKED.**

## What this has to hold

Synthetic. Brass plating, torn Victorian coat, copper mechanisms in the LEFT arm, pocket watch on a chain. The watch is a plot object across four spreads and must be identical in every one. Appears in p1 spreads 1-11 pre-oath.

## Wardrobe rows

- `{{WARDROBE:GREY_CLIMB_WORN}}` — Forty-seven days of climbing: plating scorched, coat torn to tatters, left-arm mechanisms sparking. Pocket watch present on its chain. p1 spreads 1-11.
- `{{WARDROBE:GREY_POST_OATH}}` — After the Glitch Engine. Coat repaired but changed; pocket watch GONE; two fingers sit differently from the others. Everything from p1 spread 11 onward must match this, and so must every future appearance of Grey anywhere in the series.

## How to lock this

1. Generate the canonical image. One figure, full body, neutral pose, plain
   ground, nothing from a story beat in frame — this is a reference sheet, not
   a plate.
2. Save it in this folder as exactly `char-grey-canonical.png`.
3. Paste the description into `block` for `GREY` in
   `content/roster.json`, and set `locked` to `true`.
4. Run `npm run prompts`. It will start attaching this file to every prompt
   that uses the token.

## Deviations from the block as written, and what was decided about each

_Record here anything the generated image does differently from the description,
and whether it was kept. Millbrook's reference folders do this and it is the
most useful part of them: the image is the authority, so when the two disagree
the description is what has to change._
