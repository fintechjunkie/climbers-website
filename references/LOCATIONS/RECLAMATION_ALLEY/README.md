# the alley behind the water reclamation building

Token: `{{LOC:RECLAMATION_ALLEY}}`
Required file: `loc-reclamation-alley.png`

Use `loc-reclamation-alley.png` as the required visual reference whenever this location appears. Preserve the exact layout, palette and construction. 

**Status: LOCKED.**

## What this has to hold

Narrow, wet, rain finding the gaps. Bone Patrol checkpoint lights turning the rain silver two blocks north. t1 opener and spread 2.

## How to lock this

1. Generate the canonical image. One figure, plain
   ground, nothing from a story beat in frame — this is a reference sheet, not
   a plate.
2. Save it in this folder as exactly `loc-reclamation-alley.png`.
3. Paste the description into `block` for `RECLAMATION_ALLEY` in
   `content/roster.json`, and set `locked` to `true`.
4. Run `npm run prompts`. It will start attaching this file to every prompt
   that uses the token.

## Deviations from the block as written, and what was decided about each

_Record here anything the generated image does differently from the description,
and whether it was kept. Millbrook's reference folders do this and it is the
most useful part of them: the image is the authority, so when the two disagree
the description is what has to change._
