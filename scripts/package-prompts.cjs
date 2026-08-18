/* Build one drop-folder per plate: the prompt, and the exact images to attach.
   Millbrook shape — you open a folder, drag everything in it into the chat,
   paste the prompt, done. Nothing to look up and nothing to decide. */
const fs = require('fs');
const path = require('path');

// Which volume to package. `npm run package -- p3`, defaulting to the one
// most likely to be wanted rather than to a volume that is already finished.
const SLUG = process.argv[2] || 'p3';
const SHEET = path.join('prompt-sheets', SLUG + '.md');
const REFS = 'references';
const OUT = path.join('prompt-packages', SLUG);

const sheet = fs.readFileSync(SHEET, 'utf8');
const blocks = sheet.split(/^---$/m).slice(1);

// READ-ME-FIRST.txt is written by hand, not generated, so carry it across the
// clean rebuild. Losing it once was enough.
// Hand-written notes at the top level of a package survive the clean rebuild.
// READ-ME-FIRST.txt and any REVISE-*.txt are authored, not generated.
const keepNames = fs.existsSync(OUT)
  ? fs.readdirSync(OUT).filter((n) => /^(READ-ME-FIRST|REVISE-.*).txt$/.test(n))
  : [];
const kept = keepNames.map((n) => [n, fs.readFileSync(path.join(OUT, n))]);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const [n, buf] of kept) fs.writeFileSync(path.join(OUT, n), buf);

