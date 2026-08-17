'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import Link from 'next/link';
import { BlankPage, GraphicPage, OpenerSpread, TextPage } from './SpreadPage';
import { color, face, geometry, paper, reader, space, turn, type } from '@/lib/series';

/* ============================================================
   The leaf model

   One leaf is one opening. The opener is a leaf and so is the end card: each
   occupies a turn, and neither is counted in the spread counter, because a
   threshold is not a page of the story.
   ============================================================ */

function buildLeaves(volume) {
  const out = [];
  const opener = volume.spreads.find((s) => s.kind === 'opener');
  if (opener) out.push({ kind: 'opener', spread: opener, key: 'opener' });
  for (const s of volume.spreads) {
    if (s.kind === 'spread') out.push({ kind: 'spread', spread: s, key: `s-${s.n}` });
  }
  out.push({ kind: 'end', key: 'end' });
  return out;
}

/**
 * How many swipes a leaf costs.
 *
 * Wide: always one — you see both pages at once. Compact: a story spread is
 * two, text then picture, because one page is all that fits. An opener and the
 * end card are one whole composition either way.
 */
const halvesFor = (leaf, wide) =>
  (wide || !leaf || leaf.kind !== 'spread' ? 1 : 2);

function nextPos(pos, dir, leaves, wide) {
  const cur = leaves[pos.idx];
  if (dir === 'fwd') {
    if (pos.half + 1 < halvesFor(cur, wide)) return { idx: pos.idx, half: pos.half + 1 };
    if (pos.idx + 1 >= leaves.length) return null;
    return { idx: pos.idx + 1, half: 0 };
  }
  if (pos.half > 0) return { idx: pos.idx, half: pos.half - 1 };
  if (pos.idx === 0) return null;
  return { idx: pos.idx - 1, half: halvesFor(leaves[pos.idx - 1], wide) - 1 };
}

/* ============================================================
   The turn state machine

   A reducer rather than a pile of useStates, because a turn is genuinely a
   state machine — idle, turning, turning-with-one-queued — and the invalid
   combinations (animating in two directions, a queue with no animation) should
   be unrepresentable rather than merely avoided.

   `seq` exists so a settle timer that fires late, after the reader has already
   jumped somewhere via the contents, cannot clear an animation it does not own.
   ============================================================ */

const initial = (idx = 0) => ({ pos: { idx, half: 0 }, anim: null, queue: null, seq: 0 });

function reducer(state, action) {
  switch (action.type) {
    case 'turn': {
      const { dir, leaves, wide, reduced } = action;
      // Already turning: remember at most one more press. Queuing a stack of
      // them makes a held arrow key feel like it is running away from you.
      if (state.anim) return state.queue ? state : { ...state, queue: dir };

      const to = nextPos(state.pos, dir, leaves, wide);
      if (!to) return state;

      const seq = state.seq + 1;
      if (reduced) return { pos: to, anim: null, queue: null, seq };
      return { pos: to, anim: { dir, from: state.pos, seq }, queue: null, seq };
    }

    case 'settle': {
      if (!state.anim || state.anim.seq !== action.seq) return state;
      const rest = { ...state, anim: null, queue: null };
      if (!state.queue) return rest;
      return reducer(rest, { type: 'turn', dir: state.queue, ...action });
    }

    case 'jump': {
      if (state.pos.idx === action.idx && state.pos.half === 0) return state;
      return { pos: { idx: action.idx, half: 0 }, anim: null, queue: null, seq: state.seq + 1 };
    }

    default:
      return state;
  }
}

/* ============================================================
   Chrome
   ============================================================ */

