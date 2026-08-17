/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /**
   * The homepage is the original static site, not a React page.
   *
   * public/index.html is served by Next at /index.html, but a file in public/
   * does not claim "/" — that path belongs to the app router, and with no
   * app/page.js it would 404. This rewrite hands "/" to the static file
   * without changing the URL.
   *
   * beforeFiles rather than the default afterFiles: it makes the mapping
   * explicit and independent of whether a future app/page.js gets added by
   * accident, which would otherwise silently take over the homepage.
   */
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/index.html' },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

module.exports = nextConfig;
