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

  // --- Gallery expand modal ---
  setupGalleryExpand();

  // --- Reader modal close ---
  setupReaderModal();

  // --- Video overlay ---
  setupVideoOverlay();

  // --- Ambient audio ---
  setupAmbientAudio();

  // --- Questron ---
  if (data.questron && data.questron.enabled) {
    setupQuestron(data.questron);
  }
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

  // --- Fan Art Section ---
  const fanArt = chapter.fanArt || [];
  const fanSection = document.createElement('div');
  fanSection.className = 'fan-art-section';

  const fanHeading = document.createElement('h3');
  fanHeading.className = 'fan-art-heading';
  fanHeading.textContent = 'Fan Art';
  fanSection.appendChild(fanHeading);

  if (fanArt.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'fan-art-empty';
    empty.textContent = 'No fan art yet for this chapter.';
    fanSection.appendChild(empty);
  } else {
    const grid = document.createElement('div');
    grid.className = 'fan-art-grid';

    fanArt.forEach(art => {
      const card = document.createElement('div');
      card.className = 'fan-art-card';

      const img = document.createElement('img');
      img.src = Storage.getFanArtImageUrl(chapter.id, art.id);
      img.alt = art.name || 'Fan Art';
      img.loading = 'lazy';
      img.onerror = () => { card.style.display = 'none'; };

      const overlay = document.createElement('div');
      overlay.className = 'fan-art-overlay';

      if (art.name) {
        const nameEl = document.createElement('span');
        nameEl.className = 'fan-art-name';
        nameEl.textContent = art.name;
        overlay.appendChild(nameEl);
      }
      if (art.artist) {
        const artistEl = document.createElement('span');
        artistEl.className = 'fan-art-artist';
        artistEl.textContent = 'by ' + art.artist;
        overlay.appendChild(artistEl);
      }

      card.appendChild(img);
      card.appendChild(overlay);
      grid.appendChild(card);

      card.addEventListener('click', () => {
        openLightbox(Storage.getFanArtImageUrl(chapter.id, art.id), art.name || '');
      });
    });

    fanSection.appendChild(grid);
  }

  body.appendChild(fanSection);

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

    div.addEventListener('click', () => {
      openGalleryExpand(item);
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
// GALLERY EXPAND MODAL
// ===========================
function setupGalleryExpand() {
  const modal = document.getElementById('galleryExpand');
  const closeBtn = document.getElementById('galleryExpandClose');

  closeBtn.addEventListener('click', closeGalleryExpand);
  modal.addEventListener('click', e => {
    if (e.target === modal) closeGalleryExpand();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeGalleryExpand();
    }
  });
}

function openGalleryExpand(item) {
  const modal = document.getElementById('galleryExpand');
  const inner = document.getElementById('galleryExpandInner');
  const img = document.getElementById('galleryExpandImg');
  const name = document.getElementById('galleryExpandName');
  img.src = Storage.getGalleryImageUrl(item.id);
  img.alt = item.label || '';
  name.textContent = item.label || '';

  // Show fields only if they have content
  for (let i = 1; i <= 5; i++) {
    const fEl = document.getElementById('galleryExpandField' + i);
    const val = item['field' + i] || '';
    fEl.textContent = val;
    fEl.style.display = val ? '' : 'none';
  }

  // Re-trigger animation by cloning
  const parent = inner.parentNode;
  const clone = inner.cloneNode(true);
  parent.replaceChild(clone, inner);

  // Re-assign IDs to the clone's children
  clone.id = 'galleryExpandInner';
  clone.querySelector('img').id = 'galleryExpandImg';
  clone.querySelector('.gallery-expand-name').id = 'galleryExpandName';
  const fields = clone.querySelectorAll('.gallery-expand-field');
  for (let i = 0; i < fields.length; i++) {
    fields[i].id = 'galleryExpandField' + (i + 1);
  }

  // Video badge
  let videoBadge = clone.querySelector('.video-badge');
  if (!videoBadge) {
    videoBadge = document.createElement('div');
    videoBadge.className = 'video-badge';
    videoBadge.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Watch Video';
    clone.querySelector('.gallery-expand-info').appendChild(videoBadge);
  }
  if (item.hasVideo) {
    videoBadge.style.display = '';
    videoBadge.onclick = () => { openVideoOverlay(Storage.getGalleryVideoUrl(item.id)); };
  } else {
    videoBadge.style.display = 'none';
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeGalleryExpand() {
  const modal = document.getElementById('galleryExpand');
  modal.classList.remove('active');
  document.body.style.overflow = '';
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
// VIDEO OVERLAY
// ===========================
function setupVideoOverlay() {
  const overlay = document.getElementById('videoOverlay');
  const player = document.getElementById('videoOverlayPlayer');
  const closeBtn = document.getElementById('videoOverlayClose');
  const replayBtn = document.getElementById('videoOverlayReplay');

  closeBtn.addEventListener('click', closeVideoOverlay);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeVideoOverlay();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) closeVideoOverlay();
  });

  replayBtn.addEventListener('click', () => {
    player.currentTime = 0;
    player.play();
  });
}

function openVideoOverlay(src) {
  const overlay = document.getElementById('videoOverlay');
  const player = document.getElementById('videoOverlayPlayer');
  player.src = src;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  player.play().catch(() => {});
}

function closeVideoOverlay() {
  const overlay = document.getElementById('videoOverlay');
  const player = document.getElementById('videoOverlayPlayer');
  player.pause();
  player.src = '';
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ===========================
// AMBIENT AUDIO
// ===========================
function setupAmbientAudio() {
  const audio = document.getElementById('ambientAudio');
  const toggle = document.getElementById('audioToggle');
  const iconOff = document.getElementById('audioIconOff');
  const iconOn = document.getElementById('audioIconOn');

  // Check if ambient audio file exists via HEAD request (works on mobile)
  const audioUrl = Storage.getAmbientAudioUrl();
  fetch(audioUrl, { method: 'HEAD' }).then(res => {
    if (res.ok) {
      audio.src = audioUrl;
      toggle.classList.remove('hidden');
    }
  }).catch(() => {});

  toggle.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => {
        toggle.classList.add('playing');
        iconOff.style.display = 'none';
        iconOn.style.display = '';
      }).catch(() => {});
    } else {
      audio.pause();
      toggle.classList.remove('playing');
      iconOff.style.display = '';
      iconOn.style.display = 'none';
    }
  });
}

