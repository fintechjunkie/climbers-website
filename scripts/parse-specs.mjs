#!/usr/bin/env node
/* ============================================================
   content/specs/*.md  ->  content/volumes/*.json

   Nothing is edited in the JSON. It is generated, and the reader imports it
   statically so the whole set is validated at build time by the bundler
   rather than at request time by a parser.

   There is no markdown dependency and no runtime parser anywhere in this
   project. The spec format is small enough to read in one screen, and keeping
   it that way is the point: every construct an author can write is a construct
   they can predict.

     ---                 front matter, key: value
     ## Opener           the title leaf
     ## Spread 7         one leaf: prose left, picture right
     ### Heading         a section heading inside the prose
     > text              an aside, set italic against a rule
     ::: image ... :::   the picture's record, including its prompt

   Run with --check to verify the committed JSON matches the specs. prebuild
   runs it, so a production build FAILS on a spec that was edited without
   regenerating, rather than silently serving the old sentence.
   ============================================================ */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SPECS = join(ROOT, 'content', 'specs');
const OUT = join(ROOT, 'content', 'volumes');

const CHECK = process.argv.includes('--check');

/**
 * The page budget. Not a style guide — a measurement, and the obvious version
 * of it is wrong in a way that costs real pages.
 *
 * Page cost is driven by LINES, not words. A paragraph occupies at least one
 * whole line however short it is, plus the space after it — so a three-word
 * line of dialogue is the most expensive prose on the page per word. Charging
 * a flat per-paragraph surcharge is not enough; the floor is what matters.
 *
 *   cost(paragraph) = max(words, WORDS_PER_LINE) + GAP
 *
 * Calibrated against scripts/check-fill.mjs at 1280x720, the tightest common
 * viewport, at the current type scale:
 *
 *   250 words / 4 paragraphs  cost 284   measured 85%
 *   221 words / 8 paragraphs  cost 271   measured 85%
 *   262 words / 8 paragraphs  cost 325   measured 104%
 *
 * -> a full page is about 326. Anything over ~318 will scroll somewhere.
 *
 * This is a proxy and it is allowed to be approximate; line-break luck moves
 * any given page by a few points either way. check-fill is the authority. This
 * is what tells an author they are in trouble without starting a browser.
 */
const WORDS_PER_LINE = 11;
const GAP = 4;
/* A part break now sets at type.sectionHead rather than type.kicker — about
   2.4x the height, plus its margins grew — so it eats materially more of the
   page than it did when this proxy was calibrated. Raised in proportion. */
const HEADING_COST = 58;
const FIT = { min: 150, max: 342 };

const countWords = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const blockCost = (b) =>
  (b.t === 'h' ? HEADING_COST : Math.max(countWords(b.v), WORDS_PER_LINE) + GAP);
const pageLoad = (spread) => spread.blocks.reduce((a, b) => a + blockCost(b), 0);

/** `key: value` lines, plus `key: |` for a block that runs to the next key. */
function parseFields(lines) {
  const out = {};
  let key = null;
  let block = null;

  for (const raw of lines) {
    const m = /^([A-Za-z][A-Za-z0-9_]*):\s?(.*)$/.exec(raw);
    if (m && block === null) {
      key = m[1];
      if (m[2].trim() === '|') { block = []; out[key] = ''; }
      else out[key] = m[2].trim();
      continue;
    }
    if (block !== null) {
      // A block scalar ends at the next unindented key.
      if (/^[A-Za-z][A-Za-z0-9_]*:/.test(raw) && !/^\s/.test(raw)) {
        out[key] = block.join('\n').trim();
        block = null;
        const m2 = /^([A-Za-z][A-Za-z0-9_]*):\s?(.*)$/.exec(raw);
        key = m2[1];
        if (m2[2].trim() === '|') { block = []; out[key] = ''; }
        else out[key] = m2[2].trim();
        continue;
      }
      block.push(raw.replace(/^ {2}/, ''));
    }
  }
  if (block !== null && key) out[key] = block.join('\n').trim();
  return out;
}

