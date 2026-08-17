#!/usr/bin/env node
/* ============================================================
   Slice a volume's prose into spreads.

     npm run slice p3            report the proposed boundaries, change nothing
     npm run slice p3 -- --write rewrite the spec with those boundaries

   Pagination is AUTHORED, not computed at render time — a spread that runs
   long does not reflow, it scrolls, which is reading a window instead of
   reading a page. This is the tool that does the authoring.

   Prose is MOVED, never retyped: --write re-emits the same paragraph strings
   under new `## Spread N` markers. Word counts are printed before and after
   and must match exactly.

   ---- the cost model, and why it is shaped like this ----

   Page cost is driven by LINES, not words. A paragraph occupies at least one
   whole line however short it is, plus the space after it, so a three-word
   line of dialogue is the most expensive prose on the page per word. Measured
   at 1280x720, the tightest common viewport:

     250 words / 4 paragraphs   cost 284   85% full
     221 words / 8 paragraphs   cost 271   85% full     <- same, despite -29 words
     262 words / 8 paragraphs   cost 325  104% full     <- overruns

   Headings cost far more than one line: the rule above and the air around it
   come to about 30 words of page.

   scripts/check-fill.mjs is the authority — this is the cheap proxy that gets
   you close without starting a browser.

   ---- two ways to get the packing wrong ----

   1. Do NOT balance a part evenly. Minimising the fullest page pushes EVERY
      page down, so a part that will not divide evenly becomes five 70% pages
      instead of four full ones and a short tail. The objective here is
      "fill each page, let the slack collect in the last page of the part",
      because a part break is a real pause in the story and the one place a
      short page reads as intentional.

   2. A heading and the paragraph under it are ONE indivisible unit. The
      weaker rule — "a group may not END on a heading" — rejects too many
      splits and unbalances what is left; it pushed a Tale from four full
      pages to five thin ones.
   ============================================================ */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const WORDS_PER_LINE = 11;
const GAP = 4;
const HEADING = 30;
const FULL = 340;      // cost that measures ~100% fill at 1280x720
const CEILING = 342;   // hard cap per page
const TAIL_MIN = 150;  // a part's last page may be short, but not an orphan

const W = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const cost = (b) => (b.t === 'h' ? HEADING : Math.max(W(b.v), WORDS_PER_LINE) + GAP);

/** Front matter, prose blocks, and the image records in document order. */
function read(file) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  const fmEnd = lines.indexOf('---', 1);
  const front = lines.slice(0, fmEnd + 1).join('\n');

  const blocks = [];
  const images = [];
  let buf = [];
  let img = null;
  let started = false;

  const flush = () => {
    const t = buf.join(' ').replace(/\s+/g, ' ').trim();
    if (t) blocks.push({ t: 'p', v: t });
    buf = [];
  };

  for (let i = fmEnd + 1; i < lines.length; i++) {
    const raw = lines[i];
    const l = raw.trim();
    if (l === '::: image') { flush(); img = []; continue; }
    if (img) {
      if (l === ':::') { images.push(img.join('\n')); img = null; }
      else img.push(raw);
      continue;
    }
    if (/^##\s/.test(l)) { flush(); started = true; continue; }
    if (!started) continue;
    if (/^###\s/.test(l)) { flush(); blocks.push({ t: 'h', v: l.replace(/^###\s+/, '') }); continue; }
    if (!l || l === '---') { flush(); continue; }
    buf.push(raw.trim());
  }
  flush();
  return { front, blocks, images };
}

/** Glue each heading to the paragraph it introduces. See note 2 above. */
function units(blocks) {
  const out = [];
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].t === 'h' && blocks[i + 1]) out.push([blocks[i], blocks[++i]]);
    else out.push([blocks[i]]);
  }
  return out;
}

