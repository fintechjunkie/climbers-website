# CLIMBERS Pulp SciFi

Token: `{{STYLE}}`
Required file: `style-canonical.png`

**Status: APPROVED.**

The site's existing chapter art is the reference point: high-contrast neon cyberpunk, deep blacks, gold and cyan accents, volumetric light, painterly rather than photographic. Write the block once, lock it, and put it at the HEAD of every prompt — Millbrook found that a style clause sitting in the negative block at the foot gets ignored, and hoisting it to the head fixed it on one pass.

## How to lock this

1. Generate one plate that is nothing but the style — a scene with no named
   character and no story beat.
2. Save it here as `style-canonical.png`.
3. Paste the description into `style` in `content/roster.json` and set
   `styleApproved` to `true`.

Until that is done, `npm run prompts` refuses to claim a style authority and
says so loudly in every sheet.
