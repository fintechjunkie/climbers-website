/* ============================================================
   Design constants for the Climbers reader.

   Everything visual that is not a one-off lives here, so a palette change is
   one file rather than a grep. The structure follows Millbrook's series.js
   because the reader components were written against that shape; the VALUES
   are Climbers — dark ground, brass gold, Tower cyan — rather than Millbrook's
   paper and ink.
   ============================================================ */

// ---- Colour ------------------------------------------------------------

export const color = {
  // Prose. Not #fff: pure white on near-black vibrates at reading sizes and is
  // the single most common way a dark reader gives people a headache.
  ink: '#d6d6db',
  inkSoft: '#8b8b96',
  inkFaint: '#5c5c66',

  // The site's two established accents, carried over unchanged so the reader
  // does not read as a different product from the rest of Climbers.
  gold: '#c9a84c',
  goldSoft: '#8c7433',
  cyan: '#7fefef',
  cyanDim: 'rgba(0, 255, 255, 0.35)',
};

/* The surround: the desk the book is lying on.
 *
 * Millbrook reads immediately as a book because a cream page on a grey desk is
 * an enormous value step — you see an object resting on a surface before you
 * read a word. This reader lost that: ground #08080a against page #141418 is
 * barely two values apart, so the spread read as a dark panel on a dark screen
 * rather than as paper.
 *
 * A dark reader cannot borrow Millbrook's answer — light pages would fight
 * every plate and the rest of the site. So the separation is built the other
 * way: push the ground DOWN toward black, lift the page UP, and light the book
 * from above with a soft pool so it sits in its own space. Same perceptual
 * job, opposite direction.
 */
export const reader = {
  bg: '#020203',
  rule: '#24242c',
  // Near-black, and barely graded. Two earlier attempts failed the same way,
  // in opposite directions: the first lit the ground to almost the page's own
  // value, and the second nudged the page up a few points and left both sides
  // still sitting in the bottom tenth of the range.
  //
  // The arithmetic is the thing. Contrast ratios use a +0.05 offset, so down
  // in near-black a change of several hex points is almost no perceptual step
  // at all: #1b1b24 on #040406 is a ratio of about 1.4:1, which is why the
  // book kept reading as a slightly different patch of dark rather than as an
  // object. Separation at this end has to be bought with a big move, not a
  // careful one.
  ground: 'radial-gradient(130% 100% at 50% 30%, #0a0a10 0%, #050508 55%, #020203 100%)',
  /* The cyan bleed around the book's edges.
   *
   * Tower light, not a UI effect: the same #7fefef the site uses for its
   * accent, thrown onto the desk by the object sitting on it. Three stops
   * rather than one, because a single blur has a visible edge where it ends
   * and reads as a sticker glued behind the page. Stacked stops fall off the
   * way light actually does — tight and relatively bright at the rim, then a
   * wide, very faint field that never quite resolves into a boundary.
   *
   * The ceiling on all of this is 0.20 alpha. Past roughly that, the halo
   * starts competing with the plates for attention, and on a spread where the
   * illustration is itself cyan-lit the page edge begins to look like it is
   * part of the picture. It should be felt before it is noticed.
   */
  edgeGlow: [
    // A tight bright line hugging the paper edge, which is what makes it read
    // as the object being lit rather than as fog behind it.
    '0 0 3px rgba(127, 239, 239, 0.42)',
    '0 0 30px rgba(127, 239, 239, 0.30)',
    '0 0 90px rgba(127, 239, 239, 0.15)',
    '0 0 190px rgba(127, 239, 239, 0.075)',
  ],

};

