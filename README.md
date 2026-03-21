# Climbers Website

A chapter-by-chapter book release website with an admin panel.

## Features

- **Hero Banner** — Large banner with the "Climbers" logo and story description
- **Chapters Section** — Clickable chapter images that expand to reveal text; collapsible by clicking the image again or a collapse button
- **Gallery Section** — Character cards and world images with a lightbox viewer
- **Admin Panel** — Password-protected dashboard to manage all content

## How to Use

### Viewing the Site
Open `index.html` in any web browser.

### Admin Panel
1. Open `admin.html` in your browser
2. Default password: `climbers2026` (change it after first login)
3. From the admin panel you can:
   - **Banner & Info** — Set the site title, description, and banner image
   - **Chapters** — Add, edit, reorder, and remove chapters (with cover images and text)
   - **Gallery** — Add and remove character/location images
   - **Settings** — Change the admin password or reset all data

### Deploying on GitHub Pages
1. Push this repo to GitHub
2. Go to repo Settings → Pages → Source: Deploy from branch → main → / (root)
3. Your site will be live at `https://yourusername.github.io/climbers-website/`

## Notes
- All data is stored in the browser's `localStorage` — no server required
- Images are stored as base64 data URLs (keep images under ~2MB each for best results)
- Works entirely offline once loaded
