import { notFound } from 'next/navigation';
import FlipBook from '@/components/FlipBook';
import { loadVolume, nextVolume, slugsForArc } from '@/lib/data';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return slugsForArc('the-climb').map((vol) => ({ vol }));
}

export function generateMetadata({ params }) {
  const volume = loadVolume(params.vol);
  if (!volume || volume.arc !== 'the-climb') return {};
  return { title: `${volume.part}: ${volume.title} · The Climb · Climbers` };
}

/**
 * The ?spread= deep link is read on the CLIENT, inside FlipBook, rather than
 * from searchParams here. Touching searchParams in a page opts it out of
 * static rendering, and this is a static reading product: there is no reason
 * for the server to re-render fourteen spreads of fixed prose because a query
 * param changed.
 */
export default function ReadPage({ params }) {
  const volume = loadVolume(params.vol);
  if (!volume || volume.arc !== 'the-climb') notFound();
  return <FlipBook volume={volume} next={nextVolume(params.vol)} />;
}
