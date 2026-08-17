import Link from 'next/link';
import { Grid, Tile } from '@/components/Shelf';
import { arcMeta, readHref, volumesForArc } from '@/lib/data';
import { color, face, paper, reader, space } from '@/lib/series';

const ARC = 'the-climb';

export const metadata = {
  title: 'The Climb · Climbers',
  description: 'Three prologues from the years before the Registration.',
};

export default function ClimbShelf() {
  const arc = arcMeta(ARC);
  const volumes = volumesForArc(ARC);
  const written = volumes.filter((v) => v.status === 'live');

  return (
    <main style={{ minHeight: '100svh', background: reader.bg }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: `${space(8)} ${space(5)} ${space(20)}` }}>

        <Link
          href="/"
          className="cl-focus"
          style={{
            fontFamily: face.display, fontSize: 10, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: color.inkSoft, textDecoration: 'none',
          }}
        >
          ← Climbers
        </Link>

        <header style={{ margin: `${space(12)} 0 ${space(10)}` }}>
          <div style={{
            fontFamily: face.display, fontSize: 10, letterSpacing: '0.34em',
            textTransform: 'uppercase', color: color.goldSoft, marginBottom: space(4),
          }}>
            {arc.kicker}
          </div>
          <h1 style={{
            margin: 0, fontFamily: face.display, fontWeight: 700,
            fontSize: 'clamp(28px, 6vw, 54px)', letterSpacing: '0.1em',
            color: color.gold, textShadow: '0 0 26px rgba(201,168,76,.2)',
          }}>
            {arc.title}
          </h1>
          <p style={{
            margin: `${space(6)} 0 0`, maxWidth: '64ch',
            fontFamily: face.body, fontSize: 16, lineHeight: 1.68, color: color.inkSoft,
          }}>
            {arc.blurb}
          </p>

          <div style={{
            marginTop: space(6), paddingTop: space(4), borderTop: `1px solid ${paper.rule}`,
            display: 'flex', gap: space(8), flexWrap: 'wrap',
            fontFamily: face.display, fontSize: 9.5, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: color.inkFaint,
          }}>
            <span>{written.length} of {volumes.length} written</span>
            <span>{written.reduce((a, v) => a + v.spreadCount, 0)} spreads</span>
            <span>{written.reduce((a, v) => a + v.words, 0).toLocaleString()} words</span>
          </div>
        </header>

        <Grid>
          {volumes.map((v) => (
            <Tile key={v.slug} volume={v} href={v.status === 'live' ? readHref(v.slug) : '#'} />
          ))}
        </Grid>
      </div>
    </main>
  );
}
