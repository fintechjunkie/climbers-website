# a Questron

Token: `{{CHAR:QUESTRON}}`
Required file: `char-questron-canonical.png`

Use `char-questron-canonical.png` as the required visual reference whenever this figure appears. Preserve the exact face, silhouette, proportions and coloration. Clothing may change only where the wardrobe rows below permit it.

**Status: NOT LOCKED — no canonical image yet.**

## What this has to hold

Blue suit, faceted dark head, a gold question mark centred on the face — neither glowing nor dim, simply there, permanent. Identical units throughout Haven City. Hands at its sides; no ceremony in it. NOTE: the site already has Questron art in public/assets — check it before generating, and match it.

## How to lock this

1. Generate the canonical image. One figure, full body, neutral pose, plain
   ground, nothing from a story beat in frame — this is a reference sheet, not
   a plate.
2. Save it in this folder as exactly `char-questron-canonical.png`.
3. Paste the description into `block` for `QUESTRON` in
   `content/roster.json`, and set `locked` to `true`.
4. Run `npm run prompts`. It will start attaching this file to every prompt
   that uses the token.

## Deviations from the block as written, and what was decided about each

_Record here anything the generated image does differently from the description,
and whether it was kept. Millbrook's reference folders do this and it is the
most useful part of them: the image is the authority, so when the two disagree
the description is what has to change._