function Bar({ children, side, innerRef, hidden }) {
  return (
    <div
      ref={innerRef}
      className="cl-chrome"
      data-hidden={hidden ? 'true' : 'false'}
      style={{
        position: 'fixed',
        left: 0, right: 0, [side]: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: space(3),
        padding: `${space(2)} ${space(4)}`,
        background: side === 'top'
          ? 'linear-gradient(180deg, rgba(8,8,10,0.95) 0%, rgba(8,8,10,0) 100%)'
          : 'linear-gradient(0deg, rgba(8,8,10,0.95) 0%, rgba(8,8,10,0) 100%)',
        paddingTop: side === 'top' ? `max(${space(2)}, env(safe-area-inset-top))` : space(2),
        paddingBottom: side === 'bottom' ? `max(${space(2)}, env(safe-area-inset-bottom))` : space(2),
      }}
    >
      {children}
    </div>
  );
}

/**
 * The reader's controls.
 *
 * These were inkSoft on a transparent ground, which measured about 5.8:1 in
 * theory and was genuinely hard to read in practice: Orbitron at 10px with
 * 0.2em tracking is thin, widely spaced and uppercase, and small thin type
 * needs far more contrast than a ratio calculated on a solid block predicts.
 *
 * Full ink, a slightly larger size, a panel behind them and a brighter rule.
 * The controls of a reader should be quiet, but "quiet" cannot mean "you have
 * to hunt for the next-page arrow".
 */
const btn = {
  fontFamily: face.display,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: color.ink,
  background: 'rgba(28,28,36,0.92)',
  border: `1px solid ${paper.rule}`,
  borderRadius: 3,
  padding: `${space(2)} ${space(3)}`,
  cursor: 'pointer',
  transition: 'color 160ms, border-color 160ms, background 160ms',
};

// Disabled still has to be legible. It should read as "not available now",
// not as "smudge" — a reader at the last page should be able to see that the
// forward arrow exists and has stopped, rather than wonder where it went.
const btnDisabled = {
  ...btn,
  color: '#6f6f7a',
  background: 'rgba(20,20,26,0.7)',
  cursor: 'default',
};

/* ============================================================
   Reader type size

   Millbrook's reader lets a reader set their own size and this one did not,
   which is a real omission: the page is sized to the viewport, so someone on a
   large display reading at arm's length has no way to make the prose bigger.

   The scale MULTIPLIES the container-query clamp rather than replacing it, so
   type still tracks the page — a reader's preference and the responsive scale
   compose instead of fighting.
   ============================================================ */
const TYPE_STOPS = [0.85, 0.92, 1, 1.12, 1.26, 1.42];
const TYPE_KEY = 'climbers_type_scale';

function useTypeScale() {
  const [i, setI] = useState(TYPE_STOPS.indexOf(1));

  // Read on mount, not during render: localStorage does not exist on the
  // server, and reading it in the initial state would make the first client
  // render disagree with the prerendered HTML.
  useEffect(() => {
    // getItem returns null when nothing is stored, and Number(null) is 0 —
    // which is a VALID index here, the smallest stop. Coercing first therefore
    // started every first-time reader at the smallest type instead of the
    // default. Check for the absent key before converting.
    const raw = window.localStorage.getItem(TYPE_KEY);
    if (raw === null) return;
    const saved = Number(raw);
    if (Number.isInteger(saved) && TYPE_STOPS[saved] !== undefined) setI(saved);
  }, []);

  const set = useCallback((next) => {
    const clamped = Math.max(0, Math.min(TYPE_STOPS.length - 1, next));
    setI(clamped);
    try { window.localStorage.setItem(TYPE_KEY, String(clamped)); } catch (e) { /* private mode */ }
  }, []);

  return {
    scale: TYPE_STOPS[i],
    index: i,
    atMin: i === 0,
    atMax: i === TYPE_STOPS.length - 1,
    smaller: () => set(i - 1),
    bigger: () => set(i + 1),
  };
}

/**
 * The visible thickness of the paper still to come on each side.
 *
 * Capped at nine because past that the lines merge into a grey block and stop
 * reading as sheets — and because the cap is what keeps this O(1) on a long
 * volume.
 */