/** Pack one part: every page full, slack in the last. See note 1 above. */
function pack(raw) {
  const U = units(raw).map((u) => ({ u, c: u.reduce((a, b) => a + cost(b), 0) }));
  const n = U.length;
  const pre = [0];
  for (let i = 0; i < n; i++) pre.push(pre[i] + U[i].c);
  const sum = (a, b) => pre[b] - pre[a];

  const dp = new Array(n + 1).fill(Infinity);
  const cut = new Array(n + 1).fill(-1);
  dp[0] = 0;
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] === Infinity) continue;
      const s = sum(j, i);
      if (s > CEILING) continue;
      const p = dp[j] + (CEILING - s) ** 2;
      if (p < dp[i]) { dp[i] = p; cut[i] = j; }
    }
  }

  // The tail is free of penalty, so pick the split that makes everything
  // before it as full as possible.
  let best = Infinity;
  let bestJ = -1;
  for (let j = 0; j < n; j++) {
    if (dp[j] === Infinity) continue;
    const tail = sum(j, n);
    if (tail > CEILING || (tail < TAIL_MIN && j > 0)) continue;
    if (dp[j] < best) { best = dp[j]; bestJ = j; }
  }
  if (bestJ < 0) throw new Error('no packing fits — a single paragraph may exceed the page');

  const groups = [U.slice(bestJ, n).flatMap((x) => x.u)];
  let i = bestJ;
  while (i > 0) { const j = cut[i]; groups.unshift(U.slice(j, i).flatMap((x) => x.u)); i = j; }
  return groups;
}

/* ---- run ------------------------------------------------------------ */

const slug = process.argv[2];
if (!slug) { console.error('usage: npm run slice <slug> [-- --write]'); process.exit(1); }
const WRITE = process.argv.includes('--write');

const SPEC = join(ROOT, 'content', 'specs', `${slug}.md`);
const { front, blocks, images } = read(SPEC);

const wordsBefore = blocks.filter((b) => b.t !== 'h').reduce((a, b) => a + W(b.v), 0);

// Part headings force a page break: a part is a real pause in the story.
const parts = [];
let cur = null;
for (const b of blocks) {
  if (b.t === 'h' && /^part /i.test(b.v)) { cur = { title: b.v, blocks: [b] }; parts.push(cur); continue; }
  if (!cur) { cur = { title: '(single part)', blocks: [] }; parts.push(cur); }
  cur.blocks.push(b);
}

const groups = [];
for (const p of parts) {
  const g = pack(p.blocks);
  console.log(`\n${p.title}  ->  ${g.length} spread(s)`);
  g.forEach((grp, i) => {
    const c = grp.reduce((a, b) => a + cost(b), 0);
    const words = grp.filter((b) => b.t !== 'h').reduce((a, b) => a + W(b.v), 0);
    console.log(
      `  S${String(groups.length + 1).padStart(2)} ${String(Math.round((c / FULL) * 100)).padStart(3)}%`
      + `${i === g.length - 1 ? ' tail' : '     '} ${String(words).padStart(3)}w  `
      + `${grp.find((b) => b.t !== 'h')?.v.slice(0, 58)}`,
    );
    groups.push(grp);
  });
}

const wordsAfter = groups.flat().filter((b) => b.t !== 'h').reduce((a, b) => a + W(b.v), 0);
console.log(`\n${groups.length} spreads, ${wordsAfter} words`);
if (wordsAfter !== wordsBefore) {
  console.error(`\nWORD COUNT CHANGED: ${wordsBefore} -> ${wordsAfter}. Refusing to write.`);
  process.exit(1);
}

if (!WRITE) {
  console.log('\nDry run. Re-run with `-- --write` to rewrite the spec.');
  process.exit(0);
}

// Image records are kept BY POSITION: spread N keeps the Nth record. If the
// count changed, say which ones are now unassigned rather than silently
// dropping a plate whose beat has moved.
const need = groups.length + 1; // +1 for the opener
if (images.length !== need) {
  console.warn(
    `\nImage records: ${images.length} on file, ${need} needed. `
    + `${images.length < need ? 'Add' : 'Remove'} ${Math.abs(images.length - need)} `
    + 'and check every record still matches the beat on its spread.',
  );
}

const out = [front, '', '## Opener', '', `::: image\n${images[0] || 'slug: TODO'}\n:::`, ''];
groups.forEach((grp, i) => {
  out.push(`## Spread ${i + 1}`, '');
  out.push(`::: image\n${images[i + 1] || 'slug: TODO'}\n:::`, '');
  for (const b of grp) out.push(b.t === 'h' ? `### ${b.v}` : b.v, '');
});

writeFileSync(SPEC, `${out.join('\n').replace(/\n{3,}/g, '\n\n')}\n`);
console.log(`\nRewrote content/specs/${slug}.md — now run \`npm run parse\`.`);
