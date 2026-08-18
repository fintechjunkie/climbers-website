# The Oath Lords

Ten canonical figures. **Not roster entities**, so `npm run refs` neither
creates this folder nor audits it, and nothing here counts toward the
`n/33` ready count.

Absalom · Cipher · Fawn · Malacus · Sister Silence · Thorne · Unit-5947 ·
Vesper · Vex · Yuki

They live here because they are canonical for the world even though no plate
in the four written volumes depicts one. When an Oath Lord first appears in
prose, add them to `content/roster.json` as a `CHARACTER`, run `npm run refs`
to scaffold `CHARACTERS/<TOKEN>/`, and move the image there under the filename
that folder's README names.

## One of these is already load-bearing

**Absalom.** The Delivery's first plate is a close study of a sealed pouch with
**Absalom's skull sigil pressed into black wax** — the seal is the subject of
the image and must be sharp and central.

So that plate needs the *sigil*, not the figure. Before generating `t1-s01`,
pull the skull sigil off this canonical and write its geometry into the prompt,
or the wax will come back with a generic skull that contradicts him the first
time he actually appears on the page.

## Sister Silence

Also the worked example in `CLIMBERS_Pulp_SciFi_Illustration_Project_Guide_v2.md`
§8, which fixes her palette: blue skin, gold ceremonial visor and garments, dark
robe areas, signature gold geometry.

`CHARACTERS/SANDMAN/` is drawn from the same visual family — the roster records
the Sandmen as "Sister Silence's people" — so these two files should be checked
against each other whenever either is regenerated.
