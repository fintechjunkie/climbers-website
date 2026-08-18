'use client';

import { Fragment } from 'react';
import Plate, { useBrokenImage } from './Plate';
import { color, face, geometry, grainStyle, pageInset, paper, reader, space, type } from '@/lib/series';

const PAGE_ATTR = { 'data-cl-page': '' };

/**
 * height: 100% is load-bearing rather than tidiness. Without it a page takes
 * only its content height and the ground shows through beneath it, which reads
 * as a two-tone panel rather than as one sheet.
 */
const PAGE = {
  position: 'relative',
  height: '100%',
  width: '100%',
  background: paper.stock,
  ...grainStyle,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

/* ============================================================
   Inline emphasis

   No markdown parser, at build time or runtime. Prose arrives as a plain
   string carrying at most two conventions, and this expands them:

     **text**  the site's existing cyan glow, for a beat that should ring
     *text*    ordinary italic

   Deliberately not a general markdown subset. Every construct the reader
   understands is a construct an author has to be able to predict, and two is
   the number that has earned its place.
   ============================================================ */
const EMPH = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

function inline(value) {
  if (!value || !value.includes('*')) return value;
  return value.split(EMPH).map((chunk, i) => {
    if (chunk.startsWith('**') && chunk.endsWith('**') && chunk.length > 4) {
      return (
        <span
          key={i}
          style={{ color: color.cyan, textShadow: '0 0 6px rgba(0,255,255,.35), 0 0 14px rgba(0,255,255,.12)' }}
        >
          {chunk.slice(2, -2)}
        </span>
      );
    }
    if (chunk.startsWith('*') && chunk.endsWith('*') && chunk.length > 2) {
      return <em key={i}>{chunk.slice(1, -1)}</em>;
    }
    return <Fragment key={i}>{chunk}</Fragment>;
  });
}

/* ============================================================
   Furniture
   ============================================================ */

function Folio({ n, align, onGround = false }) {
  return (
    <div
      aria-hidden="true"
      style={{
        flexShrink: 0,
        paddingTop: space(2),
        textAlign: align,
        fontFamily: face.display,
        fontSize: type.folio,
        letterSpacing: '0.24em',
        color: onGround ? color.inkFaint : color.inkSoft,
      }}
    >
      {String(n).padStart(2, '0')}
    </div>
  );
}

/* ============================================================
   The four page kinds
   ============================================================ */

/**
 * The prose half of a spread.
 *
 * The column is capped in em rather than px, so it holds about 64 characters
 * at every book size — the line gets physically longer on a big display, not
 * longer to read.
 */
export function TextPage({ spread, compact, typeScale = 1 }) {
  const blocks = spread.blocks || [];

  // The reader's scale MULTIPLIES the container-query clamp rather than
  // replacing it, so a preference and the responsive scale compose: the page
  // still sizes its type to itself, and the reader still gets bigger words.
  const base = compact ? type.bodyCompact : type.body;
  const size = typeScale === 1 ? base : `calc(${base} * ${typeScale})`;

  return (
    <div
      {...PAGE_ATTR}
      data-cl-kind="text"
      data-cl-spread={spread.n}
      className="cl-page"
      style={{
        ...PAGE,
        padding: compact
          ? `${pageInset.top.compact} ${space(5)} ${space(3)}`
          : `${pageInset.top.wide} ${space(9)} ${space(5)} ${space(10)}`,
      }}
    >
      <div
        className="cl-flow"
        style={{
          flex: 1,
          minHeight: 0,
          maxWidth: type.measure,
          width: '100%',
          margin: '0 auto',
          fontFamily: face.body,
          fontSize: size,
          lineHeight: compact ? type.bodyLineCompact : type.bodyLine,
          color: color.ink,
        }}
      >
        {blocks.map((b, i) => {
          if (b.t === 'h') {
            return (
              <h2
                key={i}
                style={{
                  margin: i === 0 ? `0 0 ${space(5)}` : `${space(7)} 0 ${space(4)}`,
                  fontFamily: face.display,
                  // A part break was set at type.kicker — the 10.5px ceiling
                  // used for folios and captions, roughly HALF the body size.
                  // It is not furniture, it is the loudest structural signal
                  // in the volume, and it was the quietest thing on the page.
                  // type.sectionHead sits a step above the prose instead.
                  fontSize: type.sectionHead,
                  fontWeight: 600,
                  // Tracking comes down as the size goes up. 0.24em is a
                  // legibility aid at 10px caps and a word-splitter at 20.
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase',
                  color: color.gold,
                }}
              >
                {b.v}
              </h2>
            );
          }
          if (b.t === 'i') {
            return (
              <p
                key={i}
                style={{
                  margin: `0 0 ${space(4)}`,
                  fontStyle: 'italic',
                  color: color.inkSoft,
                  borderLeft: `1px solid ${color.goldSoft}`,
                  paddingLeft: space(4),
                }}
              >
                {inline(b.v)}
              </p>
            );
          }
          return (
            <p key={i} style={{ margin: `0 0 ${space(compact ? 2 : 3)}` }}>
              {inline(b.v)}
            </p>
          );
        })}
      </div>

      <Folio n={spread.n * 2 - 1} align="left" />
    </div>
  );
}

/**
 * The illustration half of a spread.
 *
 * Full bleed, and that is the whole point. The plate is square, the page is
 * square, so the art covers the page corner to corner with no margin of dead
 * ground anywhere — which is the specific thing that went wrong on Millbrook,
 * where 3:2 art on a square page could only ever reach two thirds of the
 * height.
 *
 * Because there is no bare page left to sit on, the caption and folio are
 * overlaid on a scrim rather than set beneath the picture. Italic serif, not
 * the letterspaced caps the rest of the furniture wears: an authored caption
 * is a phrase to be read, and uppercase letterspacing removes the word shapes
 * a reader uses to take in running text.
 */
/**
 * The illustration half of a spread.
 *
 * No caption. Millbrook set one under its plates because a 3:2 picture on a
 * square page left a third of the page empty and the caption had somewhere to
 * live; here the plate fills the page corner to corner, so a caption can only
 * be an overlay sitting on top of the picture. The spec still carries
 * `caption` — it is useful as alt text and as a note to whoever generates the
 * plate — it is simply not drawn.
 */
export function GraphicPage({ spread, compact }) {
  const g = spread.image || {};

  return (
    <div
      {...PAGE_ATTR}
      data-cl-kind="graphic"
      data-cl-spread={spread.n}
      className="cl-page"
      style={{
        ...PAGE,
        // Compact has no facing page for the picture to sit beside. The square
        // plate cannot fill a portrait phone page whatever the padding, so the
        // leftover has to be the reader's own ground rather than bare page:
        // 300px of empty page reads as something that failed to load, while
        // the same space in ground reads as the surround a framed picture is
        // resting on — which is exactly what a wide reader already sees.
        background: compact ? reader.bg : paper.stockAlt,
        backgroundImage: 'none',
        justifyContent: compact ? 'center' : 'flex-start',
      }}
    >
      <div style={{ position: 'relative', width: '100%', flexShrink: 0 }}>
        <Plate slug={g.slug} alt={g.alt} shotType={g.shotType} depicts={g.depicts} />

        {/* The folio stays. It is the one mark that says this is a page of a
            book rather than a picture, and at this size it costs the art
            nothing. Shadowed rather than scrimmed, so it stays legible over a
            bright plate without laying a band across the foot of every one. */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: space(4),
            bottom: space(3),
            fontFamily: face.display,
            fontSize: type.folio,
            letterSpacing: '0.24em',
            color: 'rgba(255,255,255,0.58)',
            textShadow: '0 1px 4px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.7)',
            pointerEvents: 'none',
          }}
        >
          {String(spread.n * 2).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

/**
 * The chapter opener: one composition across both halves of the leaf, with the
 * title set over it. Not counted in the spread counter — it is a threshold,
 * not a page of the story.
 */
export function OpenerSpread({ spread, side, compact }) {
  const t = spread.title || {};
  const g = spread.image || {};

  // The opener image spans the full spread, so each half shows its own half of
  // the picture by shifting a double-width copy. objectPosition, not a crop:
  // one file, two windows onto it.
  const half = side === 'left' ? 'left center' : 'right center';

  // Same pre-hydration 404 the shelf tiles hit: the error event fires before
  // React attaches a handler, so onError alone left the browser's broken-image
  // glyph sitting in the corner of an undrawn cover.
  const [imgRef, broken, markBroken] = useBrokenImage(g.slug);

  return (
    <div
      {...PAGE_ATTR}
      data-cl-kind="opener"
      className="cl-page"
      style={{
        ...PAGE,
        background: reader.bg,
        backgroundImage: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        padding: compact ? space(6) : space(8),
      }}
    >
      {g.slug && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={`/plates/${g.slug}.jpg`}
          alt=""
          aria-hidden="true"
          onError={markBroken}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: compact || !side ? 'center' : half,
            opacity: 0.42,
          }}
        />
      ) : null}

      {/* The scrim the title sits on.
       *
       * A cover plate is a picture chosen for being striking, which makes it
       * the worst possible background for small type: the epigraph was landing
       * on lit sky and corroded metal at once and simply could not be read.
       * Dimming the whole plate further would have cost the cover its impact,
       * so the darkness is spent only where the words are — a soft pool under
       * the type block that fades out well before the page edge, leaving the
       * picture's corners at full strength. */}
      {g.slug && !broken && side !== 'left' ? (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background:
              'radial-gradient(62% 50% at 50% 50%, rgba(2,2,3,0.90) 0%, '
              + 'rgba(2,2,3,0.78) 42%, rgba(2,2,3,0.42) 66%, rgba(2,2,3,0) 82%)',
          }}
        />
      ) : null}

      {/* Only the right half carries the type on a wide spread, so the title
          does not sit across the gutter where the crease would run through it. */}
      {side === 'left' ? null : (
        <div style={{ position: 'relative', textAlign: 'center', maxWidth: '34ch' }}>
          {t.series ? (
            <div style={{
              fontFamily: face.display, fontSize: type.kicker, letterSpacing: '0.34em',
              textTransform: 'uppercase', color: color.gold, marginBottom: space(4),
              textShadow: '0 1px 8px rgba(0,0,0,0.95)',
            }}>
              {t.series}
            </div>
          ) : null}
          <h1 style={{
            margin: 0,
            fontFamily: face.display, fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: '0.04em', color: color.gold,
            fontSize: 'clamp(26px, 5.2cqh, 54px)',
            textShadow: '0 0 24px rgba(201,168,76,.22), 0 2px 14px rgba(0,0,0,0.95)',
          }}>
            {t.title}
          </h1>
          {t.part ? (
            <div style={{
              marginTop: space(4), fontFamily: face.display, fontSize: type.kicker,
              letterSpacing: '0.28em', textTransform: 'uppercase', color: color.cyan,
              textShadow: '0 1px 8px rgba(0,0,0,0.95)',
            }}>
              {t.part}
            </div>
          ) : null}
          {t.byline ? (
            <div style={{
              marginTop: space(6), fontFamily: face.body, fontStyle: 'italic',
              fontSize: 'clamp(14px, 2.2cqh, 21px)', color: color.ink,
              textShadow: '0 1px 10px rgba(0,0,0,0.9)',
            }}>
              {t.byline}
            </div>
          ) : null}
          {t.epigraph ? (
            <div style={{
              marginTop: space(5), paddingTop: space(4),
              borderTop: `1px solid ${paper.rule}`,
              fontFamily: face.body, fontStyle: 'italic',
              // Was clamp(10.5px, 1.5cqh, 14px) in inkFaint, which is a value
              // chosen to recede on PAPER. Over a picture it did not recede,
              // it vanished.
              fontSize: 'clamp(12.5px, 1.9cqh, 17px)', lineHeight: 1.6,
              color: color.inkSoft,
              textShadow: '0 1px 10px rgba(0,0,0,0.9)',
            }}>
              {t.epigraph}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

/** The blank that faces the first page and backs the last one. */
export function BlankPage() {
  return (
    <div
      {...PAGE_ATTR}
      data-cl-kind="blank"
      className="cl-page"
      style={{ ...PAGE, background: paper.stockAlt }}
    />
  );
}