// The page itself.
export const paper = {
  // The big move. #2f2f3c against a #020203 desk is about 2.2:1 — not a
  // dramatic number written down, but four times the step the page had before
  // and the point at which it stops being "dark grey on darker grey" and
  // starts being a lit sheet lying on a surface.
  //
  // Slightly blue-violet rather than neutral, so it separates by HUE as well
  // as value. The eye is far better at that discrimination than at telling two
  // near-blacks apart, and it keeps the page from reading as washed-out grey.
  //
  // Prose at #d6d6db still measures 8.4:1 on this, comfortably past the 4.5:1
  // body-text threshold.
  stock: '#2f2f3c',
  stockAlt: '#26262f',
  rule: '#454556',
  ruleSoft: '#3a3a48',
  // The crease down the middle of an open book. Drawn as a gradient on the
  // inner edge of each page rather than as a line, because a line reads as a
  // border between two panels and a gradient reads as paper bending.
  //
  // Deepened along with the page. On a near-black page the crease had nothing
  // to darken; on a #2f2f3c page it is the second strongest "this is a bound
  // object" signal after the shadow it throws.
  gutterShadow: 'rgba(0, 0, 0, 0.72)',
};

// ---- The turn ----------------------------------------------------------

export const turn = {
  ms: 520,
  ease: 'cubic-bezier(0.33, 0.02, 0.30, 1)',
  // Reduced motion does not get a shorter curl, it gets a different animation
  // entirely. See globals.css.
  reducedMs: 120,
};

// ---- Geometry ----------------------------------------------------------

export const geometry = {
  // A spread is two square pages. Square, not 3:2, and this is THE decision
  // that fixes Millbrook's white-space problem:
  //
  // Millbrook's page is square but its plates were generated 3:2. A landscape
  // image in a square box is WIDTH-limited — it fills the width and can only
  // ever reach two thirds of the height, leaving a third of the page empty
  // under it. Their own SpreadPage.js says so in a comment.
  //
  // Authoring square art against a square page means the picture fills the
  // page edge to edge with nothing left over and nothing cropped away. It also
  // happens to be the native output of every image model worth using.
  pageAspect: 1,
  spreadAspect: 2,

  // Past this the book stops being an object held at reading distance and
  // becomes a wall to scan.
  maxSpreadWidth: 1900,
  compactMaxWidth: 560,

  // Below this the spread splits: one leaf becomes two swipes, text then
  // picture. This is a JS breakpoint rather than a media query because
  // crossing it changes the NAVIGATION MODEL, not just the layout — and CSS
  // cannot express "this leaf is now two positions".
  breakpoint: 900,

  // Vertical space the spread does not get, so the book can be sized from the
  // viewport without its foot sliding under the bottom bar. Wide only; compact
  // derives its height from flex layout instead so there is no second number
  // to keep in agreement.
  // The total vertical space NOT available to the spread. The book's width is
  // derived from it as (100svh - chromeReserve) * 2, so this must be at least
  // readerPad.top + readerPad.bottom or the spread is sized taller than the
  // room it has and its foot slides under the bottom bar.
  //
  // 84 = 30 top + 46 bottom + 8 spare. Every pixel given back here is two
  // pixels of book width and a directly better fill number at short viewports,
  // which is the band where pages overflow — so the padding is kept to what
  // the measured bars actually need rather than to a comfortable guess.
  chromeReserve: 84,

  readerPad: {
    inline: 24, top: 30, bottom: 46,
    compactInline: 10, compactTop: 64, compactBottom: 52,
  },
};

// ---- Type --------------------------------------------------------------

export const face = {
  // Furniture — folios, counters, buttons, kickers. Orbitron is already the
  // site's display face; keeping it here is what makes the reader feel like
  // part of Climbers rather than a bolted-on library.
  display: "'Orbitron', 'Arial Narrow', sans-serif",
  // Prose. IBM Plex Serif, self-hosted by next/font. The fallback is not
  // decoration: if the variable is ever missing the page still sets, and
  // Georgia is close enough in metrics that fill does not move far.
  body: "var(--font-plex-serif), Georgia, 'Iowan Old Style', 'Times New Roman', serif",
};

