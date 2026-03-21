/* ===== PUBLIC SITE LOGIC ===== */

document.addEventListener('DOMContentLoaded', () => {
  const data = Storage.getData();

  // --- Hero banner ---
  const heroSubtitle = document.getElementById('heroSubtitle');
  const heroBannerImg = document.getElementById('heroBannerImg');

  if (data.subtitle) heroSubtitle.textContent = data.subtitle;
  if (data.bannerImage) {
    heroBannerImg.src = data.bannerImage;
    heroBannerImg.style.display = 'block';
  }

  // --- Render chapters ---
  renderChapters(data.chapters);

  // --- Render gallery ---
  renderGallery(data.gallery);

  // --- Footer year ---
  document.getElementById('footerYear').textContent = new Date().getFullYear();

  // --- Lightbox ---
  setupLightbox();
});

function renderChapters(chapters) {
  const grid = document.getElementById('chaptersGrid');
  if (!chapters || chapters.length === 0) {
    grid.innerHTML = '<p class="empty-state">No chapters released yet. Stay tuned!</p>';
    return;
  }

  grid.innerHTML = '';
  chapters.forEach((ch, index) => {
    // Card wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'chapter-wrapper';

    // Clickable card
    const card = document.createElement('div');
    card.className = 'chapter-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-expanded', 'false');

    const img = document.createElement('img');
    img.src = ch.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" fill="%23222"><rect width="400" height="500"/><text x="50%" y="50%" fill="%23555" text-anchor="middle" font-size="24">Chapter ' + (index + 1) + '</text></svg>';
    img.alt = ch.title || 'Chapter ' + (index + 1);
    img.loading = 'lazy';

    const label = document.createElement('div');
    label.className = 'card-label';
    label.textContent = ch.title || 'Chapter ' + (index + 1);

    card.appendChild(img);
    card.appendChild(label);

    // Expandable content
    const content = document.createElement('div');
    content.className = 'chapter-content';
    content.id = 'chapter-content-' + index;

    const text = document.createElement('div');
    text.className = 'text';
    text.textContent = ch.text || '';

    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'collapse-btn';
    collapseBtn.textContent = 'Collapse Chapter';

    content.appendChild(text);
    content.appendChild(collapseBtn);

    wrapper.appendChild(card);
    wrapper.appendChild(content);
    grid.appendChild(wrapper);

    // Toggle logic
    function toggle() {
      const isOpen = content.classList.contains('open');
      if (isOpen) {
        content.classList.remove('open');
        card.setAttribute('aria-expanded', 'false');
      } else {
        content.classList.add('open');
        card.setAttribute('aria-expanded', 'true');
        content.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    card.addEventListener('click', toggle);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    collapseBtn.addEventListener('click', () => {
      content.classList.remove('open');
      card.setAttribute('aria-expanded', 'false');
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
}

function renderGallery(gallery) {
  const grid = document.getElementById('galleryGrid');
  if (!gallery || gallery.length === 0) {
    grid.innerHTML = '<p class="empty-state">Gallery coming soon!</p>';
    return;
  }

  grid.innerHTML = '';
  gallery.forEach(item => {
    const div = document.createElement('div');
    div.className = 'gallery-item';

    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.label || '';
    img.loading = 'lazy';

    div.appendChild(img);

    if (item.label) {
      const lbl = document.createElement('div');
      lbl.className = 'gallery-label';
      lbl.textContent = item.label;
      div.appendChild(lbl);
    }

    div.addEventListener('click', () => {
      openLightbox(item.image, item.label || '');
    });

    grid.appendChild(div);
  });
}

function setupLightbox() {
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbCaption = document.getElementById('lightboxCaption');
  const lbClose = document.getElementById('lightboxClose');

  lbClose.addEventListener('click', () => lb.classList.remove('active'));
  lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('active'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('active'); });
}

function openLightbox(src, caption) {
  const lb = document.getElementById('lightbox');
  document.getElementById('lightboxImg').src = src;
  document.getElementById('lightboxCaption').textContent = caption;
  lb.classList.add('active');
}