const plates = [];
for (const b of blocks) {
  const head = /^##\s+(.+?)\s+—\s+`(.+?)`/m.exec(b);
  if (!head) continue;
  const attach = [...b.matchAll(/^- `([^`]+)` — (.+)$/gm)].map((m) => ({ file: m[1], label: m[2] }));
  const code = /```\n([\s\S]*?)\n```/.exec(b);
  const field = (name) => {
    const m = new RegExp('\\*\\*' + name + ':?[^*]*\\*\\*\\s*(.+)').exec(b);
    return m ? m[1].trim() : '';
  };
  plates.push({
    leaf: head[1], slug: head[2], attach,
    prompt: code ? code[1] : '',
    shot: field('Shot'), caption: field('Caption'), depicts: field('Depicts'),
    spoiler: field('Spoiler check'), hard: field('Hard constraints'),
  });
}


// The frame shape, resolved to ONE ratio for this plate and pushed to the top
// and the bottom of the prompt. Stating both ratios in a single rule, forty
// lines in, is what let the first p2 plates come back non-square.
const formatBlock = (isOpener) => (isOpener ? [
  '>>> FORMAT: 2:1 LANDSCAPE. EXACTLY TWICE AS WIDE AS IT IS TALL. <<<',
  'Check this before anything else. Not 16:9, not 3:2, not 4:3, not square, not',
  'portrait. A true 2:1 frame — if the height is anything other than half the',
  'width, this plate is wrong no matter how good the picture inside it is.',
  'It spans both pages of an opening and each page shows one half, so compose the',
  'LEFT half and the RIGHT half to each work alone, and keep the centre clear of',
  'anything load-bearing — the gutter runs through it.',
] : [
  '>>> FORMAT: SQUARE. 1:1. EQUAL WIDTH AND HEIGHT. <<<',
  'Check this before anything else. Not 4:3, not 3:2, not 16:9, not 5:4, not',
  'portrait, not landscape, not close to square — a true 1:1 frame with the same',
  'number of pixels across as down.',
  'COMPOSE THE PICTURE INTO A SQUARE. Do not compose it wide and crop it down, and',
  'do not let a wide subject — a room, a horizon, a line of figures — pull the',
  'frame wider. Stage the subject to fit the square instead.',
  "The reader is looking at a square page and the plate fills it edge to edge, so any other",
  'ratio either leaves dead bands on the page or cuts the edges off the picture.',
  'If the image is wider than it is tall, the plate has failed.',
]);
const formatTail = (isOpener) => (isOpener
  ? 'REMINDER, AND IT OVERRIDES ANY IMPULSE FROM THE COMPOSITION ABOVE: this plate is 2:1 LANDSCAPE — exactly twice as wide as it is tall.'
  : 'REMINDER, AND IT OVERRIDES ANY IMPULSE FROM THE COMPOSITION ABOVE: this plate is SQUARE, 1:1 — equal width and height. Not landscape, not portrait, not nearly square.');
const isOpener = (p) => /opener/i.test(p.slug) || /opener/i.test(p.leaf);

const nlMd = String.fromCharCode(10);
const EOL = String.fromCharCode(13) + String.fromCharCode(10);
const TITLE = (() => {
  const spec = path.join('content', 'specs', SLUG + '.md');
  if (!fs.existsSync(spec)) return SLUG;
  const m = /^title:s*(.+)$/m.exec(fs.readFileSync(spec, 'utf8'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : SLUG;
})();
const index = [];
plates.forEach((p, i) => {
  const n = String(i).padStart(2, '0');
  // A plate already in public/plates/ is finished. Nest it under _DONE/ so the
  // top level of the package is exactly the work that is left, in running order.
  const done = fs.existsSync(path.join('public', 'plates', p.slug + '.jpg'));
  const dir = done
    ? path.join(OUT, '_DONE', n + '-' + p.slug)
    : path.join(OUT, n + '-' + p.slug);
  fs.mkdirSync(dir, { recursive: true });

  const lines = [
    'CLIMBERS — ' + p.leaf + '  (' + p.slug + ')',
    '='.repeat(60), '',
    'ATTACH THE ' + p.attach.length + ' IMAGE(S) IN THIS FOLDER, THEN PASTE EVERYTHING BELOW THE LINE.',
    '',
  ];
  p.attach.forEach((a) => lines.push('  - ' + path.basename(a.file) + '   (' + a.label + ')'));
  lines.push('', 'Shot: ' + p.shot);
  if (p.caption) lines.push('Caption (not drawn — alt text only): ' + p.caption);
  if (p.spoiler) lines.push('Spoiler check: ' + p.spoiler);
  const op = isOpener(p);
  lines.push('', '-'.repeat(60), '');
  lines.push(...formatBlock(op), '');
  lines.push(p.prompt, '', formatTail(op), '');
  fs.writeFileSync(path.join(dir, 'PROMPT.txt'), lines.join('\r\n'));


  for (const a of p.attach) {
    const src = path.join(REFS, a.file);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(dir, path.basename(a.file)));
    else console.log('  MISSING ' + src);
  }
  index.push({ n, p, dir });
});

// ---- the single readable document ----
const md = [
  '# ' + TITLE.toUpperCase(),
  '', '**' + plates.length + ' plates.** One folder per plate under `prompt-packages/' + SLUG + '/`.',
  'Each folder holds `PROMPT.txt` and the exact images to attach — drag the folder\'s',
  'images into ChatGPT, paste the prompt, generate.',
  '',
  'Generated by `npm run prompts` + the packager. Do not edit these by hand:',
  'edit `content/specs/' + SLUG + '.md` or `content/roster.json` and rebuild.',
  '',
  '## Palette rotation',
  '',
  '| # | Plate | Mode |',
  '|---|---|---|',
];
plates.forEach((p, i) => {
  const mode = (/PALETTE MODE: (PS-\d [A-Z ]+)/.exec(p.prompt) || [, '—'])[1].replace(/[,.]$/, '').trim();
  md.push('| ' + String(i).padStart(2, '0') + ' | ' + p.leaf + ' | ' + mode + ' |');
});
md.push('', '---', '');
plates.forEach((p, i) => {
  md.push('## ' + String(i).padStart(2, '0') + ' — ' + p.leaf + '  `' + p.slug + '`', '');
  const rel = (fs.existsSync(path.join('public', 'plates', p.slug + '.jpg')) ? '_DONE/' : '')
    + String(i).padStart(2, '0') + '-' + p.slug;
  md.push('**Folder:** `prompt-packages/' + SLUG + '/' + rel + '/`'
    + (rel.startsWith('_DONE') ? '  — **DONE, already shipped**' : ''), '');
  md.push('**Attach:** ' + (p.attach.length ? p.attach.map((a) => '`' + path.basename(a.file) + '`').join(', ') : 'nothing'), '');
  if (p.depicts) md.push('**Depicts:** ' + p.depicts, '');
  if (p.hard) md.push('**Hard constraints:** ' + p.hard, '');
  if (p.spoiler) md.push('**Spoiler check:** ' + p.spoiler, '');
  md.push('```', formatBlock(isOpener(p)).join(nlMd), '', p.prompt, '', formatTail(isOpener(p)), '```', '');
});
fs.writeFileSync(path.join(OUT, 'ALL-PROMPTS.md'), md.join('\n'));

console.log(plates.length + ' packages built in ' + OUT);
console.log('attachments copied: ' + plates.reduce((a, p) => a + p.attach.length, 0));