function EdgeStack({ side, count }) {
  const n = Math.min(count, 9);
  if (n <= 0) return null;
  return (
    <div
      aria-hidden="true"
      // Sitting OUTSIDE the book rather than inside it, and wider than before.
      // This is the most literal "you are holding a book" signal available —
      // the cut edge of the paper still to come — and at 1.6px a sheet it was
      // a hairline nobody read as anything. Now the stack is visibly a stack.
      style={{
        position: 'absolute',
        top: 10, bottom: 10,
        [side]: -(n * 2.4),
        width: n * 2.4,
        display: 'flex',
        flexDirection: side === 'right' ? 'row' : 'row-reverse',
        pointerEvents: 'none',
        zIndex: 1,
        borderRadius: side === 'right' ? '0 2px 2px 0' : '2px 0 0 2px',
        overflow: 'hidden',
        boxShadow: '0 10px 26px rgba(0,0,0,0.6)',
      }}
    >
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          style={{
            flex: 1,
            borderRight: side === 'right' ? '1px solid rgba(0,0,0,0.45)' : 'none',
            borderLeft: side === 'left' ? '1px solid rgba(0,0,0,0.45)' : 'none',
            background: i % 2 ? paper.stockAlt : paper.stock,
            // Falls away toward the outside of the stack, so the edge reads as
            // curving out of the light rather than as a flat striped bar.
            filter: `brightness(${1 - i * 0.075})`,
          }}
        />
      ))}
    </div>
  );
}