// ===========================
// TYPEWRITER SUBTITLE
// ===========================
function setupRotatingSubtitle(el, text) {
  // Split on periods — each sentence becomes one typewriter rotation
  const sentences = text.split(/\./).map(s => s.trim()).filter(Boolean).map(s => s + '.');

  if (sentences.length === 0) { el.textContent = text; return; }

  // Build DOM
  el.textContent = '';
  const wrap = document.createElement('span');
  wrap.className = 'typewriter-wrap';
  const textNode = document.createElement('span');
  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  wrap.appendChild(textNode);
  wrap.appendChild(cursor);
  el.appendChild(wrap);

  let sentenceIdx = 0;
  let charIdx = 0;

  const TYPE_SPEED = 40;
  const PAUSE_AFTER_TYPE = 3000;

  function typeNext() {
    const current = sentences[sentenceIdx];
    charIdx++;
    textNode.textContent = current.substring(0, charIdx);

    if (charIdx >= current.length) {
      // Done typing — pause, then fade out and start next
      setTimeout(() => {
        wrap.classList.add('fade-out');
        setTimeout(() => {
          charIdx = 0;
          sentenceIdx = (sentenceIdx + 1) % sentences.length;
          textNode.textContent = '';
          wrap.classList.remove('fade-out');
          setTimeout(typeNext, 300);
        }, 500);
      }, PAUSE_AFTER_TYPE);
      return;
    }
    setTimeout(typeNext, TYPE_SPEED);
  }

  typeNext();
}

// ===========================
// QUESTRON AI TERMINAL
// ===========================
let questronKbCache = null;
let questronHistory = [];

function setupQuestron(config) {
  // Show nav link and section
  const navLink = document.getElementById('questronNavLink');
  if (navLink) navLink.style.display = '';
  const section = document.getElementById('questron-section');
  if (section) section.style.display = '';

  // Load header image
  const headerImg = document.getElementById('questronHeaderImg');
  headerImg.src = Storage.getQuestronHeaderUrl() + '?t=' + Date.now();
  headerImg.onload = () => { headerImg.style.display = ''; };
  headerImg.onerror = () => { headerImg.style.display = 'none'; };

  // Wire enter button
  document.getElementById('questronEnterBtn').addEventListener('click', () => {
    openQuestronTerminal();
  });

  // Wire close button
  document.getElementById('questronClose').addEventListener('click', closeQuestronTerminal);

  // ESC to close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('questronTerminal').classList.contains('active')) {
      closeQuestronTerminal();
    }
  });

  // Wire input form
  document.getElementById('qtInputForm').addEventListener('submit', e => {
    e.preventDefault();
    sendQuestronMessage(config.workerUrl);
  });
}

function openQuestronTerminal() {
  const terminal = document.getElementById('questronTerminal');
  terminal.classList.add('active');
  document.body.style.overflow = 'hidden';
  document.getElementById('qtInput').focus();
}

function closeQuestronTerminal() {
  const terminal = document.getElementById('questronTerminal');
  terminal.classList.remove('active');
  document.body.style.overflow = '';
}

async function sendQuestronMessage(workerUrl) {
  const input = document.getElementById('qtInput');
  const messages = document.getElementById('qtMessages');
  const question = input.value.trim();
  if (!question) return;

  input.value = '';

  // Show user's question
  const userLine = document.createElement('div');
  userLine.className = 'qt-line qt-user';
  userLine.textContent = question;
  messages.appendChild(userLine);

  // Show processing indicator
  const processing = document.createElement('div');
  processing.className = 'qt-processing';
  processing.textContent = 'PROCESSING';
  messages.appendChild(processing);
  messages.scrollTop = messages.scrollHeight;

  try {
    // Fetch knowledge base (cache after first load)
    if (questronKbCache === null) {
      try {
        const kbResponse = await fetch(Storage.getQuestronKbUrl() + '?t=' + Date.now());
        if (kbResponse.ok) {
          questronKbCache = await kbResponse.text();
        } else {
          questronKbCache = '';
        }
      } catch (e) {
        questronKbCache = '';
      }
    }

    // Call the worker
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: question,
        knowledgeBase: questronKbCache,
        history: questronHistory
      })
    });

    const data = await response.json();

    // Remove processing indicator
    if (processing.parentNode) processing.remove();

    // Show answer
    const botLine = document.createElement('div');
    botLine.className = 'qt-line qt-bot';
    botLine.textContent = data.answer;
    messages.appendChild(botLine);

    // Save to history for context
    questronHistory.push({ question: question, answer: data.answer });
    if (questronHistory.length > 10) questronHistory.shift();

  } catch (err) {
    // Remove processing indicator
    if (processing.parentNode) processing.remove();

    const errorLine = document.createElement('div');
    errorLine.className = 'qt-line qt-error';
    errorLine.textContent = 'TRANSMISSION ERROR: CONNECTION TO WORKER FAILED. CHECK TERMINAL CONFIGURATION.';
    messages.appendChild(errorLine);
  }

  messages.scrollTop = messages.scrollHeight;
  input.focus();
}
