# Haven City from above

Token: `{{LOC:HAVEN_CITY_AERIAL}}`
Required file: `loc-haven-city-aerial.png`

Use `loc-haven-city-aerial.png` as the required visual reference whenever this location appears. Preserve the exact layout, palette and construction. 

**Status: LOCKED.**

## What this has to hold

Street grid like a circuit board soldered onto the earth. Valari Quarter glowing faint blue, industrial blocks dark and square, the Wasteland out to the horizon, the Tower through the middle like a needle. p1 spreads 1 and 12.

## How to lock this

1. Generate the canonical image. One figure, plain
   ground, nothing from a story beat in frame — this is a reference sheet, not
   a plate.
2. Save it in this folder as exactly `loc-haven-city-aerial.png`.
3. Paste the description into `block` for `HAVEN_CITY_AERIAL` in
   `content/roster.json`, and set `locked` to `true`.
4. Run `npm run prompts`. It will start attaching this file to every prompt
   that uses the token.

## Deviations from the block as written, and what was decided about each

_Record here anything the generated image does differently from the description,
and whether it was kept. Millbrook's reference folders do this and it is the
most useful part of them: the image is the authority, so when the two disagree
the description is what has to change._
