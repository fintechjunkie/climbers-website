import { notFound } from 'next/navigation';
import FlipBook from '@/components/FlipBook';
import { loadVolume, slugsForArc } from '@/lib/data';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return slugsForArc('tales').map((vol) => ({ vol }));
}

export function generateMetadata({ params }) {
  const volume = loadVolume(params.vol);
  if (!volume || volume.arc !== 'tales') return {};
  return { title: `${volume.title} · Tales From Haven City · Climbers` };
}

/**
 * A near-copy of the arc route rather than one dynamic /[arc]/[vol]/read.
 *
 * A catch-all arc segment would sit at the site root and swallow every unknown
 * top-level path, colliding with the static arc pages. Two thin files that
 * name their arc explicitly stay cheaper to reason about than one clever one.
 *
 * No `next` is passed: Tales are standalone single sittings, so finishing one
 * offers the shelf rather than marching a reader into an unrelated story.
 */
export default function ReadPage({ params }) {
  const volume = loadVolume(params.vol);
  if (!volume || volume.arc !== 'tales') notFound();
  return <FlipBook volume={volume} />;
}
