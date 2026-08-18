#!/usr/bin/env node
/* ============================================================
   Expand the image prompts in content/specs/*.md into prompt sheets.

     npm run prompts        write prompt-sheets/<slug>.md, one per volume

   Each sheet is what you paste into an image model, plus the list of reference
   files to attach alongside it.

   THE RULE THIS FILE EXISTS TO ENFORCE, taken from Millbrook's lib-prompt.mjs
   where it is written up as a real failure:

     A prompt that claims an authority it does not have is WORSE than one that
     admits it has none.

   Millbrook shipped 21 prompts all saying "use the attached canonical
   reference as the authority for face, build, hair and proportion, match it,
   do not reinterpret it" while all 21 of those files were missing. Nothing was
   attached, the generator fell back to the text description, and the
   description was stale — so a character came back with the wrong hair and no
   hat, and the prompt had made the description sound optional at exactly the
   moment it was all there was.

   So: this checks the filesystem. A token whose canonical image is on disk
   gets the authority sentence and the attachment. A token whose image is
   missing gets a loud marker and its description carries the weight instead.
   ============================================================ */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REFS = join(ROOT, 'references');
const OUT = join(ROOT, 'prompt-sheets');
const roster = JSON.parse(readFileSync(join(ROOT, 'content', 'roster.json'), 'utf8'));

const folder = (n) => n.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');
const charDir = (t) => join('CHARACTERS', folder(t));
const locDir = (t) => join('LOCATIONS', folder(t));
const onDisk = (rel, file) => Boolean(file) && existsSync(join(REFS, rel, file));

/* ---- the expander --------------------------------------------------- */

// Appended to the style block on every prompt. These are the constraints that
// are true of every plate in the project, so they belong in one place.
const HARD = `

HARD RULES FOR EVERY PLATE
- Square, 1:1. The reader's page is square and the plate fills it edge to edge.
  Any other ratio leaves dead space on the page or loses the edges of the
  composition.
- No text, no lettering, no captions, no signatures, no watermarks anywhere in
  the image. The page draws its own furniture.
- No frame, no border, no vignette. The plate IS the page.
- Composition must survive a folio sitting in the bottom-right corner: keep the
  last ~6% of the lower-right free of anything load-bearing.

RENDERING AUTHORITY — READ THIS BEFORE LOOKING AT THE ATTACHMENTS
The attached references and the style block above are authorities over
DIFFERENT things, and mixing them up is the single most likely way this plate
comes back wrong.
- The STYLE BLOCK is the authority for HOW this plate is drawn: palette, light,
  value structure, surface, finish, edge quality, texture, and print feel.
- A CHARACTER reference is the authority for WHO is in the plate, and for
  nothing else. Those files are production reference sheets drawn in a
  glossier, more polished library language than the plates are. Take identity
  from them — face, build, proportion, costume geometry, signature colours,
  permanent accessories. Do NOT take rendering from them. Do not carry over
  their gloss, their airbrushed shading, their rim light, their glow bloom,
  their dark vignette, or their background.
- A LOCATION reference is already drawn in the plate style. Follow both its
  construction AND its rendering.
- If a character reference and the style block disagree about how something
  should LOOK, the style block wins every time. If they disagree about WHO
  someone is, the character reference wins every time.`;

