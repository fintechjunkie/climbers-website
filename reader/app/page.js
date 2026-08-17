import Link from 'next/link';
import { Grid, Tile } from '@/components/Shelf';
import { ARCS, readHref, volumesForArc } from '@/lib/data';
import { color, face, paper, reader, space } from '@/lib/series';

export const metadata = {
  title: 'Climbers',
  description: 'Haven City, the Tower, and the people who climb it.',
};

export default function Home() {
  return (
    <main style={{ minHeight: '100svh', background: reader.bg }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: `${space(16)} ${space(5)} ${space(20)}` }}>

        <header style={{ marginBottom: space(16), textAlign: 'center' }}>
          <h1 style={{
            margin: 0, fontFamily: face.display, fontWeight: 700,
            fontSize: 'clamp(30px, 7vw, 62px)', letterSpacing: '0.16em',
            color: color.gold, textShadow: '0 0 30px rgba(201,168,76,.25)',
          }}>
            CLIMBERS
          </h1>
          <p style={{
            margin: `${space(5)} auto 0`, maxWidth: '52ch',
            fontFamily: face.body, fontStyle: 'italic',
            fontSize: 16, lineHeight: 1.6, color: color.inkSoft,
          }}>
            Climb the Tower. Reach the peak. Ask one question. Receive one answer.
          </p>
        </header>

        {ARCS.map((arc) => {
          const volumes = volumesForArc(arc.id);
          if (!volumes.length) return null;

          return (
            <section key={arc.id} style={{ marginBottom: space(18) }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                flexWrap: 'wrap', gap: space(3),
                borderBottom: `1px solid ${paper.rule}`,
                paddingBottom: space(3), marginBottom: space(6),
              }}>
                <div>
                  <div style={{
                    fontFamily: face.display, fontSize: 9.5, letterSpacing: '0.3em',
                    textTransform: 'uppercase', color: color.goldSoft, marginBottom: space(2),
                  }}>
                    {arc.kicker}
                  </div>
                  <h2 style={{
                    margin: 0, fontFamily: face.display, fontSize: 'clamp(20px, 3.4vw, 30px)',
                    letterSpacing: '0.08em', color: color.ink,
                  }}>
                    {arc.title}
                  </h2>
                </div>

                {/* An arc with a shelf of its own gets a link to it. Tales do
                    not have one: their volumes are single sittings reached
                    directly, and a shelf holding two tiles that the home page
                    already shows would be a page that says nothing new. */}
                {!arc.standalone ? (
                  <Link
                    href={`/${arc.id === 'the-climb' ? 'climb' : arc.id}`}
                    className="cl-focus"
                    style={{
                      fontFamily: face.display, fontSize: 10, letterSpacing: '0.2em',
                      textTransform: 'uppercase', color: color.cyan, textDecoration: 'none',
                    }}
                  >
                    Enter the arc →
                  </Link>
                ) : null}
              </div>

              <p style={{
                margin: `0 0 ${space(6)}`, maxWidth: '68ch',
                fontFamily: face.body, fontSize: 15, lineHeight: 1.65, color: color.inkSoft,
              }}>
                {arc.blurb}
              </p>

              <Grid>
                {volumes.map((v) => (
                  <Tile key={v.slug} volume={v} href={v.status === 'live' ? readHref(v.slug) : '#'} />
                ))}
              </Grid>
            </section>
          );
        })}
      </div>
    </main>
  );
}
