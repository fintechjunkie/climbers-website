#!/usr/bin/env node
/* ============================================================
   How full is each page, really.

   The parser's word budget is a cheap proxy. This is the measurement, and it
   exists because the proxy is wrong in a specific way that matters: page cost
   is driven by LINES, not words, and a spread of short dialogue lines burns a
   line per paragraph plus the space between them. Prologue I spread 2 is 262
   words in 8 paragraphs and overruns a 1280x720 laptop by 21%; spread 3 is 221
   words in the same 8 paragraphs and fits at 98%.

   Usage:
     npm run build && npm start          (in one terminal)
     npm run fill                        (in another)

   Requires a local Chrome or Edge. puppeteer-core does NOT download a browser;
   it drives the one already installed, so this costs nothing at deploy time
   and nothing to a reader.

   Reading the output: anything over 100% means the reader has to scroll to
   finish that page. The prose is written against the page, so the fix is
   almost always to trim the spread or split it, not to shrink the type.
   ============================================================ */

import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const BASE = process.env.FILL_BASE || 'http://localhost:3399';

const CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

const exe = process.env.CHROME_PATH || CANDIDATES.find((p) => existsSync(p));
if (!exe) {
  console.error('No Chrome or Edge found. Set CHROME_PATH to a browser executable.');
  process.exit(1);
}

// The viewports that actually bind. 1280x720 is the one that catches things:
// it is a real laptop, and it is short enough that the type clamp's FLOOR is
// what sets the size, so the column keeps shrinking while the type does not.
const VIEWPORTS = [
  { w: 1440, h: 900, label: 'desktop' },
  { w: 1280, h: 720, label: 'short laptop' },
  { w: 390, h: 844, label: 'iPhone' },
  { w: 360, h: 740, label: 'small android' },
];

const TARGETS = [
  { url: '/climb/p1/read', count: 13, name: 'p1' },
  { url: '/tales/t1/read', count: 4, name: 't1' },
  { url: '/tales/t2/read', count: 4, name: 't2' },
];

const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox'] });

let worstOver = 0;

for (const t of TARGETS) {
  console.log(`\n${'='.repeat(64)}\n${t.name}`);

  for (const v of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: v.w, height: v.h });
    await page.goto(BASE + t.url, { waitUntil: 'networkidle0' });

    const rows = [];
    for (let i = 0; i < t.count; i++) {
      await page.keyboard.press('ArrowRight');
      await new Promise((r) => setTimeout(r, 620));

      const r = await page.evaluate(() => {
        const flow = document.querySelector('[data-cl-kind="text"] .cl-flow');
        if (!flow) return null;
        // Release the flow so it reports its own content height. A stretching
        // flex child reports scrollHeight === clientHeight, so overflow reads
        // as zero otherwise.
        const prev = flow.style.flex;
        flow.style.flex = 'none';
        const content = flow.scrollHeight;
        // Restore BEFORE reading the box, never while released: a released box
        // shrink-wraps its content and both numbers become the same, so every
        // page reports exactly 100%.
        flow.style.flex = prev;
        return {
          n: Number(flow.closest('[data-cl-spread]')?.dataset.clSpread),
          pct: Math.round((content / flow.clientHeight) * 100),
        };
      });
      if (r) rows.push(r);
      // On a narrow screen a spread is two swipes; the second is the picture.
      if (v.w < 900) { await page.keyboard.press('ArrowRight'); await new Promise((x) => setTimeout(x, 620)); }
    }
    await page.close();

    const over = rows.filter((r) => r.pct > 100);
    worstOver = Math.max(worstOver, ...rows.map((r) => r.pct));
    console.log(`\n  ${v.label} (${v.w}x${v.h})`);
    console.log(`  ${rows.map((r) => `${String(r.n).padStart(2)}:${String(r.pct).padStart(3)}%`).join('  ')}`);
    if (over.length) console.log(`  ⚠ over: ${over.map((r) => `${r.n} @ ${r.pct}%`).join(', ')}`);
  }
}

await browser.close();
console.log(`\nWorst fill anywhere: ${worstOver}%`);