function Contents({ volume, leaves, current, onPick, onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Contents"
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(4,4,6,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: space(5),
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(560px, 100%)',
          maxHeight: '80svh',
          overflowY: 'auto',
          background: paper.stock,
          border: `1px solid ${paper.rule}`,
          padding: space(6),
        }}
      >
        <div style={{
          fontFamily: face.display, fontSize: 10, letterSpacing: '0.3em',
          textTransform: 'uppercase', color: color.goldSoft, marginBottom: space(5),
        }}>
          Contents
        </div>
        {leaves.map((l, i) => {
          if (l.kind === 'end') return null;
          const isOpener = l.kind === 'opener';
          const heading = isOpener
            ? 'Opening'
            : (l.spread.blocks || []).find((b) => b.t === 'h')?.v;
          return (
            <button
              key={l.key}
              className="cl-focus"
              onClick={() => onPick(i)}
              style={{
                display: 'flex', width: '100%', gap: space(4), alignItems: 'baseline',
                textAlign: 'left', background: 'none', cursor: 'pointer',
                border: 'none', borderTop: `1px solid ${paper.ruleSoft}`,
                padding: `${space(3)} 0`,
                color: i === current ? color.cyan : color.ink,
              }}
            >
              <span style={{
                fontFamily: face.display, fontSize: 10, letterSpacing: '0.18em',
                color: i === current ? color.cyan : color.inkFaint, minWidth: 26,
              }}>
                {isOpener ? '—' : String(l.spread.n).padStart(2, '0')}
              </span>
              <span style={{ fontFamily: face.body, fontSize: 15, lineHeight: 1.4 }}>
                {heading || (isOpener ? 'Opening' : `Spread ${l.spread.n}`)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EndCard({ volume, next }) {
  return (
    <div
      className="cl-page"
      style={{
        position: 'relative', height: '100%', width: '100%',
        background: paper.stock,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: space(5), padding: space(8), textAlign: 'center',
      }}
    >
      <div style={{
        fontFamily: face.display, fontSize: 10, letterSpacing: '0.3em',
        textTransform: 'uppercase', color: color.goldSoft,
      }}>
        End of {volume.part || volume.title}
      </div>
      {next ? (
        <>
          <div style={{ fontFamily: face.body, fontStyle: 'italic', fontSize: 16, color: color.inkSoft }}>
            Next
          </div>
          <Link
            href={next.href}
            className="cl-focus"
            style={{
              fontFamily: face.display, fontSize: 'clamp(16px, 3cqh, 26px)',
              letterSpacing: '0.05em', color: color.gold, textDecoration: 'none',
              borderBottom: `1px solid ${color.goldSoft}`, paddingBottom: 4,
            }}
          >
            {next.title} →
          </Link>
        </>
      ) : null}
      <Link
        href={volume.shelfHref || '/'}
        className="cl-focus"
        style={{ ...btn, textDecoration: 'none', marginTop: space(4) }}
      >
        {volume.shelfLabel || 'Back'}
      </Link>
    </div>
  );
}

/* ============================================================
   The reader
   ============================================================ */

export default function FlipBook({ volume, next = null }) {
  const leaves = useMemo(() => buildLeaves(volume), [volume]);

  const [state, dispatch] = useReducer(reducer, undefined, () => initial(0));
  const { pos, anim } = state;

  const [wide, setWide] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [contents, setContents] = useState(false);
  const [chromeHidden, setChromeHidden] = useState(false);
  const [bars, setBars] = useState({ top: 0, bottom: 0 });
  const typeSize = useTypeScale();

  const topBarRef = useRef(null);
  const botBarRef = useRef(null);
  const touch = useRef(null);

  /**
   * A JS breakpoint rather than a media query, and deliberately so.
   *
   * Crossing this line changes the OBJECT — a leaf becomes two swipes instead
   * of one — which is navigation state, not something CSS can express.
   * Everything merely visual is done in CSS against the page container.
   */
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${geometry.breakpoint}px)`);
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const go = useCallback((dir) => {
    dispatch({ type: 'turn', dir, leaves, wide, reduced });
  }, [leaves, wide, reduced]);

  // Clear the animation once the sheet has landed. The timer carries the seq
  // it was started for, so a jump that lands mid-turn cannot be undone by a
  // stale settle.
  useEffect(() => {
    if (!anim) return undefined;
    const id = setTimeout(
      () => dispatch({ type: 'settle', seq: anim.seq, leaves, wide, reduced }),
      reduced ? turn.reducedMs : turn.ms,
    );
    return () => clearTimeout(id);
  }, [anim, leaves, wide, reduced]);

  // Deep link, read on the client so the route can stay static.
  useEffect(() => {
    const n = Number(new URLSearchParams(window.location.search).get('spread'));
    if (!n) return;
    const i = leaves.findIndex((l) => l.kind === 'spread' && l.spread.n === n);
    if (i > 0) dispatch({ type: 'jump', idx: i });
  }, [leaves]);

  // Keyboard.
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') { setContents(false); return; }
      if (contents) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault(); go('fwd');
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault(); go('back');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, contents]);

  // Chrome auto-hide: three seconds of nothing, then out of the way.
  useEffect(() => {
    let id;
    const wake = () => {
      setChromeHidden(false);
      clearTimeout(id);
      id = setTimeout(() => setChromeHidden(true), 4500);
    };
    wake();
    const evs = ['pointermove', 'keydown', 'touchstart', 'pointerdown'];
    evs.forEach((e) => window.addEventListener(e, wake, { passive: true }));
    return () => {
      clearTimeout(id);
      evs.forEach((e) => window.removeEventListener(e, wake));
    };
  }, []);

  /**
   * Measure the chrome bars rather than assuming their height.
   *
   * Neither bar has a height this file controls: both wrap on a narrow phone,
   * and the bottom one grows when the end of the volume swaps the forward
   * arrow for a "next part" link. A constant was tried and put the foot of the
   * last page under the bar.
   */
  const atStart = pos.idx === 0 && pos.half === 0;
  const atEnd = pos.idx === leaves.length - 1;

  useEffect(() => {
    const read = () => setBars({
      top: topBarRef.current?.offsetHeight ?? 0,
      bottom: botBarRef.current?.offsetHeight ?? 0,
    });
    read();
    const ro = new ResizeObserver(read);
    [topBarRef.current, botBarRef.current].filter(Boolean).forEach((el) => ro.observe(el));
    window.addEventListener('resize', read);
    return () => { ro.disconnect(); window.removeEventListener('resize', read); };
  }, [wide, atEnd, next]);

  // Swipe.
  const onTouchStart = (e) => {
    const t = e.changedTouches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;
    // Horizontal intent only: a diagonal drag while scrolling a long page
    // should not turn the leaf out from under the reader.
    if (Math.abs(dx) < 46 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
    go(dx < 0 ? 'fwd' : 'back');
  };

  /* ---- rendering ------------------------------------------------------ */

  const leaf = leaves[pos.idx];

  const renderLeft = (l) => {
    if (!l) return <BlankPage />;
    if (l.kind === 'opener') return <OpenerSpread spread={l.spread} side="left" />;
    if (l.kind === 'end') return <BlankPage />;
    return <TextPage spread={l.spread} compact={false} typeScale={typeSize.scale} />;
  };
  const renderRight = (l) => {
    if (!l) return <BlankPage />;
    if (l.kind === 'opener') return <OpenerSpread spread={l.spread} side="right" />;
    if (l.kind === 'end') return <EndCard volume={volume} next={next} />;
    return <GraphicPage spread={l.spread} compact={false} />;
  };
  const renderHalf = (p) => {
    const l = leaves[p.idx];
    if (!l) return <BlankPage />;
    if (l.kind === 'opener') return <OpenerSpread spread={l.spread} side={null} compact />;
    if (l.kind === 'end') return <EndCard volume={volume} next={next} />;
    return p.half === 0
      ? <TextPage spread={l.spread} compact typeScale={typeSize.scale} />
      : <GraphicPage spread={l.spread} compact />;
  };

  /**
   * Which leaf each half of the base layer shows during a turn.
   *
   * The half the sheet is NOT covering keeps the page you are leaving until
   * the sheet lands. Forward: the right page lifts, so the LEFT half must hold
   * the old left page. Back: the left page lifts, so the RIGHT half holds the
   * old right page.
   *
   * Getting this wrong is the whole difference between paper and a slideshow —
   * the destination appears before the sheet has flipped onto it.
   */
  const fromLeaf = anim ? leaves[anim.from.idx] : null;
  const baseLeftLeaf = anim && anim.dir === 'fwd' ? fromLeaf : leaf;
  const baseRightLeaf = anim && anim.dir === 'back' ? fromLeaf : leaf;

  const half = { position: 'absolute', top: 0, width: '50%', height: '100%' };

  const shade = (
    <div
      className="cl-shade"
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
        background: 'rgba(0,0,0,1)',
        animation: `cl-turn-shade ${turn.ms}ms ${turn.ease} forwards`,
      }}
    />
  );

  const gutter = (side) => (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', top: 0, bottom: 0, [side]: 0, width: 34,
        pointerEvents: 'none', zIndex: 2,
        background: `linear-gradient(${side === 'right' ? '90deg' : '270deg'}, rgba(0,0,0,0) 0%, ${paper.gutterShadow} 100%)`,
      }}
    />
  );

  // The book's size, entirely in CSS. Three constraints, whichever binds
  // first: the cap, the viewport width, and the viewport height less the room
  // the chrome needs.
  //
  // svh, not vh and not dvh. 100vh on iOS is the viewport with the URL bar
  // RETRACTED, so a fixed-height reader sized from it puts its own foot behind
  // the bar. dvh tracks the bar as it moves and resizes the book mid-scroll.
  const bookWidth = wide
    ? `min(${geometry.maxSpreadWidth}px, calc(100vw - ${geometry.readerPad.inline * 2}px), calc((100svh - ${geometry.chromeReserve}px) * ${geometry.spreadAspect}))`
    : `min(${geometry.compactMaxWidth}px, calc(100vw - ${geometry.readerPad.compactInline * 2}px))`;

  const spreadNo = leaf?.kind === 'spread' ? String(leaf.spread.n).padStart(2, '0') : null;

  return (
    <main
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        minHeight: '100svh',
        background: reader.bg,
        backgroundImage: reader.ground,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: wide ? geometry.readerPad.top : Math.max(bars.top, geometry.readerPad.compactTop),
        paddingBottom: wide ? geometry.readerPad.bottom : Math.max(bars.bottom, geometry.readerPad.compactBottom),
        overflow: 'hidden',
      }}
    >
      {/* Chrome lives OUTSIDE the perspective container on purpose. A 3D
          transform establishes a containing block for every fixed descendant,
          so a bar nested inside the book would scroll with the pages instead
          of staying put. */}
      <Bar side="top" innerRef={topBarRef} hidden={chromeHidden}>
        <Link href={volume.shelfHref || '/'} className="cl-focus" style={{ ...btn, textDecoration: 'none' }}>
          ← {volume.shelfLabel || 'Back'}
        </Link>
        <span style={{
          fontFamily: face.display, fontSize: 10, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: color.gold, textAlign: 'right',
        }}>
          {volume.title}
        </span>
      </Bar>

      <div
        style={{
          position: 'relative',
          width: bookWidth,
          // Wide is a fixed 2:1 spread. Compact deliberately is NOT square,
          // and this is the bug that squaring it produces: a square page on a
          // 390x844 phone is 370px tall, and 250 words of prose do not go into
          // 370px at a readable size — the column just scrolls, which is not
          // reading a page, it is reading a window.
          //
          // So compact takes the height it has. The text page fills that
          // portrait box properly, and the graphic page centres its square
          // plate inside it against the reader's ground, which is what
          // GraphicPage's compact branch is for.
          ...(wide
            ? { aspectRatio: `${geometry.spreadAspect} / 1` }
            : { height: `calc(100svh - ${geometry.readerPad.compactTop + geometry.readerPad.compactBottom}px)` }),
          perspective: '2400px',
          // A rim and a cast shadow, which together are what make this read as
          // a physical object rather than a region of the page. The hairline
          // is the lit top edge of the paper stack; the shadow is what it
          // throws on the desk.
          boxShadow: [
            // The lit top edge of the sheet.
            '0 0 0 1px rgba(255,255,255,0.13)',
            '0 1px 0 rgba(255,255,255,0.10) inset',
            // Contact shadow, then the soft body of it. Two shadows rather than
            // one: a single large blur reads as a glow, and it is the tight
            // dark line right under an object that tells you it is resting on
            // something.
            '0 4px 10px rgba(0,0,0,0.9)',
            '0 34px 70px rgba(0,0,0,0.85)',
            '0 80px 150px rgba(0,0,0,0.6)',
          ].join(', '),
        }}
        aria-live="polite"
      >
        <span className="cl-sr">
          {leaf?.kind === 'spread'
            ? `Spread ${leaf.spread.n} of ${volume.spreadCount}`
            : leaf?.kind === 'end' ? 'End of volume' : 'Opening'}
        </span>

        {wide ? (
          <>
            <div style={{ ...half, left: 0 }}>
              {renderLeft(baseLeftLeaf)}
              {gutter('right')}
              {anim && anim.dir === 'back' ? shade : null}
            </div>
            <div style={{ ...half, right: 0 }}>
              {renderRight(baseRightLeaf)}
              {gutter('left')}
              {anim && anim.dir === 'fwd' ? shade : null}
            </div>
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0 }}>
            {renderHalf(pos)}
          </div>
        )}

        {/* The lifting sheet. backfaceVisibility hidden is what makes the turn
            read correctly: as the sheet passes 90 degrees its face disappears
            and the destination page, already sitting underneath, is revealed. */}
        {anim ? (
          <div
            className="cl-sheet"
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              height: '100%',
              width: wide ? '50%' : '100%',
              ...(anim.dir === 'fwd'
                ? { right: 0, transformOrigin: 'left center' }
                : { left: 0, transformOrigin: 'right center' }),
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              zIndex: 5,
              animation: `${
                wide
                  ? (anim.dir === 'fwd' ? 'cl-turn-fwd' : 'cl-turn-back')
                  : (anim.dir === 'fwd' ? 'cl-turn-fwd-single' : 'cl-turn-back-single')
              } ${turn.ms}ms ${turn.ease} forwards`,
            }}
          >
            {wide
              ? (anim.dir === 'fwd' ? renderRight(fromLeaf) : renderLeft(fromLeaf))
              : renderHalf(anim.from)}
            <div
              className="cl-self"
              style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: anim.dir === 'fwd'
                  ? 'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 62%)'
                  : 'linear-gradient(270deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 62%)',
                animation: `cl-turn-self ${turn.ms}ms ${turn.ease} forwards`,
              }}
            />
          </div>
        ) : null}

        <EdgeStack side="right" count={leaves.length - 1 - pos.idx} />
        <EdgeStack side="left" count={pos.idx} />

        {/* Click-to-turn. Narrow strips at the outer edges only, so a click
            anywhere near the prose does not turn the page while someone is
            selecting a line. */}
        <button
          aria-label="Previous page"
          onClick={() => go('back')}
          disabled={atStart}
          className="cl-focus"
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: '12%',
            background: 'transparent', border: 'none', zIndex: 6,
            cursor: atStart ? 'default' : 'w-resize',
          }}
        />
        <button
          aria-label="Next page"
          onClick={() => go('fwd')}
          disabled={atEnd}
          className="cl-focus"
          style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: '12%',
            background: 'transparent', border: 'none', zIndex: 6,
            cursor: atEnd ? 'default' : 'e-resize',
          }}
        />
      </div>

      <Bar side="bottom" innerRef={botBarRef} hidden={chromeHidden}>
        <span style={{ display: 'flex', gap: space(2), alignItems: 'center' }}>
          <button className="cl-focus" style={btn} onClick={() => setContents(true)}>
            Contents
          </button>

          {/* Type size. Two buttons rather than a popover: the whole control is
              visible at a glance and needs no second interaction to discover. */}
          <span
            style={{
              display: 'flex', alignItems: 'stretch',
              border: `1px solid ${paper.rule}`, borderRadius: 3, overflow: 'hidden',
              background: 'rgba(28,28,36,0.92)',
            }}
          >
            <button
              className="cl-focus"
              aria-label="Smaller text"
              onClick={typeSize.smaller}
              disabled={typeSize.atMin}
              style={{
                ...(typeSize.atMin ? btnDisabled : btn),
                border: 'none', borderRadius: 0, background: 'transparent',
                fontSize: 11, padding: `${space(2)} ${space(3)}`,
              }}
            >
              A&minus;
            </button>
            <span aria-hidden="true" style={{ width: 1, background: paper.rule }} />
            <button
              className="cl-focus"
              aria-label="Larger text"
              onClick={typeSize.bigger}
              disabled={typeSize.atMax}
              style={{
                ...(typeSize.atMax ? btnDisabled : btn),
                border: 'none', borderRadius: 0, background: 'transparent',
                fontSize: 14, padding: `${space(2)} ${space(3)}`,
              }}
            >
              A+
            </button>
          </span>
        </span>

        <span style={{
          fontFamily: face.display, fontSize: 11, fontWeight: 600,
          letterSpacing: '0.18em', color: color.ink,
        }}>
          {spreadNo ? `${spreadNo} / ${String(volume.spreadCount).padStart(2, '0')}` : '—'}
        </span>

        <span style={{ display: 'flex', gap: space(2) }}>
          <button
            className="cl-focus"
            aria-label="Previous page"
            style={atStart ? btnDisabled : btn}
            onClick={() => go('back')}
            disabled={atStart}
          >
            &larr;
          </button>
          <button
            className="cl-focus"
            aria-label="Next page"
            style={atEnd ? btnDisabled : btn}
            onClick={() => go('fwd')}
            disabled={atEnd}
          >
            &rarr;
          </button>
        </span>
      </Bar>

      {contents ? (
        <Contents
          volume={volume}
          leaves={leaves}
          current={pos.idx}
          onPick={(i) => { dispatch({ type: 'jump', idx: i }); setContents(false); }}
          onClose={() => setContents(false)}
        />
      ) : null}
    </main>
  );
}
