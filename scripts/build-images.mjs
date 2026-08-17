#!/usr/bin/env node
/* ============================================================
   Convert the site's illustrations to WebP.

   Why this exists: public/ was 206MB, 90.7MB of which was 38 PNGs. Every one
   of them is an opaque AI-rendered illustration at 1024-1536px — PNG is a
   lossless format designed for flat colour and transparency, and it is the
   worst possible container for a painterly image. They were averaging 2.4MB
   each for pictures that draw at a few hundred pixels.

   WebP at quality 86 is visually indistinguishable on this material and about
   a fifteenth of the size. Alpha is preserved where a source actually has it,
   so the faction icons keep their transparency.

     npm run images          convert what is missing or stale
     npm run images -- --force   redo everything
     npm run images -- --check   report only, change nothing, exit 1 if stale

   The outputs are COMMITTED, so deploying needs nothing installed and there is
   no runtime image loader. sharp is a devDependency: it is only needed to
   author the files, never to serve them.
   ============================================================ */

import { readdirSync, statSync, existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FORCE = process.argv.includes('--force');
const CHECK = process.argv.includes('--check');

// Quality 86 rather than the more common 80. These are illustrations with
// large smooth gradients — skies, light bloom, atmospheric haze — and that is
// exactly the content where WebP's chroma handling shows banding if pushed.
// 86 costs a few hundred KB across the whole site and removes the question.
const QUALITY = 86;

// Directories whose PNGs become WebP, and whose references were updated to
// match. Adding a directory here means updating the code that points at it.
const CONVERT = ['public/assets/oath-lords', 'public/assets/timeline'];

const mb = (n) => `${(n / 1048576).toFixed(2)} MB`;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

let before = 0;
let after = 0;
let converted = 0;
let stale = 0;
const report = [];

for (const rel of CONVERT) {
  const dir = join(ROOT, rel);
  if (!existsSync(dir)) continue;

  for (const src of walk(dir)) {
    if (extname(src).toLowerCase() !== '.png') continue;

    const dest = join(dirname(src), `${basename(src, extname(src))}.webp`);
    const srcSize = statSync(src).size;
    before += srcSize;

    const fresh = existsSync(dest) && !FORCE
      && statSync(dest).mtimeMs >= statSync(src).mtimeMs;

    if (fresh) {
      after += statSync(dest).size;
      continue;
    }

    if (CHECK) {
      stale++;
      console.error(`  ✗ missing or stale: ${rel}/${basename(dest)}`);
      continue;
    }

    const meta = await sharp(src).metadata();
    await sharp(src)
      .webp({ quality: QUALITY, effort: 6, alphaQuality: 100 })
      .toFile(dest);

    const destSize = statSync(dest).size;
    after += destSize;
    converted++;
    report.push({
      name: `${rel.replace('public/', '')}/${basename(dest)}`,
      from: srcSize,
      to: destSize,
      dims: `${meta.width}x${meta.height}`,
      alpha: meta.hasAlpha,
    });

    // Only remove the source once the replacement exists and is plausible.
    // A zero-byte or absurdly small output means the encode went wrong, and
    // deleting the original on top of that would turn a bad encode into data
    // loss. Git would still have it, but "recoverable from history" is not the
    // same as "not broken".
    if (destSize > 1024) unlinkSync(src);
    else console.error(`  ! ${basename(dest)} encoded to ${destSize} bytes — keeping the PNG`);
  }
}

if (CHECK) {
  if (stale) {
    console.error(`\n${stale} image(s) not built. Run \`npm run images\`.`);
    process.exit(1);
  }
  console.log('All images built.');
  process.exit(0);
}

report.sort((a, b) => (b.from - b.to) - (a.from - a.to));
for (const r of report) {
  const pct = Math.round((1 - r.to / r.from) * 100);
  console.log(
    `  ${String(pct).padStart(3)}%  ${mb(r.from).padStart(8)} -> ${mb(r.to).padStart(8)}  `
    + `${r.dims.padEnd(10)}${r.alpha ? 'alpha ' : '      '}${r.name}`,
  );
}

if (converted) {
  console.log(
    `\n${converted} image(s): ${mb(before)} -> ${mb(after)} `
    + `(${Math.round((1 - after / before) * 100)}% smaller)`,
  );
} else {
  console.log('Nothing to do — every image is already built.');
}
