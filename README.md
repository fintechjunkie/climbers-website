# Climbers

Haven City, the Tower, and the people who climb it.

One Next.js app, deployed on Vercel from the repo root. It serves two things
that used to be separate products:

- **The original site** — hero, gallery, Oath Lord registry, Malachus Archive,
  Seraph, Questron, and the admin panel. Plain HTML/CSS/JS, no build step, now
  living in `public/` because that is what Next serves static files from.
- **The flipbook reader** — a React reader for The Climb and Tales From Haven
  City, with no runtime dependencies beyond next/react. The page curl is CSS
  keyframes and a reducer, not a library.

```
app/          reader routes: /climb/[vol]/read, /tales/[vol]/read, /climb
components/   FlipBook, SpreadPage, Plate, Shelf
lib/          series.js (design constants), data.js (volume registry)
content/      specs/*.md  ->  volumes/*.json
scripts/      parse-specs, build-images, check-fill
public/       THE ORIGINAL SITE + all static assets
worker/       Cloudflare worker for Questron
```

The homepage is `public/index.html`, reached through a rewrite in
`next.config.js` — a file in `public/` does not claim `/`.

## Commands

| | |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | production build (runs `parse --check` first) |
| `npm run parse` | specs → volume JSON + `public/data/volumes.json` |
| `npm run images` | convert new illustrations to WebP |
| `npm run fill` | measure how full every reader page is (needs the server running) |

**`next build` and `next dev` cannot share a directory.** A production build
overwrites `.next` under a running dev server and every route then 500s, which
reads exactly like a real module error. After a build: stop dev, `rm -rf .next`,
restart.

## Content

Chapters and Tales are flipbooks. They are authored as spec files in
`content/specs/`, generated into `content/volumes/*.json` for the reader, and
listed in `public/data/volumes.json` for the homepage — which is plain script
tags and cannot import anything. One source of truth, so the homepage and the
reader cannot disagree about what has been published.

`prebuild` runs `parse --check`, so **a build fails rather than shipping prose
that is not in the specs**. See `docs/READER.md` for the spec format, the page
budget, and how a part is sliced.

Everything else — gallery, lore, Questron — is still edited through
`/admin.html` and stored in `public/data/site.json`, written via the GitHub API.

## Images

`npm run images` converts illustrations in `public/assets/` to WebP. Outputs are
committed, so deploying needs nothing installed and there is no runtime image
loader; `sharp` is a devDependency used only to author them.

This is not housekeeping. Those 38 files were opaque AI-rendered illustrations
stored as PNG — a lossless format for flat colour and transparency, and the
worst possible container for a painterly image. They averaged 2.4MB each for
pictures that draw a few hundred pixels wide. At WebP quality 86 they are
visually identical and **90% smaller: 90.7MB → 9.2MB**.

**Paths in `public/js/` come in two kinds and they are not interchangeable.**
Browser paths (`uploads/x.jpg`) are relative to the server root. Repo paths, the
ones the admin panel writes through the GitHub API, need the `public/` prefix —
see `REPO_ROOT` in `storage.js`. Getting this wrong has no visible symptom: the
admin reports success while writing a file the site never reads.