function parseSpec(src, file) {
  const lines = src.split(/\r?\n/);

  // ---- front matter ----
  if (lines[0].trim() !== '---') throw new Error(`${file}: expected front matter on line 1`);
  const fmEnd = lines.indexOf('---', 1);
  if (fmEnd < 0) throw new Error(`${file}: unterminated front matter`);
  const meta = parseFields(lines.slice(1, fmEnd));

  for (const req of ['slug', 'arc', 'title', 'part']) {
    if (!meta[req]) throw new Error(`${file}: front matter is missing "${req}"`);
  }

  // ---- leaves ----
  const spreads = [];
  let cur = null;
  let imgLines = null;
  let para = [];

  const flushPara = () => {
    if (!para.length || !cur) { para = []; return; }
    const text = para.join(' ').replace(/\s+/g, ' ').trim();
    if (text) {
      if (text.startsWith('> ')) cur.blocks.push({ t: 'i', v: text.slice(2).trim() });
      else cur.blocks.push({ t: 'p', v: text });
    }
    para = [];
  };

  const flushLeaf = () => {
    if (!cur) return;
    flushPara();
    if (cur.kind === 'spread') cur.words = countWords(cur.blocks.map((b) => b.v).join(' '));
    spreads.push(cur);
    cur = null;
  };

  for (let i = fmEnd + 1; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    if (imgLines) {
      if (line === ':::') {
        cur.image = parseFields(imgLines);
        imgLines = null;
      } else imgLines.push(raw);
      continue;
    }

    if (line === '::: image') {
      if (!cur) throw new Error(`${file}:${i + 1}: image block outside a leaf`);
      flushPara();
      imgLines = [];
      continue;
    }

    const leaf = /^##\s+(Opener|Spread\s+(\d+))\s*$/i.exec(line);
    if (leaf) {
      flushLeaf();
      cur = leaf[2]
        ? { n: Number(leaf[2]), kind: 'spread', blocks: [], image: {} }
        : { n: 0, kind: 'opener', image: {} };
      continue;
    }

    const h = /^###\s+(.+?)\s*$/.exec(line);
    if (h) { flushPara(); cur?.blocks?.push({ t: 'h', v: h[1] }); continue; }

    if (!line) { flushPara(); continue; }
    if (line === '---') { flushPara(); continue; }
    para.push(line);
  }
  flushLeaf();

  if (imgLines) throw new Error(`${file}: unterminated ::: image block`);

  // The opener carries the title block the reader sets over the plate.
  const opener = spreads.find((s) => s.kind === 'opener');
  if (opener) {
    opener.title = {
      series: meta.series || '',
      part: meta.part,
      title: meta.title,
      byline: meta.byline || '',
      epigraph: meta.epigraph || '',
    };
  }

  // Reading order comes from the spread numbers, and they have to be the
  // sequence 1..n with nothing missing. A gap here means a leaf was deleted
  // and the ones after it were never renumbered, which the reader would show
  // as a counter that skips.
  const story = spreads.filter((s) => s.kind === 'spread');
  story.forEach((s, i) => {
    if (s.n !== i + 1) {
      throw new Error(`${file}: spreads must be numbered 1..n in order; found ${s.n} at position ${i + 1}`);
    }
  });

  return {
    slug: meta.slug,
    arc: meta.arc,
    order: Number(meta.order || 0),
    part: meta.part,
    title: meta.title,
    byline: meta.byline || '',
    epigraph: meta.epigraph || '',
    // The shelf card's selling line. The epigraph is an archive citation and
    // reads as one; a card needs a sentence that tells a stranger what the
    // volume IS. Optional, so a spec written before this existed still parses.
    blurb: meta.blurb || '',
    source: file,
    spreads,
  };
}

/* ---- run ------------------------------------------------------------- */

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const files = readdirSync(SPECS).filter((f) => f.endsWith('.md')).sort();
if (!files.length) {
  console.error('No specs found in content/specs');
  process.exit(1);
}

let stale = 0;
let warnings = 0;
const manifest = [];

