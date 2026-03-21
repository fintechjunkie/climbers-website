/* ===== PUBLIC SITE LOGIC ===== */

document.addEventListener('DOMContentLoaded', async () => {
  const data = await Storage.getData();

  // --- Hero banner ---
  const heroSubtitle = document.getElementById('heroSubtitle');
  const heroBannerImg = document.getElementById('heroBannerImg');

  if (data.subtitle) setupRotatingSubtitle(heroSubtitle, data.subtitle);

  // Load banner image from repo (uploads/banner.jpg)
  heroBannerImg.src = Storage.getBannerImageUrl();
  heroBannerImg.onload = () => { heroBannerImg.style.display = 'block'; };
  heroBannerImg.onerror = () => { heroBannerImg.style.display = 'none'; };

  // --- Render chapters ---
  renderChapters(data.chapters);

  // --- Render gallery ---
  renderGallery(data.gallery);

  // --- Footer year ---
  document.getElementById('footerYear').textContent = new Date().getFullYear();

  // --- Lightbox ---
  setupLightbox();

  // --- Reader modal close ---
  setupReaderModal();
});

// ===========================
// CHAPTERS
// ===========================
function renderChapters(chapters) {
  const grid = document.getElementById('chaptersGrid');
  if (!chapters || chapters.length === 0) {
    grid.innerHTML = '<p class="empty-state">No chapters released yet. Stay tuned!</p>';
    return;
  }

  grid.innerHTML = '';
  chapters.forEach((ch, index) => {
    const card = document.createElement('div');
    card.className = 'chapter-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    const img = document.createElement('img');
    img.src = Storage.getChapterImageUrl(ch.id);
    img.alt = ch.title || 'Chapter ' + (index + 1);
    img.loading = 'lazy';
    img.onerror = () => {
      img.src = 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#1a1a1a"/><text x="50%" y="50%" fill="#555" text-anchor="middle" font-size="20" font-family="Georgia,serif">' + (ch.title || 'Chapter') + '</text></svg>'
      );
      img.onerror = null; // prevent infinite loop
    };

    const label = document.createElement('div');
    label.className = 'card-label';
    label.textContent = ch.title || 'Chapter ' + (index + 1);

    card.appendChild(img);
    card.appendChild(label);
    grid.appendChild(card);

    card.addEventListener('click', () => openReader(ch));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openReader(ch); }
    });
  });
}

// ===========================
// READER MODAL
// ===========================
function setupReaderModal() {
  const closeBtn = document.getElementById('readerClose');
  closeBtn.addEventListener('click', closeReader);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeReader();
  });
}

function openReader(chapter) {
  const modal = document.getElementById('readerModal');
  const title = document.getElementById('readerTitle');
  const body = document.getElementById('readerBody');

  title.textContent = chapter.title || 'Untitled Chapter';
  body.innerHTML = '';

  const parts = chapter.parts || [];
  if (parts.length === 0) {
    body.innerHTML = '<p style="color:#666;text-align:center;padding:3rem">No parts have been added to this chapter yet.</p>';
  } else {
    parts.forEach((part, idx) => {
      const accordion = document.createElement('div');
      accordion.className = 'part-accordion';

      // Header
      const header = document.createElement('div');
      header.className = 'part-header';
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');

      const arrow = document.createElement('span');
      arrow.className = 'part-header-arrow';
      arrow.textContent = '\u25B6';

      const partTitle = document.createElement('span');
      partTitle.className = 'part-header-title';
      partTitle.textContent = part.title || 'Part ' + toRoman(idx + 1);

      header.appendChild(arrow);
      header.appendChild(partTitle);

      // Body
      const partBody = document.createElement('div');
      partBody.className = 'part-body';

      const text = document.createElement('div');
      text.className = 'text';
      text.textContent = part.text || '';

      const collapseBtn = document.createElement('button');
      collapseBtn.className = 'collapse-btn';
      collapseBtn.textContent = 'Collapse';

      partBody.appendChild(text);
      partBody.appendChild(collapseBtn);

      accordion.appendChild(header);
      accordion.appendChild(partBody);
      body.appendChild(accordion);

      // Toggle
      function togglePart() {
        const isOpen = partBody.classList.contains('open');
        if (isOpen) {
          partBody.classList.remove('open');
          header.classList.remove('expanded');
        } else {
          partBody.classList.add('open');
          header.classList.add('expanded');
          partBody.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }

      header.addEventListener('click', togglePart);
      header.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePart(); }
      });
      collapseBtn.addEventListener('click', () => {
        partBody.classList.remove('open');
        header.classList.remove('expanded');
        header.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeReader() {
  const modal = document.getElementById('readerModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// ===========================
// GALLERY
// ===========================
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
    img.src = Storage.getGalleryImageUrl(item.id);
    img.alt = item.label || '';
    img.loading = 'lazy';
    img.onerror = () => {
      img.src = 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="280" height="400"><rect width="280" height="400" fill="#1a1a1a"/><text x="50%" y="50%" fill="#555" text-anchor="middle" font-size="16" font-family="Georgia,serif">No image</text></svg>'
      );
      img.onerror = null;
    };

    div.appendChild(img);

    if (item.label) {
      const lbl = document.createElement('div');
      lbl.className = 'gallery-label';
      lbl.textContent = item.label;
      div.appendChild(lbl);
    }

    const imgUrl = Storage.getGalleryImageUrl(item.id);
    div.addEventListener('click', () => {
      openLightbox(imgUrl, item.label || '');
    });

    grid.appendChild(div);
  });
}

// ===========================
// LIGHTBOX
// ===========================
function setupLightbox() {
  const lb = document.getElementById('lightbox');
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

// ===========================
// UTILITY
// ===========================
function toRoman(num) {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let result = '';
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) { result += syms[i]; num -= vals[i]; }
  }
  return result;
}

// ===========================
// ROTATING SUBTITLE
// ===========================
function setupRotatingSubtitle(el, text) {
  // Split on double-newlines (paragraph breaks) or single newlines
  const blocks = text.split(/\n\s*\n|\n/).map(s => s.trim()).filter(Boolean);

  if (blocks.length <= 1) {
    // Only one block, no rotation needed
    el.textContent = text;
    return;
  }

  let current = 0;
  el.textContent = blocks[current];
  el.style.transition = 'opacity 0.8s ease';

  setInterval(() => {
    // Fade out
    el.style.opacity = '0';

    setTimeout(() => {
      // Switch text and fade in
      current = (current + 1) % blocks.length;
      el.textContent = blocks[current];
      el.style.opacity = '1';
    }, 800);
  }, 10000);
}
