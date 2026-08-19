#!/usr/bin/env node
/* ============================================================
   Delete working images nobody needs any more.

     npm run tidy          report what would go, change nothing
     npm run tidy -- --yes actually delete

   Two rules, and they are both narrow on purpose:

   1. A PNG in plate-sources/ whose plate is already shipped as
      public/plates/<slug>.jpg is the source of a finished picture. It is kept:
      the JPG is lossy and the PNG is the only way back.

   2. A PNG in plate-sources/candidates/ is a REJECT being held for a reason,
      and the reason is always an open revision note. If no REVISE-*.txt in
      prompt-packages/ mentions it by filename, the reason is gone and so is
      the file.

   Rejects used to be parked forever "in case". They were 176MB of in case.
   ============================================================ */
const fs = require('fs');
const path = require('path');

const GO = process.argv.includes('--yes');
const SRC = 'plate-sources';
const CAND = path.join(SRC, 'candidates');
const PKG = 'prompt-packages';

/* every filename mentioned by an open revision note */
const referenced = new Set();
if (fs.existsSync(PKG)) {
  for (const vol of fs.readdirSync(PKG)) {
    const dir = path.join(PKG, vol);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!/^REVISE-.*\.txt$/.test(f)) continue;
      const text = fs.readFileSync(path.join(dir, f), 'utf8');
      for (const m of text.matchAll(/([A-Za-z0-9._-]+\.png)/g)) referenced.add(m[1]);
    }
  }
}

const doomed = [];
let held = 0;

if (fs.existsSync(CAND)) {
  for (const f of fs.readdirSync(CAND)) {
    if (!/\.png$/i.test(f)) continue;
    if (referenced.has(f)) { held++; continue; }
    const p = path.join(CAND, f);
    doomed.push([p, fs.statSync(p).size]);
  }
}

const mb = (n) => `${(n / 1048576).toFixed(1)} MB`;
const total = doomed.reduce((a, [, n]) => a + n, 0);

if (!doomed.length) {
  console.log(`nothing to tidy — ${held} candidate(s) still referenced by a revision note`);
  process.exit(0);
}

console.log(`${doomed.length} reject(s) no revision note refers to any more, ${mb(total)}:`);
for (const [p, n] of doomed) console.log(`  ${p}  ${mb(n)}`);
if (held) console.log(`\n${held} candidate(s) kept — still named in an open REVISE note.`);

if (!GO) {
  console.log('\nNothing deleted. Re-run with `npm run tidy -- --yes` to remove them.');
  process.exit(0);
}
for (const [p] of doomed) fs.unlinkSync(p);
console.log(`\ndeleted ${doomed.length} file(s), ${mb(total)} recovered`);
