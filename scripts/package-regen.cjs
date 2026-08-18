/* Build the regeneration drop-folders for Prologue I.
   Each holds the CURRENT plate, the references, and a revision prompt that
   edits rather than restarts — except s11, where the shot itself is wrong. */
const fs = require('fs');
const path = require('path');

const OUT = path.join('prompt-packages', 'p1-REGEN');
const REFS = 'references';
const SHEET = fs.readFileSync(path.join('prompt-sheets', 'p1.md'), 'utf8');

const WARDROBE_WORN = `THE WARDROBE IS THE POINT OF THIS EDIT. The attached character canonical shows
Grey in clean studio condition. This plate is DAY FORTY-SEVEN OF A CLIMB and he
must not be clean:
  - the greatcoat is TORN TO TATTERS at hem and cuffs, with the DEEP RED LINING
    showing through the rips
  - it is SCORCHED DARK along one side
  - the steel plating on his face and hands is scorched, scuffed and
    heat-discoloured
  - the copper and brass mechanisms of the LEFT FOREARM are EXPOSED and
    INTERMITTENTLY SPARKING
  - the suit beneath is filthy and torn
  - the pocket watch on the long chain stays UNDAMAGED AND CLEAN — it is the one
    cared-for thing on him`;

const jobs = [
  {
    slug: 'p1-s02', mode: 'MODIFY', title: 'Grey before Seraph',
    why: 'Composition is right. Only the wardrobe is wrong — and his hands.',
    keep: [
      'the camera position, the framing and the whole composition',
      'Seraph exactly as drawn: the nested gold polyhedrons, the orbital rings, the suspended shards, the vertical shaft of light — no face, no body, do not redesign it',
      'the scale relationship: Grey small, Seraph dominant',
      'the lighting — Seraph as the only significant light source, long shadows across the crystal floor',
      'the palette, the crystal architecture and the city visible through the transparent floor',
    ],
    change: [
      WARDROBE_WORN,
      'HIS HANDS ARE EMPTY AND AT HIS SIDES. He is not holding the watch up, not raising it, not presenting it. The watch hangs on its chain at the waistcoat where it belongs. Both arms hang naturally.',
    ],
  },
  {
    slug: 'p1-s03', mode: 'MODIFY', title: 'the fall',
    why: 'He is free-falling. He should be HOLDING ON — that is the difference between a man dying and a man surviving a room.',
    keep: [
      'the rotated world: the crystalline plane running vertically, the city reading as a wall of light rather than a floor',
      'the off-axis camera tilt and the diagonal composition',
      'the palette — raking gold and amber against deep navy, hard graphic crystal facets',
      'his coat streaming out with the red lining showing',
      'the pocket watch swung out clear of his body on its chain, mid-arc',
    ],
    change: [
      'HIS LEFT ARM IS HOOKED HARD OVER A CRYSTALLINE OUTCROP AND IS TAKING HIS ENTIRE WEIGHT. This is the single most important change. Add a substantial crystal outcrop into the frame for him to catch. His left elbow and forearm wrap over it, the shoulder loaded, the arm visibly straining. His body swings out and away from that anchor point.',
      'It must be the LEFT arm — the one with the exposed copper mechanisms.',
      'His right hand stays open and reaching for nothing.',
      'He is not falling freely. He caught himself. Every line of his body should read as weight hanging from that one arm.',
      WARDROBE_WORN,
    ],
  },
  {
    slug: 'p1-s04', mode: 'MODIFY', title: 'the argument',
    why: 'He is standing square to camera. The beat is him braced low and looking UP into the light, having just asked the real question.',
    keep: [
      'Seraph as drawn — the tightly coalesced polyhedrons, rings drawn in close, the concentration of it. Do not redesign it.',
      'the chamber, the crystal spires, the transparent floor and the city below',
      'the palette and the hard overhead white-gold light',
    ],
    change: [
      'GREY IS BRACED ON A CRYSTAL OUTCROP IN THE LOWER FRAME — one boot planted up on the rock, the other leg below taking his weight, his torso turned up and open. He is not standing at full height and he is not squared to the camera.',
      'HIS HEAD IS TIPPED BACK AND HE IS LOOKING DIRECTLY UP INTO SERAPH. Not at the viewer. His jaw is set.',
      'HIS HANDS ARE EMPTY. He is not holding the watch up. The watch hangs at the waistcoat.',
      'Move the camera LOW — below him, looking up past his shoulder into the light, so Seraph fills the upper two-thirds and Grey reads as the smaller thing that is not backing down.',
      'This is an argument, not a fight. Nothing is thrown, nothing breaks.',
      WARDROBE_WORN,
    ],
  },
  {
    slug: 'p1-s08', mode: 'MODIFY', title: 'Seraph dimmed',
    why: 'The staging is better than what was asked for. Keep all of it. Only the wardrobe is wrong.',
    keep: [
      'EVERYTHING ABOUT THE COMPOSITION. The seated pose, Seraph small and dimmed in his open palm, the low sun behind the crystal, the warm amber palette, the camera, the framing, the whole mood. This plate is approved and this is a wardrobe pass only.',
    ],
    change: [WARDROBE_WORN],
  },
  {
    slug: 'p1-s10', mode: 'MODIFY', title: 'the Glitch Engine',
    why: 'The light comes from above and behind him. It has to come from INSIDE him — the Engine ignites in his chest. That is the whole plate.',
    keep: [
      'the pose exactly: arms fully out to the sides, head back, full figure, low hero angle',
      'the palette: magenta, violet, electric blue and cyan with amber-white at the core, deep navy anchors',
      'the shattered crystal architecture and the city below',
      'the sense of scale and the monumentality of the figure',
    ],
    change: [
      'THE LIGHT ORIGINATES FROM THE CENTRE OF HIS CHEST. Remove the shaft of light descending from above and behind him entirely. Nothing is shining down on him. The source is a single point inside his ribcage and every ray, plane and ring radiates OUTWARD FROM THAT POINT.',
      'Build the detonation as HARD-EDGED GEOMETRY expanding from the chest: nested planes, radiating polygons, expanding rings. Not fire, not smoke, not a soft glow. Geometry.',
      'ADD BRASS AND STEEL FRAGMENTS spinning away from his torso and arms, catching the light as they go, like shattering glass thrown outward.',
      'HE IS NOT COMING APART — he is being rebuilt. No gore, no collapse, no wreckage of him. The figure holds together even as pieces leave it.',
      'Keep the crack splitting the crystal wall behind him from floor to ceiling.',
      WARDROBE_WORN,
    ],
  },
];