function expand(prompt) {
  const attach = [];
  const missing = [];

  const text = prompt
    .replace(/\{\{STYLE\}\}/g, () => {
      const have = onDisk('STYLE', 'style-canonical.png');
      if (!roster.styleApproved) {
        missing.push('STYLE');
        return `>>> STYLE BLOCK NOT APPROVED IN content/roster.json — every plate generated from this sheet will be off-style <<<${HARD}`;
      }
      if (have) {
        attach.push({ file: join('STYLE', 'style-canonical.png'), label: 'style authority' });
        return `STYLE: ${roster.styleName}. The attached style reference is the authority for palette, light, surface and finish. Reproduce it; do not reinterpret it.\n\n${roster.style}${HARD}`;
      }
      missing.push('STYLE image');
      return `STYLE: ${roster.styleName}. No style reference is attached, so the description below is the only authority and must be followed exactly.\n\n${roster.style}${HARD}`;
    })

    .replace(/\{\{CHAR:([A-Z_0-9]+)\}\}/g, (_, k) => {
      const c = roster.characters[k];
      if (!c) { missing.push(`CHAR:${k}`); return `>>> UNKNOWN CHAR:${k} — not in roster.json <<<`; }

      const have = onDisk(charDir(k), c.ref);
      if (have) {
        attach.push({ file: join(charDir(k), c.ref), label: c.name });
        return `${c.kind}: ${c.name}. Use the attached canonical reference "${c.ref}" as the authority for IDENTITY ONLY — face, build, proportion, colour, costume geometry and signature details. Match those exactly; do not reinterpret them. Draw them in the style described above, NOT in the rendering language of the reference file.${c.block ? `\n${c.block}` : ''}`;
      }
      if (c.inline) {
        return `${c.kind}: ${c.name}. Described inline by design — there is no canonical image for this figure and none is planned, so the description below is the whole of the authority. If this figure appears on more than one plate, generate those plates in a single session; continuity between them is otherwise not guaranteed.${c.block ? `
${c.block}` : `
>>> AND NO DESCRIPTION WRITTEN: ${c.notes} <<<`}`;
      }
      missing.push(`CHAR:${k} (${c.ref})`);
      return `${c.kind}: ${c.name}. >>> NO CANONICAL REFERENCE ON DISK — nothing is attached for this figure, so the description below is the ONLY authority and continuity with other plates is not guaranteed. <<<${c.block ? `\n${c.block}` : `\n>>> AND NO DESCRIPTION BLOCK EITHER: ${c.notes} <<<`}`;
    })

    .replace(/\{\{WARDROBE:([A-Z_0-9]+)\}\}/g, (_, k) => {
      const w = roster.wardrobe[k];
      if (!w) { missing.push(`WARDROBE:${k}`); return `>>> UNKNOWN WARDROBE:${k} <<<`; }
      if (!w.value) { missing.push(`WARDROBE:${k} (empty)`); return `WARDROBE: >>> ${k} NOT WRITTEN — ${w.notes} <<<`; }
      // The canonical shows a figure in default condition. Three chamber plates
      // came back with a pristine Grey on day forty-seven of a climb because the
      // reference's CONDITION rode in alongside its identity. So this shouts.
      return `>>> WARDROBE — READ THIS BEFORE YOU LOOK AT THE CHARACTER REFERENCE <<<
The attached canonical shows this figure in its DEFAULT, UNDAMAGED, STUDIO condition. That is NOT the condition in this plate. Take IDENTITY from the reference and CONDITION from the line below; where they disagree, the line below wins completely.
${w.value}`;
    })

    .replace(/\{\{LOC:([A-Z_0-9]+)\}\}/g, (_, k) => {
      const l = roster.locations[k];
      if (!l) { missing.push(`LOC:${k}`); return `>>> UNKNOWN LOC:${k} — not in roster.json <<<`; }

      const have = onDisk(locDir(k), l.ref);
      if (have) {
        attach.push({ file: join(locDir(k), l.ref), label: `location — ${l.name}` });
        return `SETTING: ${l.name}. Use the attached canonical establishing image "${l.ref}" as the authority for layout, palette and construction. It is already drawn in the plate style, so follow its rendering as well as its geometry.${l.block ? `\n${l.block}` : ''}`;
      }
      missing.push(`LOC:${k} (${l.ref})`);
      return `SETTING: ${l.name}. >>> NO CANONICAL REFERENCE ON DISK — the description below is the only authority. <<<${l.block ? `\n${l.block}` : `\n>>> AND NO DESCRIPTION BLOCK EITHER: ${l.notes} <<<`}`;
    });

  return { text, attach, missing };
}

