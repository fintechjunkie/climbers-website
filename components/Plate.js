'use client';

import { useEffect, useRef, useState } from 'react';
import { color, face, paper, reader, space } from '@/lib/series';

/**
 * Detect an image that failed to load, including the case onError cannot see.
 *
 * A server-rendered <img> whose file is missing fires its error event during
 * the browser's own parse, BEFORE React hydrates and attaches any listener, so
 * onError never runs and the browser's broken-image glyph stays on screen
 * forever. A decoded image always reports `complete` with a non-zero
 * naturalWidth, so one check on mount catches whatever the event missed.
 *
 * Both paths are kept: the ref covers the pre-hydration failure and the
 * handler covers a later one.
 */
function useBrokenImage(src) {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, [src]);

  return [ref, failed, () => setFailed(true)];
}

/**
 * The placeholder that stands in for art that has not been made yet.
 *
 * This is a working tool, not an apology. It prints the slug and the shot type,
 * so the reader doubles as the production checklist: page through the volume
 * and every panel that still shows a frame is a panel that still needs an
 * image, named in the exact string the file has to be saved as.
 */
export function PlatePlaceholder({ slug, shotType, depicts }) {
  return (
    <div
      role="img"
      aria-label={depicts ? `Illustration pending: ${depicts}` : 'Illustration pending'}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        // Page values, not ground values. A placeholder that fades to the
        // desk colour reads as a hole cut in the book — which is exactly what
        // it looked like once the page was lifted away from the ground.
        background: `radial-gradient(120% 100% at 50% 8%, ${paper.stock} 0%, ${paper.stockAlt} 100%)`,
        border: `1px solid ${paper.rule}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space(3),
        padding: space(6),
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Corner ticks: the registration marks on an unexposed plate. */}
      {[['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].map(([v, h]) => (
        <span
          key={`${v}${h}`}
          aria-hidden="true"
          style={{
            position: 'absolute', [v]: 10, [h]: 10, width: 14, height: 14,
            [`border${v[0].toUpperCase()}${v.slice(1)}`]: `1px solid ${color.goldSoft}`,
            [`border${h[0].toUpperCase()}${h.slice(1)}`]: `1px solid ${color.goldSoft}`,
          }}
        />
      ))}

      <span
        style={{
          fontFamily: face.display, fontSize: 9, letterSpacing: '0.28em',
          color: color.goldSoft, textTransform: 'uppercase',
        }}
      >
        Plate Pending
      </span>
      <span
        style={{
          fontFamily: face.display, fontSize: 13, letterSpacing: '0.1em', color: color.gold,
        }}
      >
        {slug || 'unassigned'}
      </span>
      {shotType ? (
        <span
          style={{
            fontFamily: face.body, fontStyle: 'italic', fontSize: 12.5,
            lineHeight: 1.5, color: color.inkSoft, maxWidth: '28ch',
          }}
        >
          {shotType}
        </span>
      ) : null}
    </div>
  );
}

/**
 * One illustration, filling its page.
 *
 * Square by contract. `objectFit: 'cover'` on a square box holding square art
 * is a no-op crop — it fills the page exactly — but it is what keeps a plate
 * that came back slightly off-ratio from letterboxing onto bare ground, which
 * is the failure this whole geometry exists to prevent.
 *
 * Art lives in one flat directory under one extension, both hardcoded here.
 * That is a decision rather than an oversight: naming it means a future format
 * change is one edit in one file.
 */
export default function Plate({ slug, alt, shotType, depicts }) {
  const src = slug ? `/plates/${slug}.jpg` : '';
  const [ref, failed, markFailed] = useBrokenImage(src);

  if (!slug || failed) {
    return <PlatePlaceholder slug={slug} shotType={shotType} depicts={depicts} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt || depicts || ''}
      onError={markFailed}
      style={{
        display: 'block',
        width: '100%',
        aspectRatio: '1 / 1',
        objectFit: 'cover',
        background: paper.stockAlt,
      }}
    />
  );
}
