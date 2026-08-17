# a Bone Patrol officer

Token: `{{CHAR:BONE_PATROL}}`
Required file: `char-bone-patrol-canonical.png`

Use `char-bone-patrol-canonical.png` as the required visual reference whenever this figure appears. Preserve the exact face, silhouette, proportions and coloration. Clothing may change only where the wardrobe rows below permit it.

**Status: NOT LOCKED — no canonical image yet.**

## What this has to hold

Absalom's people. Chrome skull-face, red optics, hammer at the hip. The hammer is NEVER raised in any plate we have specced. Appears in p1 spreads 5-7 and t1 spread 3.

## How to lock this

1. Generate the canonical image. One figure, full body, neutral pose, plain
   ground, nothing from a story beat in frame — this is a reference sheet, not
   a plate.
2. Save it in this folder as exactly `char-bone-patrol-canonical.png`.
3. Paste the description into `block` for `BONE_PATROL` in
   `content/roster.json`, and set `locked` to `true`.
4. Run `npm run prompts`. It will start attaching this file to every prompt
   that uses the token.

## Deviations from the block as written, and what was decided about each

_Record here anything the generated image does differently from the description,
and whether it was kept. Millbrook's reference folders do this and it is the
most useful part of them: the image is the authority, so when the two disagree
the description is what has to change._