for (const file of files) {
  const vol = parseSpec(readFileSync(join(SPECS, file), 'utf8'), file);
  const json = `${JSON.stringify(vol, null, 2)}\n`;
  const dest = join(OUT, `${vol.slug}.json`);

  const story = vol.spreads.filter((s) => s.kind === 'spread');
  const words = story.reduce((a, s) => a + s.words, 0);

  // Which plates are actually on disk. This is the production checklist: a
  // slug in the spec is an intention, a file in public/plates is a picture.
  const pending = vol.spreads.filter(
    (s) => !s.image?.slug || !existsSync(join(ROOT, 'public', 'plates', `${s.image.slug}.jpg`)),
  );

  const over = story.filter((s) => pageLoad(s) > FIT.max);
  const under = story.filter((s) => pageLoad(s) < FIT.min);

  console.log(
    `${vol.slug.padEnd(4)} ${String(story.length).padStart(2)} spreads  ${String(words).padStart(5)} words  `
    + `avg ${String(Math.round(words / story.length)).padStart(3)}  `
    + `plates ${vol.spreads.length - pending.length}/${vol.spreads.length}`,
  );

  for (const s of over) {
    warnings++;
    const paras = s.blocks.filter((b) => b.t !== 'h').length;
    console.warn(
      `  ! ${vol.slug} spread ${s.n}: page load ${pageLoad(s)} over ${FIT.max} `
      + `(${s.words} words in ${paras} paragraphs) — will scroll on a short laptop`,
    );
  }
  for (const s of under) {
    warnings++;
    console.warn(`  ~ ${vol.slug} spread ${s.n}: page load ${pageLoad(s)} under ${FIT.min} — the page will look starved`);
  }

  const existing = existsSync(dest) ? readFileSync(dest, 'utf8') : null;
  if (existing !== json) {
    if (CHECK) {
      stale++;
      console.error(`  ✗ ${vol.slug}.json is stale — run \`npm run parse\``);
    } else {
      writeFileSync(dest, json);
      console.log(`  → wrote content/volumes/${vol.slug}.json`);
    }
  }

  manifest.push({
    slug: vol.slug,
    arc: vol.arc,
    order: vol.order,
    part: vol.part,
    title: vol.title,
    epigraph: vol.epigraph,
    blurb: vol.blurb,
    href: `/${vol.arc === 'the-climb' ? 'climb' : vol.arc}/${vol.slug}/read`,
    cover: `/plates/${vol.spreads.find((s) => s.kind === 'opener')?.image?.slug || `${vol.slug}-opener`}.jpg`,
    spreadCount: story.length,
    words,
  });
}

/**
 * The manifest the ORIGINAL static homepage reads.
 *
 * public/index.html is not part of the React app and cannot import anything,
 * so it needs a plain JSON file to know which volumes exist and where they are
 * read. Generating it here rather than hand-keeping a list in main.js is what
 * stops the homepage and the reader disagreeing about what has been published.
 *
 * It lives in public/data/ beside site.json, which is where that page already
 * looks for its content.
 */
/* Planned-but-unwritten volumes go into the manifest too, flagged, so the
   static homepage can show the shape of an arc the way the React shelf does.
   Without them the homepage jumped Prologue I -> Prologue III and the missing
   tile read as a bug rather than as work in progress. */
const planned = JSON.parse(readFileSync(join(ROOT, 'content', 'planned.json'), 'utf8'));
for (const p of planned) {
  if (manifest.some((v) => v.slug === p.slug)) continue;  // it got written
  manifest.push({ ...p, status: 'planned', href: null, cover: null, spreadCount: 0, words: 0 });
}

manifest.sort((a, b) => (a.arc === b.arc ? a.order - b.order : a.arc < b.arc ? 1 : -1));
const manifestJson = `${JSON.stringify(manifest, null, 2)}\n`;
const manifestPath = join(ROOT, 'public', 'data', 'volumes.json');
const manifestExisting = existsSync(manifestPath) ? readFileSync(manifestPath, 'utf8') : null;
if (manifestExisting !== manifestJson) {
  if (CHECK) {
    stale++;
    console.error('  ✗ public/data/volumes.json is stale — run `npm run parse`');
  } else {
    writeFileSync(manifestPath, manifestJson);
    console.log('  → wrote public/data/volumes.json');
  }
}

if (CHECK && stale) {
  console.error(`\n${stale} volume(s) out of date. A build must not ship prose that is not in the specs.`);
  process.exit(1);
}
if (warnings) console.warn(`\n${warnings} fit warning(s). These do not fail the build; they are for the author.`);
