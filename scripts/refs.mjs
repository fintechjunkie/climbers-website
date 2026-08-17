#!/usr/bin/env node
/* ============================================================
   Scaffold and audit references/ from content/roster.json.

   references/ is where canonical images live: one folder per locked entity,
   holding the image and a README that says what the image is authoritative
   for. Following Millbrook, which keeps the same shape in
   patch-notes/reference-source/.

     npm run refs        create any missing folders and READMEs, report status

   The folders are generated from the roster so the two cannot drift. Drop the
   image into the folder using the filename the README names, then fill in the
   `block` for that entity in content/roster.json — the description and the
   image together are the lock.

   references/ is NOT inside public/, so none of it is served to readers. It is
   production material.
   ============================================================ */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REFS = join(ROOT, 'references');
const roster = JSON.parse(readFileSync(join(ROOT, 'content', 'roster.json'), 'utf8'));

const folder = (name) => name.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');

/** Everything the roster declares, flattened into one list of drop targets. */
const targets = [
  ...Object.entries(roster.characters).map(([token, c]) => ({
    token, dir: join('CHARACTERS', folder(token)), ...c, type: 'CHAR',
  })),
  ...Object.entries(roster.locations).map(([token, l]) => ({
    token, dir: join('LOCATIONS', folder(token)), ...l, type: 'LOC',
  })),
];

function readme(t) {
  const wardrobe = (t.wardrobe || [])
    .map((w) => `- \`{{WARDROBE:${w}}}\` — ${roster.wardrobe[w]?.notes || ''}`)
    .join('\n');

  return `# ${t.name}

Token: \`{{${t.type}:${t.token}}}\`
Required file: \`${t.ref}\`

Use \`${t.ref}\` as the required visual reference whenever this ${
  t.type === 'LOC' ? 'location appears' : 'figure appears'
}. Preserve the exact ${
  t.type === 'LOC'
    ? 'layout, palette and construction'
    : 'face, silhouette, proportions and coloration'
}. ${
  t.type === 'LOC'
    ? ''
    : 'Clothing may change only where the wardrobe rows below permit it.'
}

**Status: ${t.locked ? 'LOCKED' : 'NOT LOCKED — no canonical image yet'}.**

## What this has to hold

${t.notes}
${wardrobe ? `\n## Wardrobe rows\n\n${wardrobe}\n` : ''}
## How to lock this

1. Generate the canonical image. One figure${t.type === 'LOC' ? '' : ', full body, neutral pose'}, plain
   ground, nothing from a story beat in frame — this is a reference sheet, not
   a plate.
2. Save it in this folder as exactly \`${t.ref}\`.
3. Paste the description into \`block\` for \`${t.token}\` in
   \`content/roster.json\`, and set \`locked\` to \`true\`.
4. Run \`npm run prompts\`. It will start attaching this file to every prompt
   that uses the token.

## Deviations from the block as written, and what was decided about each

_Record here anything the generated image does differently from the description,
and whether it was kept. Millbrook's reference folders do this and it is the
most useful part of them: the image is the authority, so when the two disagree
the description is what has to change._
`;
}

let created = 0;
let haveImage = 0;
const missing = [];

for (const t of targets) {
  const dir = join(REFS, t.dir);
  if (!existsSync(dir)) { mkdirSync(dir, { recursive: true }); created++; }

  const rmPath = join(dir, 'README.md');
  const next = readme(t);
  if (!existsSync(rmPath) || readFileSync(rmPath, 'utf8') !== next) writeFileSync(rmPath, next);

  if (existsSync(join(dir, t.ref))) haveImage++;
  else missing.push(`${t.dir}/${t.ref}`);
}

// STYLE gets a folder too — it is the one reference every prompt uses.
const styleDir = join(REFS, 'STYLE');
if (!existsSync(styleDir)) { mkdirSync(styleDir, { recursive: true }); created++; }
writeFileSync(join(styleDir, 'README.md'), `# ${roster.styleName}

Token: \`{{STYLE}}\`
Required file: \`style-canonical.png\`

**Status: ${roster.styleApproved ? 'APPROVED' : 'NOT APPROVED'}.**

${roster.styleNotes}

## How to lock this

1. Generate one plate that is nothing but the style — a scene with no named
   character and no story beat.
2. Save it here as \`style-canonical.png\`.
3. Paste the description into \`style\` in \`content/roster.json\` and set
   \`styleApproved\` to \`true\`.

Until that is done, \`npm run prompts\` refuses to claim a style authority and
says so loudly in every sheet.
`);

console.log(`references/  ${targets.length} entities, ${created} folder(s) created`);
console.log(`             ${haveImage}/${targets.length} canonical images present`);
console.log(`             style block ${roster.styleApproved ? 'approved' : 'NOT approved'}`);
if (existsSync(join(styleDir, 'style-canonical.png'))) console.log('             style image present');
else console.log('             style image MISSING: STYLE/style-canonical.png');

if (missing.length) {
  console.log('\nWaiting on:');
  for (const m of missing) console.log(`  ${m.split("\\").join("/")}`);
}