const fresh = {
  slug: 'p1-s11', title: 'the watch, stopped',
  why: 'Not a modify. The previous attempt is a full-figure hero shot in daylight; this beat is a close, dark still life. The prompt it was generated from also contradicted itself — it applied the post-oath wardrobe, which says the watch is gone, to a plate about the watch. That is fixed. Generate this one from scratch.',
};

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// pull each plate's attachment list out of the generated sheet
function attachmentsFor(slug) {
  const block = SHEET.split(/^---$/m).find((b) => b.includes('`' + slug + '`'));
  return block ? [...block.matchAll(/^- `([^`]+)` — (.+)$/gm)].map((m) => ({ file: m[1], label: m[2] })) : [];
}
function promptFor(slug) {
  const block = SHEET.split(/^---$/m).find((b) => b.includes('`' + slug + '`'));
  const m = /```\n([\s\S]*?)\n```/.exec(block || '');
  return m ? m[1] : '';
}

const index = [];
for (const j of jobs) {
  const dir = path.join(OUT, j.slug);
  fs.mkdirSync(dir, { recursive: true });
  const atts = attachmentsFor(j.slug);

  fs.copyFileSync(path.join('public', 'plates', j.slug + '.jpg'), path.join(dir, 'CURRENT-' + j.slug + '.jpg'));
  for (const a of atts) {
    const src = path.join(REFS, a.file);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(dir, path.basename(a.file)));
  }

  const L = [
    'CLIMBERS — REGENERATE ' + j.slug + '   (' + j.title + ')',
    '='.repeat(66), '',
    'MODIFY THE EXISTING IMAGE. Do not start over.', '',
    'ATTACH, IN THIS ORDER:',
    '  1. CURRENT-' + j.slug + '.jpg   <- the image being revised',
  ];
  atts.forEach((a, i) => L.push('  ' + (i + 2) + '. ' + path.basename(a.file) + '   (' + a.label + ')'));
  L.push('', 'WHY: ' + j.why, '', '-'.repeat(66), '');
  L.push('Revise the FIRST attached image. The remaining attachments are the');
  L.push('authorities for identity and setting, unchanged. Keep the locked CLIMBERS');
  L.push('Pulp SciFi style: screen-printed / lithographic texture, bold graphic');
  L.push('shadow masses, crisp ink-like edges, selective detail, strong silhouettes.');
  L.push('No photorealism, no glossy 3D, no overall bloom.', '');
  L.push('KEEP EXACTLY AS THEY ARE — do not redesign these:');
  j.keep.forEach((k) => L.push('  - ' + k));
  L.push('', 'CHANGE:', '');
  j.change.forEach((c, i) => L.push((i + 1) + '. ' + c, ''));
  L.push('Square 1:1. No text, no lettering, no border, no frame, no caption.');
  L.push('Keep the lower-right ~6% clear of anything load-bearing.', '');
  fs.writeFileSync(path.join(dir, 'REVISE.txt'), L.join('\r\n'));
  index.push({ slug: j.slug, title: j.title, mode: 'MODIFY', why: j.why, dir, n: atts.length + 1 });
}

// s11 — fresh
{
  const dir = path.join(OUT, fresh.slug);
  fs.mkdirSync(dir, { recursive: true });
  const atts = attachmentsFor(fresh.slug);
  for (const a of atts) {
    const src = path.join(REFS, a.file);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(dir, path.basename(a.file)));
  }
  fs.copyFileSync(path.join('public', 'plates', fresh.slug + '.jpg'), path.join(dir, 'REJECTED-' + fresh.slug + '.jpg'));
  const L = [
    'CLIMBERS — REGENERATE ' + fresh.slug + '   (' + fresh.title + ')',
    '='.repeat(66), '',
    'GENERATE FROM SCRATCH. Do NOT attach or modify the rejected image.',
    '(REJECTED-' + fresh.slug + '.jpg is in this folder for your reference only —',
    ' it is what we are moving away from. Do not feed it to the model.)', '',
    'ATTACH:',
  ];
  atts.forEach((a, i) => L.push('  ' + (i + 1) + '. ' + path.basename(a.file) + '   (' + a.label + ')'));
  L.push('', 'WHY: ' + fresh.why, '', '-'.repeat(66), '', promptFor(fresh.slug), '');
  fs.writeFileSync(path.join(dir, 'PROMPT.txt'), L.join('\r\n'));
  index.push({ slug: fresh.slug, title: fresh.title, mode: 'FROM SCRATCH', why: fresh.why, dir, n: atts.length });
}

const md = ['# PROLOGUE I — REGENERATION BATCH', '',
  'Six plates. Five are **modify the existing image**; one is a fresh generation.',
  'Each folder holds everything you need to attach.', '',
  '| plate | mode | attach | why |', '|---|---|---|---|'];
index.forEach((i) => md.push('| `' + i.slug + '` | ' + i.mode + ' | ' + i.n + ' files | ' + i.why + ' |'));
md.push('', '---', '');
index.forEach((i) => {
  const f = i.mode === 'MODIFY' ? 'REVISE.txt' : 'PROMPT.txt';
  md.push('## `' + i.slug + '` — ' + i.title, '', '**Folder:** `' + i.dir.replace(/\\/g, '/') + '/`  ·  **' + i.mode + '**', '',
    '```', fs.readFileSync(path.join(i.dir, f), 'utf8').replace(/\r/g, ''), '```', '');
});
fs.writeFileSync(path.join(OUT, 'REGENERATION-BATCH.md'), md.join('\n'));

console.log(index.length + ' regeneration packages built in ' + OUT);
index.forEach((i) => console.log('  ' + i.slug + '  ' + i.mode + '  ' + i.n + ' attachment(s)'));