export const type = {
  // Body copy is sized against the PAGE, not the viewport, via container
  // query units. The page is a container, so type and column scale together
  // and a spread looks identical at every book size.
  //
  // The clamp floor matters more than it looks: below roughly a 790px viewport
  // the floor binds, type stops shrinking with the page, and fill gets
  // strictly worse. That is the band where pages overflow.
  // The FLOOR is the number that matters, not the ceiling. Body copy is sized
  // in cqh against the page, so type and column normally scale together and
  // fill is scale-invariant. That holds only while the clamp is actually
  // tracking cqh: 2.02cqh of a 608px page (a 1280x720 laptop) is 12.3px, so a
  // 13px floor binds, the type stops shrinking while the column keeps
  // shrinking, and fill gets strictly worse exactly where there is least room.
  // 12px keeps it tracking down to about a 660px viewport.
  body: 'clamp(12px, 2.02cqh, 21px)',
  // 1.48, not 1.58, and this is a capacity decision as much as a typographic
  // one. At 1.58 a page held about 28 lines, which put the minimum honest
  // slicing of Prologue I at SIXTEEN spreads — sixteen illustrations — with
  // most pages still only 70% full, because four part breaks each waste the
  // tail of a page. 1.48 holds about 30, which is what lets the same prose sit
  // on thirteen genuinely full pages.
  //
  // 1.48 on a serif is an ordinary book setting rather than a squeeze. Light
  // text on a dark ground does want a little more air than ink on paper, which
  // is why this is not tighter still.
  bodyLine: 1.42,

  // Compact needs its own pair, and the reason is arithmetic rather than
  // taste. A 390x844 phone gives the page box about 370x730. At the wide
  // settings that is roughly 34 lines of 46 characters, which holds about 230
  // words once paragraph spacing is paid for — and the longest spreads run
  // 250-285. The clamp FLOOR is what binds here, so the type has already
  // stopped shrinking with the page: only the leading is left to give.
  //
  // 1.46 and a 12px floor buy back the ~20 words that were overflowing. The
  // scrolling flow stays as the safety net for a genuinely tiny screen, but it
  // should be a safety net and not the normal experience.
  bodyCompact: 'clamp(11.5px, 1.82cqh, 17px)',
  bodyLineCompact: 1.35,
  // 37em holds about 64 characters at every page size, because the measure is
  // capped in em rather than px.
  measure: '37em',
  heading: 'clamp(15px, 2.5cqh, 26px)',
  folio: 'clamp(8px, 1.15cqh, 11px)',
  kicker: 'clamp(8px, 1.1cqh, 10.5px)',
};

export const pageInset = {
  top: { wide: '30px', compact: '22px' },
};

// ---- Texture -----------------------------------------------------------

// Fine static grain via feTurbulence, tiled as a background image at very low
// opacity. No texture file, no network request, no visible seam.
//
// Static, never animated: an animated grain is the difference between a page
// that reads as a surface and one that reads as a screensaver.
//
// %23 rather than # because a raw # terminates a data URI.
const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">
     <filter id="g">
       <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
       <feColorMatrix type="saturate" values="0"/>
     </filter>
     <rect width="180" height="180" filter="url(%23g)" opacity="0.035"/>
   </svg>`.replace(/\s+/g, ' '),
)}")`;

export const grainStyle = {
  backgroundImage: GRAIN,
  backgroundRepeat: 'repeat',
  backgroundSize: '180px 180px',
};

export const space = (n) => `${n * 4}px`;

// ---- Arcs --------------------------------------------------------------

/**
 * An arc is a group of volumes that share a shelf page and a reading order.
 *
 * `standalone: true` means the arc has no shelf of its own — its volumes are
 * reached directly from the home page and a reader who finishes one is offered
 * the home page rather than a next volume. That is what Tales are.
 */
export const ARCS = [
  {
    id: 'the-climb',
    title: 'The Climb',
    kicker: 'Arc One',
    blurb:
      'Four prologues from the years before the Registration. An Architect who '
      + 'built a god and climbed to unmake it, and the ripples that followed him down.',
    standalone: false,
  },
  {
    id: 'tales',
    title: 'Tales From Haven City',
    kicker: 'Short Fiction',
    blurb:
      'Single sittings from the streets under the Tower. No climb, no oath — '
      + 'just the people living in the shadow of both.',
    standalone: true,
  },
];

export const arcMeta = (id) => ARCS.find((a) => a.id === id) || null;
