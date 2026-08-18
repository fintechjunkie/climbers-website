/* Every image inside prompt-packages/ is a COPY of a reference. Copies go stale
   the moment a canonical is replaced, and a stale copy is the worst kind of
   wrong: the folder looks complete, the prompt reads correctly, and it quietly
   regenerates against the reference we just fixed.

   That already happened once — after the Prism was rebuilt as a four-zone room,
   five hand-copied fix folders were still shipping the old narrow corridor.

   This walks every png under prompt-packages/ and compares it byte-for-byte
   with the file of the same name under references/. Anything that has drifted
   is reported with the folder that holds it.

     node scripts/check-packages.cjs        report
     node scripts/check-packages.cjs --fix  overwrite stale copies in place    */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const PKG = path.join(ROOT, 'prompt-packages');
const REFS = path.join(ROOT, 'references');
const FIX = process.argv.includes('--fix');

if (!fs.existsSync(PKG)) { console.log('no prompt-packages/ — nothing to check'); process.exit(0); }

const hash = (f) => crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex');

/** every reference image, by basename */
const master = new Map();
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.png')) master.set(e.name, p);
  }
}(REFS));

let checked = 0;
let stale = 0;
let fixed = 0;

(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!e.name.endsWith('.png')) continue;
    // CURRENT-*.png are deliberate snapshots of a plate being revised, not copies
    // of a reference, so they are expected to differ and are skipped.
    if (e.name.startsWith('CURRENT-')) continue;
    const src = master.get(e.name);
    if (!src) continue;
    checked++;
    if (hash(src) === hash(p)) continue;
    stale++;
    console.log(`  STALE  ${path.relative(ROOT, p)}`);
    if (FIX) { fs.copyFileSync(src, p); fixed++; }
  }
}(PKG));

console.log(`\n${checked} package image(s) checked against references/`);
if (!stale) { console.log('all current.'); process.exit(0); }
if (FIX) { console.log(`${fixed} refreshed.`); process.exit(0); }
console.error(`${stale} stale. Re-run the packager, or: node scripts/check-packages.cjs --fix`);
process.exit(1);
