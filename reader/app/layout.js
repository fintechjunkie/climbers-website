import { Orbitron } from 'next/font/google';
import './globals.css';

// Self-hosted at build time by next/font, so there is no runtime request to
// Google and no FOUT beyond display: swap. Prose uses a system serif stack
// (see face.body) and needs no loading at all.
const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-orbitron',
});

export const metadata = {
  title: 'Climbers',
  description: 'Haven City, the Tower, and the people who climb it.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#08080a',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={orbitron.variable}>
      <body>{children}</body>
    </html>
  );
}