/* ---- read the specs ------------------------------------------------- */

function imageRecords(file) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  const out = [];
  let cur = null;
  let img = null;
  let key = null;

  for (const raw of lines) {
    const l = raw.trim();
    const leaf = /^##\s+(Opener|Spread\s+(\d+))\s*$/i.exec(l);
    if (leaf) { cur = leaf[2] ? `Spread ${leaf[2]}` : 'Opener'; continue; }
    if (l === '::: image') { img = {}; key = null; continue; }
    if (img && l === ':::') { out.push({ leaf: cur, ...img }); img = null; continue; }
    if (img) {
      const m = /^([A-Za-z][A-Za-z0-9_]*):\s?(.*)$/.exec(raw);
      if (m && !/^\s/.test(raw)) {
        key = m[1];
        img[key] = m[2].trim() === '|' ? '' : m[2].trim();
      } else if (key) {
        img[key] = `${img[key] ? `${img[key]}\n` : ''}${raw.replace(/^ {2}/, '')}`;
      }
    }
  }
  return out;
}

/* ---- run ------------------------------------------------------------ */

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const specDir = join(ROOT, 'content', 'specs');
const allMissing = new Set();
let totalPlates = 0;
let ready = 0;

for (const f of readdirSync(specDir).filter((x) => x.endsWith('.md')).sort()) {
  const slug = f.replace(/\.md$/, '');
  const records = imageRecords(join(specDir, f));
  const chunks = [`# Prompt sheet — ${slug}`, '',
    `Generated by \`npm run prompts\`. Do not edit: edit \`content/specs/${f}\` and \`content/roster.json\`.`, ''];

  for (const r of records) {
    totalPlates++;
    const plateOnDisk = r.slug && existsSync(join(ROOT, 'public', 'plates', `${r.slug}.jpg`));
    const { text, attach, missing } = expand(r.prompt || '');
    missing.forEach((m) => allMissing.add(m));
    if (!missing.length && r.prompt) ready++;

    chunks.push('---', '', `## ${r.leaf} — \`${r.slug}\``, '');
    chunks.push(`**Plate on disk:** ${plateOnDisk ? 'yes' : 'NO — this one still needs making'}`);
    if (r.shotType) chunks.push(`**Shot:** ${r.shotType}`);
    if (r.caption) chunks.push(`**Caption (not drawn; use as alt text):** ${r.caption}`);
    if (r.depicts) chunks.push('', `**Depicts:** ${r.depicts}`);
    if (r.spoilerCheck) chunks.push('', `**Spoiler check:** ${r.spoilerCheck}`);
    if (r.hardConstraints) chunks.push('', `**Hard constraints:** ${r.hardConstraints}`);

    chunks.push('', '**Attach these files** (paths relative to `references/`):');
    if (attach.length) for (const a of attach) chunks.push(`- \`${a.file.replace(/\\/g, '/')}\` — ${a.label}`);
    else chunks.push('- _nothing to attach yet_');

    if (missing.length) {
      chunks.push('', `> **Not ready.** Missing: ${missing.join(', ')}.`);
      chunks.push('> Generating from this prompt now will produce art that does not match anything else.');
    }

    chunks.push('', '```', r.prompt ? text : '>>> NO PROMPT WRITTEN IN THE SPEC YET <<<', '```', '');
  }

  writeFileSync(join(OUT, `${slug}.md`), `${chunks.join('\n')}\n`);
  console.log(`  wrote prompt-sheets/${slug}.md  (${records.length} plates)`);
}

console.log(`\n${ready}/${totalPlates} plates have a complete prompt with every reference on disk.`);
if (allMissing.size) {
  console.log('\nBlocking on:');
  for (const m of [...allMissing].sort()) console.log(`  ${m.split("\\").join("/")}`);
}
