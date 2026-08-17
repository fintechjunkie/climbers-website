'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PlatePlaceholder } from './Plate';
import { color, face, paper, space } from '@/lib/series';

/**
 * One volume on a shelf.
 *
 * `status` gates interactivity rather than presence: a planned volume renders
 * as a dead tile reading "Not yet written", so an arc can show its full shape
 * from the first day without a half-built chapter being clickable.
 */
export function Tile({ volume, href }) {
  const live = volume.status !== 'planned';
  const [failed, setFailed] = useState(false);
  const cover = volume.spreads?.find((s) => s.kind === 'opener')?.image?.slug;
  const [hover, setHover] = useState(false);

  const inner = (
    <>
      <div style={{
        width: '100%', aspectRatio: '1 / 1', overflow: 'hidden',
        border: `1px solid ${paper.ruleSoft}`, background: paper.stockAlt,
      }}>
        {live && cover && !failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/plates/${cover}.jpg`}
            alt=""
            onError={() => setFailed(true)}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              transition: 'transform 400ms', transform: hover ? 'scale(1.04)' : 'none',
            }}
          />
        ) : (
          <PlatePlaceholder
            slug={live ? cover : null}
            shotType={live ? 'Cover plate' : 'Not yet written'}
          />
        )}
      </div>

      <div style={{
        fontFamily: face.display, fontSize: 9.5, letterSpacing: '0.28em',
        textTransform: 'uppercase', color: live ? color.goldSoft : color.inkFaint,
      }}>
        {volume.part}
      </div>

      <div style={{
        fontFamily: face.display, fontSize: 19, lineHeight: 1.2, letterSpacing: '0.03em',
        color: live ? color.gold : color.inkFaint,
      }}>
        {volume.title}
      </div>

      {volume.epigraph && live ? (
        <div style={{
          fontFamily: face.body, fontStyle: 'italic', fontSize: 13.5, lineHeight: 1.5,
          color: color.inkSoft, flex: 1,
        }}>
          {volume.epigraph}
        </div>
      ) : <div style={{ flex: 1 }} />}

      <div style={{
        paddingTop: space(3), borderTop: `1px solid ${paper.ruleSoft}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        fontFamily: face.display, fontSize: 9.5, letterSpacing: '0.16em',
      }}>
        {live ? (
          <>
            <span style={{ color: color.cyan }}>READ →</span>
            <span style={{ color: color.inkFaint }}>{volume.spreadCount} SPREADS</span>
          </>
        ) : (
          <span style={{ color: color.inkFaint, letterSpacing: '0.24em' }}>SOON</span>
        )}
      </div>
    </>
  );

  const style = {
    display: 'flex', flexDirection: 'column', gap: space(3),
    padding: space(4),
    background: paper.stock,
    border: `1px solid ${paper.rule}`,
    borderTop: `3px solid ${live ? color.goldSoft : paper.rule}`,
    textDecoration: 'none',
    opacity: live ? 1 : 0.5,
    transition: 'transform 220ms, box-shadow 220ms, border-color 220ms',
    transform: hover && live ? 'translateY(-4px)' : 'none',
    boxShadow: hover && live ? '0 16px 40px rgba(0,0,0,0.6)' : '0 2px 6px rgba(0,0,0,0.3)',
    borderTopColor: hover && live ? color.gold : undefined,
  };

  if (!live) return <div style={style} aria-disabled="true">{inner}</div>;

  return (
    <Link
      href={href}
      className="cl-focus"
      style={style}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {inner}
    </Link>
  );
}

/** `auto-fill, minmax(...)` is the entire responsive story here. No breakpoints. */
export function Grid({ children }) {
  return (
    <section style={{
      display: 'grid', gap: space(5),
      gridTemplateColumns: 'repeat(auto-fill, minmax(258px, 1fr))',
    }}>
      {children}
    </section>
  );
}
