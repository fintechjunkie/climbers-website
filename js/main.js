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

  // --- Oath Lord Registry ---
  if (data.questron && data.questron.workerUrl) {
    setupRegistry(data.questron.workerUrl);
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
// ===========================
// OATH LORD ALIGNMENT REGISTRY
// ===========================
const OATH_LORDS = [
  {
    id: 'malachus', name: 'Archon Malachus', surname: 'Malachus',
    title: 'Keeper of the Archive', number: 'First Among the Ten',
    x: 72, y: 18, color: '#8a8a7a', alignment: 'Lawful Good',
    aug: 'Total Recall', augDesc: 'Malachus remembers everything. Every conversation, every treaty, every broken promise. His augmentation is not enhanced memory. It is perfect, involuntary, permanent recording. He cannot forget. He has tried.',
    followers: 'The Witnesses. They carry small recording stones and transcribe everything they observe. They do not interpret. They do not editorialize. They write down what happened. Malachus reviews their accounts and files them in the Archive.',
    question: 'What is the difference between memory and truth?',
    answer: 'Memory is what happened. Truth is what people agree happened. The Archive does not concern itself with truth.',
    detail: 'Malachus built the Archive before the first Climber entered the Tower. He believed that if every event were recorded without bias, conflict would eventually become impossible because no one could deny what occurred. He was wrong. The factions simply stopped caring whether things were recorded. But the Archive persists, and Malachus continues to document. He does not intervene. He does not take sides. He watches, and he remembers, and he files. Some say the Archive itself is his real augmentation. Others say Malachus died years ago and the Archive is simply continuing his work without him.',
    alliances: 'None formally. The Archive is open to all factions. Vesper Quill consults it regularly. Thorne has attempted to restrict access three times and failed.',
    enemies: 'None declared. Absalom considers the Archive an obstacle. Grey considers it a threat. Neither has moved against it directly.',
    voice: 'Archon Malachus speaks with the measured detachment of someone who has already recorded the outcome of every argument. He does not advocate. He documents. When he does offer a position, it lands with the weight of permanent record.'
  },
  {
    id: 'thorne', name: 'Cardinal Thorne', surname: 'Thorne',
    title: 'The Hierophant', number: 'Third Among the Ten',
    x: 60, y: 58, color: '#b8943a', alignment: 'Lawful Evil',
    aug: 'Ideological Resonance', augDesc: 'Thorne reads belief the way others read facial expressions. He perceives the structure of what a person holds true, where it is strong, where it bends, and where it can be redirected. He does not change minds. He finds the hinge points and applies pressure.',
    followers: 'The Faithful. They wear iron medallions and follow Thorne not because they agree with him but because he has made agreement feel like the only stable ground. They are not fanatics. They are people who stopped being able to tell whether their beliefs were their own.',
    question: 'What does Seraph want?',
    answer: 'Seraph wants exactly what it has always wanted. That is the wrong question. The right question is: what does Seraph need?',
    detail: 'Thorne was not always a Lord. He was a negotiator. A mediator between factions in the early days of Haven City. He was good at it. Too good. He began to notice that he could feel what people believed before they said it. He could sense the architecture of conviction. He used this to resolve disputes. Then he used it to win them. Then he stopped pretending there was a difference. Thorne does not lie. He does not need to. He identifies the belief structure that serves his purpose and helps people arrive at it naturally. The Faithful follow him because, in his presence, their doubts simply stop.',
    alliances: 'Formal alliance with the city authority structure. Informal understanding with Absalom regarding territorial boundaries. Thorne does not have allies. He has arrangements.',
    enemies: 'Grey. Openly and personally. Grey can see through Thorne\'s augmentation and has said so publicly. Thorne considers Grey a minor irritation. Grey considers Thorne the most dangerous person in Haven City.',
    voice: 'Cardinal Thorne speaks the way a surgeon cuts — precisely, without waste, always toward a purpose you only understand afterward. He reads what you believe before you finish the sentence. He responds to what you meant, not what you said.'
  },
  {
    id: 'vesper', name: 'Vesper Quill', surname: 'Quill',
    title: 'The Arbiter', number: 'Fourth Among the Ten',
    x: 82, y: 20, color: '#7a8a9a', alignment: 'Lawful Good',
    aug: 'Contractual Binding', augDesc: 'When Vesper Quill drafts an agreement and both parties sign, the terms become functionally unbreakable. Not magically. Not physically. The agreement creates a resonance field in which violating the terms produces immediate, escalating cognitive dissonance. You can break a Quill contract. You will wish you had not.',
    followers: 'The Clerks. They draft, witness, and enforce agreements throughout Haven City. They are fastidious, humorless, and incorruptible. They answer only to Quill. They carry copies of every active contract in the city.',
    question: 'Is law the same as justice?',
    answer: 'Law is the framework. Justice is the claim people make when the framework does not serve them. I maintain the framework.',
    detail: 'Vesper Quill arrived in Haven City during the second faction war and stopped it. Not through force. She drafted a ceasefire agreement so precisely worded that neither side could find a loophole, and the cognitive cost of violation was too high to bear. She has been drafting the city\'s foundational agreements ever since. Quill does not care about fairness. She cares about clarity. A contract that is clear and enforceable is, to her, inherently just. She has been criticized for this. She has also never been wrong about what a contract says.',
    alliances: 'Works with Malachus regularly. The Archive provides the evidentiary basis for many of her rulings. She respects his neutrality and he respects her precision.',
    enemies: 'Absalom. He violated a territorial agreement she drafted and paid the cognitive price. He has not forgiven her. She has not noticed.',
    voice: 'Vesper Quill speaks in terms of what was agreed. She does not moralize. She does not threaten. She clarifies what the terms are and what follows from them. The calmness is the threat.'
  },
  {
    id: 'absalom', name: 'Lord Absalom', surname: 'Absalom',
    title: 'The Sovereign', number: 'Second Among the Ten',
    x: 78, y: 80, color: '#c84444', alignment: 'Lawful Evil',
    aug: 'Dominion Field', augDesc: 'Within a defined territory, Absalom exerts absolute physiological authority. Heart rates slow. Muscles relax. Aggression dissipates. It is not mind control. It is the body recognizing that it is in the presence of something it cannot oppose. The range is limited. The effect is not.',
    followers: 'The Bone Patrol. They enforce Absalom\'s territorial boundaries with mechanical precision. They do not speak during operations. They wear white ceramic armor. They are feared not for their cruelty but for their consistency.',
    question: 'What is the purpose of power?',
    answer: 'To make the question irrelevant.',
    detail: 'Absalom controls the eastern quarter of Haven City and the primary access corridor to the Tower. He took it by standing in the center of the district and waiting. Within six hours, every person in the area had stopped resisting. Not because he threatened them. Because their bodies could not sustain resistance in his presence. Absalom does not negotiate. He establishes facts. His territory is orderly, efficient, and quiet. People who live there report feeling safe. They also report feeling nothing else. Critics call it tyranny. Absalom calls it governance. The distinction is academic for the people inside the field.',
    alliances: 'Formal territorial agreement with Thorne. Informal non-aggression pact with Silence. Both arrangements serve his interests.',
    enemies: 'Grey. Absalom has placed a standing bounty on Grey. Not because Grey threatens his territory, but because Grey publicly mocked the Dominion Field and was not affected by it. This is unprecedented and Absalom finds it unacceptable.',
    voice: 'Lord Absalom does not argue. He states how things are and how they will be. His voice carries the flat precision of someone who has never needed to raise it. Disagreement is noted as a data point that does not change the outcome.'
  },
  {
    id: 'silence', name: 'Sister Silence', surname: 'Silence',
    title: 'The Merciful', number: 'Fifth Among the Ten',
    x: 62, y: 78, color: '#9a9ab8', alignment: 'Neutral Evil',
    aug: 'Emotional Nullification', augDesc: 'Silence can suppress any emotional state in any person within her range. Grief, rage, fear, joy. All of it, gone. What remains is a flat, functional calm. She calls it mercy. Her patients call it relief. Her critics call it something else entirely.',
    followers: 'The Absolved. They come to Silence voluntarily, seeking relief from trauma, grief, or unbearable memory. After treatment, they are calm, functional, and productive. They are also notably incapable of describing what they lost. They do not miss it. That is the point.',
    question: 'Is it cruel to remove suffering if the person cannot consent to the removal?',
    answer: 'Suffering does not ask consent before it arrives. Why should its removal?',
    detail: 'Silence operates from a clinic in the lower city. There is always a line. She treats anyone who asks. She does not charge. She does not judge. She removes emotional pain with the clinical efficiency of a surgeon removing a tumor. The problem is that emotional pain is not a tumor. It is part of the person. The Absolved function well. They work, eat, sleep. But something is missing, and they cannot identify what. Silence insists this is acceptable. The alternative, she says, was a person who could not function at all. The ethics of her practice are debated constantly. She does not participate in the debate.',
    alliances: 'Operational understanding with Vex. They refer patients to each other. Their methods are different but their philosophy of pragmatic intervention overlaps.',
    enemies: 'Absalom. He attempted to bring Silence into his territory as a resource. She declined. He insisted. She nullified his emotional state for eleven seconds. The Dominion Field stuttered. Neither has spoken of it since.',
    voice: 'Sister Silence speaks softly and without judgment. She frames everything as relief. The violence of what she does is entirely invisible in her language — she discusses the removal of pain the way a doctor discusses removing a splinter.'
  },
  {
    id: 'cipher', name: 'The Cipher', surname: 'Cipher',
    title: 'The Unknown', number: 'Seventh Among the Ten',
    x: 48, y: 48, color: '#6a6a6a', alignment: 'True Neutral',
    aug: 'Unknown', augDesc: 'The Cipher\'s augmentation, if it has one, has never been identified, demonstrated, or confirmed. Multiple factions have attempted to classify it. All attempts have produced contradictory results. The Cipher does not clarify.',
    followers: 'None confirmed. Individuals occasionally claim to act on the Cipher\'s behalf. The Cipher neither confirms nor denies these claims. Whether the Cipher has followers or simply has people who believe they are followers is an open question.',
    question: 'What are you?',
    answer: 'Present.',
    detail: 'No one knows when the Cipher arrived in Haven City. No one can agree on what the Cipher looks like. Descriptions vary by observer and by day. The Cipher attends council meetings, stands in the back, and occasionally makes a statement that reframes the entire discussion. Then it leaves. Malachus has attempted to create a definitive record of the Cipher\'s actions. The Archive contains 847 entries, no two of which are internally consistent. The Cipher is not hiding. It is simply not available for classification. Whether this is deliberate obfuscation or something more fundamental is the central question of Cipher scholarship, a field that has exactly zero confirmed conclusions.',
    alliances: 'Unknown. The Cipher has been seen in proximity to every faction leader at various times. No pattern has been established.',
    enemies: 'Unknown. No faction has moved against the Cipher. Whether this is because they do not consider it a threat or because they are afraid of what would happen is a matter of interpretation.',
    voice: 'The Cipher\'s response, if it responds at all, arrives sideways — not addressing the situation directly but revealing something about it that reframes everything else. Whether this is wisdom or deflection is impossible to determine.'
  },
  {
    id: 'vex', name: 'Dr. Salome Vex', surname: 'Vex',
    title: 'The Analyst', number: 'Eighth Among the Ten',
    x: 30, y: 52, color: '#7a5a8a', alignment: 'Chaotic Neutral',
    aug: 'Consequence Mapping', augDesc: 'Vex perceives the probable outcomes of any action as a branching probability field. She does not see the future. She sees what is likely. The distinction matters to her. It does not always matter to the people she advises.',
    followers: 'The Korinth. An extraction and intelligence faction that operates inside and outside the Tower. They gather data, assess threats, and retrieve people or objects from dangerous situations. They are professional, well-equipped, and expensive. Vex built them from nothing.',
    question: 'Is knowledge power?',
    answer: 'Knowledge is leverage. Power is what you do with leverage. Most people confuse the two and end up with neither.',
    detail: 'Vex was a researcher before she was a Lord. She studied the Tower, its effects on Climbers, and the mechanism of augmentation. Her findings were brilliant, uncomfortable, and suppressed by three separate factions before she decided to stop publishing and start acting. The Korinth were her solution: a private intelligence service that answered to no faction and sold information to all of them. Vex does not take sides. She takes payment. Her analyses are accurate, her recommendations are sound, and her moral framework is entirely transactional. She has been called a mercenary. She prefers the term consultant.',
    alliances: 'Transactional relationships with all factions. The Korinth have contracts with Absalom, Thorne, and the city authority. Vex maintains operational independence by being useful to everyone.',
    enemies: 'No personal enemies. The Korinth extraction team that was destroyed inside the Tower has created tension with multiple factions. Vex is investigating.',
    voice: 'Dr. Salome Vex responds with clinical precision. She identifies what the situation costs and who pays it. She is interested in outcomes, not principles. She finds moral arguments useful only as predictors of behavior.'
  },
  {
    id: 'yuki', name: 'Grandmother Yuki', surname: 'Yuki',
    title: 'The Gentle', number: 'Sixth Among the Ten',
    x: 48, y: 18, color: '#c8c8a0', alignment: 'Neutral Good',
    aug: 'Empathic Amplification', augDesc: 'Yuki amplifies the emotional connections between people in her presence. Not their emotions themselves, but the capacity to feel what others feel. In her company, strangers understand each other. Enemies hesitate. Children stop crying. It is not manipulation. It is proximity to someone who makes empathy unavoidable.',
    followers: 'The Hearth. They run shelters, kitchens, and safe houses throughout Haven City. They feed anyone. They house anyone. They do not ask questions. They do not keep records. The Hearth is the largest civilian support network in the city and it operates on donated food and volunteer labor.',
    question: 'Can people be saved?',
    answer: 'People do not need to be saved. They need to be fed, and sheltered, and listened to. Salvation is a word used by people who want credit for helping.',
    detail: 'Yuki has been in Haven City longer than any living Lord except possibly the Cipher. She was old when the first Climber entered the Tower. She has outlived four faction wars, two plagues, and the collapse of the original city government. She runs the Hearth from a kitchen in the lower city. She cooks. She listens. She does not give orders. People come to her because she is the only Lord who has never asked for anything in return. This is either wisdom or naivety, depending on who you ask. Yuki does not care which.',
    alliances: 'Everyone. The Hearth feeds Bone Patrol soldiers and resistance fighters at the same table. Yuki has told Absalom to his face that his soldiers are welcome to eat as long as they leave their weapons at the door. He complied.',
    enemies: 'None. Even Absalom respects the Hearth. Thorne has attempted to co-opt it three times. Yuki served him soup and changed the subject. He has not tried again.',
    voice: 'Grandmother Yuki responds with warmth and without urgency. She has opinions. She offers them gently. The gentleness is not weakness.'
  },
  {
    id: 'fawn', name: 'Fawn', surname: 'Fawn',
    title: 'The Unbroken', number: 'Ninth Among the Ten',
    x: 22, y: 22, color: '#c878b8', alignment: 'Chaotic Good',
    aug: 'Emotional Resonance Burst', augDesc: 'Fawn projects raw, unfiltered emotion in a radius around her. Not a specific emotion. Whatever she is feeling, everyone nearby feels it too, at full intensity. She cannot control this. When she is joyful, the area around her lights up. When she is afraid, crowds panic. When she grieves, strangers weep. The augmentation is involuntary and exhausting.',
    followers: 'The Strays. Failed Climbers, orphans, refugees, and anyone who has been discarded by the faction system. They follow Fawn because she is the only person who has never pretended that their pain does not matter. She does not lead them. They simply will not leave.',
    question: 'Why do people climb?',
    answer: 'Because something up there is calling them and nothing down here is enough.',
    detail: 'Fawn is the youngest of the Ten. She was a Failed Climber. She entered the Tower at fourteen, reached Level 3, and was rejected. The augmentation she received on the way out was not a gift. It was a wound that never closed. She feels everything, constantly, and broadcasts it to anyone nearby. She has no strategic value. She has no faction. She has no territory. She has a crowd of broken people who follow her because when they are near her, they feel less alone. The other Lords do not know what to do with Fawn. She does not fit any category. She is not powerful. She is not strategic. She is simply honest in a city that has forgotten what that looks like.',
    alliances: 'Yuki. The Hearth feeds the Strays. Yuki treats Fawn like a granddaughter. This is the closest thing to a formal alliance Fawn has.',
    enemies: 'None declared. Absalom finds her augmentation disruptive to his Dominion Field and has banned her from his territory. Silence has offered to nullify her augmentation. Fawn declined.',
    voice: 'Fawn responds with the complete sincerity of someone who has never learned to be strategic. She says exactly what she feels. The emotional weight of it hits before the words do.'
  },
  {
    id: 'grey', name: 'Grey', surname: 'Grey',
    title: 'The Architect', number: 'Tenth Among the Ten',
    x: 24, y: 36, color: '#8a9898', alignment: 'Chaotic Good',
    aug: 'Augmentation Immunity', augDesc: 'Grey is immune to every other augmentation. Absalom\'s Dominion Field does not work on him. Thorne cannot read his beliefs. Silence cannot nullify his emotions. Yuki cannot amplify his empathy. He is a dead zone. In a city built on augmented power, Grey is the only person who cannot be affected by any of it.',
    followers: 'None officially. Grey operates alone. He has informants, contacts, and people who owe him favors. He does not call them followers. They do not call themselves anything.',
    question: 'What is the most dangerous thing in Haven City?',
    answer: 'Certainty.',
    detail: 'Grey is a spy. He has been a spy for fifteen years. He has infiltrated every faction in Haven City at least once. He has been captured, tortured, and released more times than he can count. He keeps going because he is the only person in the city who can walk through any Lord\'s augmented field without being affected. This makes him uniquely valuable and uniquely hated. Grey does not have a political position. He has information. He sells it, trades it, or gives it away depending on what he thinks will cause the least harm. His moral framework is ad hoc and exhausted. He does the right thing, usually, but he is very tired of it.',
    alliances: 'Informal and deniable. He provides intelligence to Malachus for the Archive. He has helped Fawn\'s Strays on multiple occasions. He drinks with Vex when he needs to think out loud.',
    enemies: 'Absalom has a standing bounty on Grey. Thorne considers him a nuisance. Grey considers both of them problems he has not yet solved.',
    voice: 'Grey responds with the exhausted honesty of someone who has been lying to everyone for fifteen years and finds it increasingly difficult to care about the performance. He says what is true. He does not say it gently.'
  }
];

const REGISTRY_SITUATIONS = [
  'A faction leader in Haven City demands that all Valari residents register their residue-reading ability with the city authority or face relocation.',
  'Three Climbers returned from Level 4 with the same augmentation — something Seraph has never done before. The city is fracturing over what it means.',
  'A Sandmen operative was caught inside The Prism — neutral territory — harvesting emotional residue from the walls. Vesper Quill is demanding consequences.',
  'A Bone Patrol officer killed a child during a routine enforcement action. The officer claims he was acting under standing orders. The city is watching.',
  'Seraph\'s broadcast has been silent for six days. Panic is spreading. Factions are positioning. The Tower\'s gate is still open.',
  'A group of Failed Climbers has organized and is blocking the Tower gate. They are not violent. They are simply standing there, refusing to move, in shifts.',
  'A Witness from Malachus\'s Archive has come forward claiming to have recorded evidence that one of the Ten has been giving Climbers false information about what awaits them above Level 15.',
  'A Human child has registered a question at the Tower gate. The question is about whether her dead mother can be brought back. The city cannot decide whether to stop her.',
  'The Hive Mind suppressants in Haven City\'s water supply have failed in one district. The Valari living there are experiencing fragments of collective consciousness for the first time in a generation.',
  'A Korinth extraction team was destroyed inside the Tower. Korinth is threatening to blockade Haven City unless the other factions help them identify who is protecting their targets.'
];

const REGISTRY_RELATIONSHIPS = [
  { from: 'absalom', to: 'silence', style: 'solid', color: '#c84444', label: 'Active conflict' },
  { from: 'absalom', to: 'yuki', style: 'dotted', color: '#b8943a', label: 'Uneasy arrangement' },
  { from: 'grey', to: 'absalom', style: 'solid', color: '#884444', label: 'Existential threat' },
  { from: 'grey', to: 'thorne', style: 'solid', color: '#884444', label: 'Existential threat' },
  { from: 'silence', to: 'vex', style: 'dashed', color: '#6a9a7a', label: 'Operational alignment' },
  { from: 'vesper', to: 'absalom', style: 'dotted', color: '#b8943a', label: 'Uneasy arrangement' },
  { from: 'malachus', to: 'cipher', style: 'dashed', color: '#7a7a9a', label: 'Mutual observation' },
  { from: 'fawn', to: 'yuki', style: 'dashed', color: '#9a7a8a', label: 'Protected bond' },
  { from: 'thorne', to: 'absalom', style: 'dotted', color: '#b8943a', label: 'Uneasy arrangement' },
  { from: 'vesper', to: 'malachus', style: 'dashed', color: '#6a9a7a', label: 'Operational alignment' },
  { from: 'fawn', to: 'silence', style: 'solid', color: '#c84444', label: 'Active conflict' },
  { from: 'grey', to: 'vex', style: 'dashed', color: '#7a7a9a', label: 'Mutual observation' }
];

let regSelectedLord = null;
let regRelationsVisible = false;
let regSituationPool = [];
let regCurrentSituation = null;
let regSitSelectedLord = null;

function setupRegistry(workerUrl) {
  const section = document.getElementById('registry-section');
  const navLink = document.getElementById('registryNavLink');
  if (section) section.style.display = '';
  if (navLink) navLink.style.display = '';

  renderRegistryGrid();
  renderRegistryDetailList();
  setupRegistryEvents(workerUrl);
}

function renderRegistryGrid() {
  const svg = document.getElementById('regSvg');
  // Grid lines
  let gridLines = '';
  gridLines += '<line x1="33.33" y1="0" x2="33.33" y2="100" stroke="#181d21" stroke-width="0.3"/>';
  gridLines += '<line x1="66.67" y1="0" x2="66.67" y2="100" stroke="#181d21" stroke-width="0.3"/>';
  gridLines += '<line x1="0" y1="33.33" x2="100" y2="33.33" stroke="#181d21" stroke-width="0.3"/>';
  gridLines += '<line x1="0" y1="66.67" x2="100" y2="66.67" stroke="#181d21" stroke-width="0.3"/>';

  // Relationship lines (hidden by default, toggled via class)
  let relLines = '';
  REGISTRY_RELATIONSHIPS.forEach((rel, i) => {
    const fromLord = OATH_LORDS.find(l => l.id === rel.from);
    const toLord = OATH_LORDS.find(l => l.id === rel.to);
    if (!fromLord || !toLord) return;
    let dashArray = '';
    if (rel.style === 'dashed') dashArray = 'stroke-dasharray="2 1.5"';
    if (rel.style === 'dotted') dashArray = 'stroke-dasharray="0.6 0.8"';
    relLines += `<line class="reg-rel-line" x1="${fromLord.x}" y1="${fromLord.y}" x2="${toLord.x}" y2="${toLord.y}" stroke="${rel.color}" stroke-width="0.4" opacity="0.6" ${dashArray}/>`;
  });

  // Lord nodes
  let nodes = '';
  OATH_LORDS.forEach(lord => {
    nodes += `<circle class="reg-node" data-lord="${lord.id}" cx="${lord.x}" cy="${lord.y}" r="1.2" fill="${lord.color}" style="cursor:pointer"/>`;
    nodes += `<text class="reg-node-label" data-lord-label="${lord.id}" x="${lord.x}" y="${lord.y + 4.5}" text-anchor="middle" fill="${lord.color}" font-size="3" font-family="Orbitron,sans-serif" font-weight="600" letter-spacing="0.2" opacity="0">${lord.surname}</text>`;
  });

  svg.innerHTML = gridLines + relLines + nodes;
}

function renderRegistryDetailList() {
  const body = document.getElementById('regDetailBody');
  body.innerHTML = '';
  OATH_LORDS.forEach(lord => {
    const row = document.createElement('div');
    row.className = 'reg-lord-row';
    row.dataset.lord = lord.id;
    row.innerHTML = `
      <span class="reg-lord-dot" style="background:${lord.color}"></span>
      <div class="reg-lord-row-info">
        <span class="reg-lord-row-name">${lord.name}</span>
        <span class="reg-lord-row-meta">${lord.title} · ${lord.alignment}</span>
      </div>
    `;
    row.addEventListener('click', () => selectLord(lord.id));
    body.appendChild(row);
  });
}

function selectLord(lordId) {
  const lord = OATH_LORDS.find(l => l.id === lordId);
  if (!lord) return;
  regSelectedLord = lord;

  // Update grid nodes
  document.querySelectorAll('.reg-node').forEach(n => {
    const id = n.dataset.lord;
    if (id === lordId) {
      n.setAttribute('r', '1.8');
      n.setAttribute('stroke', '#ffffff');
      n.setAttribute('stroke-width', '0.4');
      n.style.filter = `drop-shadow(0 0 1.5px ${lord.color})`;
    } else {
      n.setAttribute('r', '1.2');
      n.removeAttribute('stroke');
      n.removeAttribute('stroke-width');
      n.style.filter = '';
    }
  });
  document.querySelectorAll('.reg-node-label').forEach(t => {
    t.setAttribute('opacity', t.dataset.lordLabel === lordId ? '1' : '0');
  });

  // Update detail panel
  renderLordDetail(lord);

  // Update situation lord buttons
  document.querySelectorAll('.reg-sit-lord-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lord === lordId);
  });
}

function renderLordDetail(lord) {
  const header = document.querySelector('.reg-detail-header');
  header.innerHTML = `<span class="reg-detail-header-text" style="color:${lord.color}">${lord.name}</span><button class="reg-detail-close" onclick="deselectLord()">&times;</button>`;

  const body = document.getElementById('regDetailBody');
  let html = '';

  // Portrait image (graceful loading)
  html += `<img class="reg-portrait" src="public/assets/oath-lords/${lord.id}-portrait.png" alt="${lord.name}" onerror="this.style.display='none'" onload="this.style.display='block'">`;
  html += `<div class="reg-portrait-bar" style="background:${lord.color}"></div>`;

  // Name + faction icon
  html += `<div class="reg-name-row">`;
  html += `<span class="reg-lord-name" style="color:${lord.color}">${lord.name.toUpperCase()}</span>`;
  html += `<img class="reg-faction-icon" src="public/assets/oath-lords/${lord.id}-faction.png" alt="" onerror="this.style.display='none'" onload="this.style.display='block'">`;
  html += `</div>`;
  html += `<div class="reg-lord-title">${lord.title.toUpperCase()}</div>`;
  html += `<div class="reg-lord-number">${lord.number.toUpperCase()}</div>`;

  html += regField('ALIGNMENT', lord.alignment, lord.color);
  html += regField('AUGMENTATION', `<strong>${lord.aug}</strong><br><span class="reg-aug-desc">${lord.augDesc}</span>`, lord.color);
  html += regField('FOLLOWERS', lord.followers, lord.color);
  html += `<div class="reg-field"><div class="reg-field-label" style="color:${lord.color}">QUESTION REGISTERED</div><div class="reg-field-value reg-question">${lord.question}</div></div>`;
  html += `<div class="reg-field"><div class="reg-field-label" style="color:#47525a">ANSWER RECEIVED</div><div class="reg-field-value reg-answer">${lord.answer}</div></div>`;
  html += `<div class="reg-divider"></div>`;
  html += `<div class="reg-field"><div class="reg-field-label" style="color:${lord.color}">INTELLIGENCE FILE</div><div class="reg-field-value reg-intel">${lord.detail}</div></div>`;
  html += `<div class="reg-divider"></div>`;
  html += `<div class="reg-field"><div class="reg-field-label" style="color:#5a8060">KNOWN ALLIANCES</div><div class="reg-field-value reg-alliances">${lord.alliances}</div></div>`;
  html += `<div class="reg-field"><div class="reg-field-label" style="color:#804040">KNOWN ENEMIES</div><div class="reg-field-value reg-enemies">${lord.enemies}</div></div>`;

  // Response button (if situation is active)
  if (regCurrentSituation) {
    html += `<button class="reg-respond-btn" id="regRespondBtn" style="border-color:${lord.color};color:${lord.color}">HOW WOULD ${lord.surname.toUpperCase()} RESPOND?</button>`;
  }

  body.innerHTML = html;

  // Wire respond button
  const respondBtn = document.getElementById('regRespondBtn');
  if (respondBtn) {
    respondBtn.addEventListener('click', () => {
      regSitSelectedLord = lord;
      // Highlight the lord button in situation section too
      document.querySelectorAll('.reg-sit-lord-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lord === lord.id);
      });
      fetchLordResponse(lord);
    });
  }
}

function regField(label, value, color) {
  return `<div class="reg-field"><div class="reg-field-label" style="color:${color}">${label}</div><div class="reg-field-value">${value}</div></div>`;
}

function deselectLord() {
  regSelectedLord = null;
  document.querySelectorAll('.reg-node').forEach(n => {
    n.setAttribute('r', '1.2');
    n.removeAttribute('stroke');
    n.removeAttribute('stroke-width');
    n.style.filter = '';
  });
  document.querySelectorAll('.reg-node-label').forEach(t => t.setAttribute('opacity', '0'));
  document.querySelectorAll('.reg-sit-lord-btn').forEach(btn => btn.classList.remove('active'));

  // Restore list
  const header = document.querySelector('.reg-detail-header');
  header.innerHTML = '<span class="reg-detail-header-text">SELECT A LORD TO VIEW THEIR FILE</span>';
  renderRegistryDetailList();
}

function setupRegistryEvents(workerUrl) {
  // Node clicks
  document.getElementById('regSvg').addEventListener('click', e => {
    const node = e.target.closest('.reg-node');
    if (node) selectLord(node.dataset.lord);
  });

  // Node hover
  document.getElementById('regSvg').addEventListener('mouseover', e => {
    const node = e.target.closest('.reg-node');
    if (node && (!regSelectedLord || regSelectedLord.id !== node.dataset.lord)) {
      node.setAttribute('r', '1.5');
      node.setAttribute('stroke', '#ffffff');
      node.setAttribute('stroke-width', '0.2');
      const label = document.querySelector(`[data-lord-label="${node.dataset.lord}"]`);
      if (label) label.setAttribute('opacity', '1');
    }
  });
  document.getElementById('regSvg').addEventListener('mouseout', e => {
    const node = e.target.closest('.reg-node');
    if (node && (!regSelectedLord || regSelectedLord.id !== node.dataset.lord)) {
      node.setAttribute('r', '1.2');
      node.removeAttribute('stroke');
      node.removeAttribute('stroke-width');
      const label = document.querySelector(`[data-lord-label="${node.dataset.lord}"]`);
      if (label) label.setAttribute('opacity', '0');
    }
  });

  // Relations toggle
  const toggleBtn = document.getElementById('regToggleRelations');
  const legend = document.getElementById('regLegend');
  toggleBtn.addEventListener('click', () => {
    regRelationsVisible = !regRelationsVisible;
    toggleBtn.textContent = regRelationsVisible ? 'HIDE RELATIONS' : 'SHOW RELATIONS';
    document.querySelectorAll('.reg-rel-line').forEach(l => {
      l.style.display = regRelationsVisible ? '' : 'none';
    });
    legend.style.display = regRelationsVisible ? '' : 'none';
  });

  // Build legend
  const uniqueLabels = [];
  REGISTRY_RELATIONSHIPS.forEach(r => {
    if (!uniqueLabels.find(u => u.label === r.label)) {
      uniqueLabels.push({ label: r.label, color: r.color, style: r.style });
    }
  });
  legend.innerHTML = uniqueLabels.map(u => {
    let lineStyle = `background:${u.color}`;
    if (u.style === 'dashed') lineStyle += ';background:repeating-linear-gradient(90deg,' + u.color + ' 0 4px,transparent 4px 6px)';
    if (u.style === 'dotted') lineStyle += ';background:repeating-linear-gradient(90deg,' + u.color + ' 0 2px,transparent 2px 4px)';
    return `<span class="reg-legend-item"><span class="reg-legend-swatch" style="${lineStyle}"></span>${u.label}</span>`;
  }).join('');

  // Hide relation lines initially
  document.querySelectorAll('.reg-rel-line').forEach(l => l.style.display = 'none');

  // Situation generator
  regSituationPool = [...REGISTRY_SITUATIONS];
  shuffleArray(regSituationPool);
  let sitIndex = 0;

  const genBtn = document.getElementById('regSitGenerate');
  genBtn.addEventListener('click', () => {
    if (sitIndex >= regSituationPool.length) {
      regSituationPool = [...REGISTRY_SITUATIONS];
      shuffleArray(regSituationPool);
      sitIndex = 0;
    }
    regCurrentSituation = regSituationPool[sitIndex++];
    document.getElementById('regSitCard').style.display = '';
    document.getElementById('regSitText').textContent = regCurrentSituation;
    genBtn.textContent = 'NEW SITUATION';

    // Show lord selector
    const lordsContainer = document.getElementById('regSitLords');
    lordsContainer.style.display = '';
    const row = document.getElementById('regSitLordsRow');
    row.innerHTML = '';
    OATH_LORDS.forEach(lord => {
      const btn = document.createElement('button');
      btn.className = 'reg-sit-lord-btn';
      btn.dataset.lord = lord.id;
      btn.textContent = lord.surname;
      btn.style.setProperty('--lord-color', lord.color);
      if (regSelectedLord && regSelectedLord.id === lord.id) btn.classList.add('active');
      btn.addEventListener('click', () => {
        document.querySelectorAll('.reg-sit-lord-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        regSitSelectedLord = lord;
        selectLord(lord.id);
        fetchLordResponse(lord);
      });
      row.appendChild(btn);
    });

    // Clear previous response
    document.getElementById('regSitResponse').style.display = 'none';
    document.getElementById('regSitResponse').innerHTML = '';

    // Update detail panel respond button if a lord is selected
    if (regSelectedLord) renderLordDetail(regSelectedLord);
  });

  // Store workerUrl for API calls
  window._registryWorkerUrl = workerUrl;
}

async function fetchLordResponse(lord) {
  const responseDiv = document.getElementById('regSitResponse');
  responseDiv.style.display = '';
  responseDiv.style.borderColor = lord.color;
  responseDiv.innerHTML = `<span class="reg-sit-loading">The Lord considers...</span>`;

  // Disable respond button in detail panel
  const respondBtn = document.getElementById('regRespondBtn');
  if (respondBtn) { respondBtn.disabled = true; respondBtn.style.opacity = '0.4'; }

  try {
    const response = await fetch(window._registryWorkerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'oath-lord',
        lordName: lord.name,
        lordTitle: lord.title,
        lordAug: lord.aug,
        lordAugDesc: lord.augDesc,
        lordAlignment: lord.alignment,
        lordVoice: lord.voice,
        lordAlliances: lord.alliances,
        lordEnemies: lord.enemies,
        situation: regCurrentSituation
      })
    });
    const data = await response.json();
    responseDiv.innerHTML = `<span class="reg-sit-resp-label" style="color:${lord.color}">${lord.name.toUpperCase()} RESPONDS</span><p class="reg-sit-resp-text">${data.answer}</p>`;
  } catch (err) {
    responseDiv.innerHTML = `<span class="reg-sit-resp-label" style="color:#804040">TRANSMISSION ERROR</span><p class="reg-sit-resp-text">Connection to worker failed. Check terminal configuration.</p>`;
  }

  if (respondBtn) { respondBtn.disabled = false; respondBtn.style.opacity = ''; }
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

let questronKbCache = null;
let questronHistory = [];
let questronQuestionCount = 0;
let questronWorkerUrl = '';
const QUESTRON_MAX_QUESTIONS = 5;

function setupQuestron(config) {
  questronWorkerUrl = config.workerUrl;

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

  // Load avatar in terminal header
  const avatar = document.getElementById('qtAvatar');
  avatar.src = Storage.getQuestronAvatarUrl() + '?t=' + Date.now();
  avatar.onload = () => { avatar.style.display = ''; };
  avatar.onerror = () => { avatar.style.display = 'none'; };

  // Wire enter button
  document.getElementById('questronEnterBtn').addEventListener('click', () => {
    openQuestronTerminal();
  });

  // Wire close button
  document.getElementById('questronClose').addEventListener('click', closeQuestronTerminal);

  // Click backdrop to close
  document.getElementById('questronTerminal').addEventListener('click', e => {
    if (e.target.id === 'questronTerminal') closeQuestronTerminal();
  });

  // ESC to close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('questronTerminal').classList.contains('active')) {
      closeQuestronTerminal();
    }
  });

  // Wire input form
  document.getElementById('qtInputForm').addEventListener('submit', e => {
    e.preventDefault();
    sendQuestronMessage(questronWorkerUrl);
  });
}

async function openQuestronTerminal() {
  const terminal = document.getElementById('questronTerminal');
  const messages = document.getElementById('qtMessages');
  const input = document.getElementById('qtInput');
  const sendBtn = document.querySelector('.qt-send-btn');

  // Reset session
  questronQuestionCount = 0;
  questronHistory = [];
  messages.innerHTML = '<div class="qt-line qt-system">BOOTING TERMINAL... ESTABLISHING LINK...</div>';
  input.disabled = false;
  sendBtn.disabled = false;
  updateQuestionCounter();

  terminal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Auto-introduction from Questron
  try {
    // Fetch knowledge base if not cached
    if (questronKbCache === null) {
      try {
        const kbResponse = await fetch(Storage.getQuestronKbUrl() + '?t=' + Date.now());
        questronKbCache = kbResponse.ok ? await kbResponse.text() : '';
      } catch (e) { questronKbCache = ''; }
    }

    const processing = document.createElement('div');
    processing.className = 'qt-processing';
    processing.textContent = 'INITIALIZING';
    messages.appendChild(processing);

    const response = await fetch(questronWorkerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'Introduce yourself briefly. State your designation, your purpose, and that the user has 5 queries available in this session.',
        knowledgeBase: questronKbCache,
        history: []
      })
    });
    const data = await response.json();
    if (processing.parentNode) processing.remove();

    // Clear boot message and show intro
    messages.innerHTML = '';
    const sysLine = document.createElement('div');
    sysLine.className = 'qt-line qt-system';
    sysLine.textContent = 'SYSTEM ONLINE. LINK ESTABLISHED.';
    messages.appendChild(sysLine);

    const introLine = document.createElement('div');
    introLine.className = 'qt-line qt-bot';
    introLine.textContent = data.answer;
    messages.appendChild(introLine);
  } catch (err) {
    messages.innerHTML = '<div class="qt-line qt-system">SYSTEM ONLINE. LINK ESTABLISHED.</div><div class="qt-line qt-bot">I am Questron. Designation QST-7. Synthetic intelligence unit. You have 5 queries available. Proceed.</div>';
  }

  messages.scrollTop = messages.scrollHeight;
  input.focus();
}

function closeQuestronTerminal() {
  const terminal = document.getElementById('questronTerminal');
  terminal.classList.remove('active');
  document.body.style.overflow = '';
}

function updateQuestionCounter() {
  const counter = document.getElementById('qtQuestionCount');
  if (counter) counter.textContent = 'QUERIES: ' + questronQuestionCount + '/' + QUESTRON_MAX_QUESTIONS;
}

async function sendQuestronMessage(workerUrl) {
  const input = document.getElementById('qtInput');
  const messages = document.getElementById('qtMessages');
  const sendBtn = document.querySelector('.qt-send-btn');
  const question = input.value.trim();
  if (!question) return;

  // Check question limit
  if (questronQuestionCount >= QUESTRON_MAX_QUESTIONS) {
    return;
  }

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
        questronKbCache = kbResponse.ok ? await kbResponse.text() : '';
      } catch (e) { questronKbCache = ''; }
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

    // Increment question count
    questronQuestionCount++;
    updateQuestionCounter();

    // Check if limit reached
    if (questronQuestionCount >= QUESTRON_MAX_QUESTIONS) {
      const limitLine = document.createElement('div');
      limitLine.className = 'qt-line qt-system';
      limitLine.textContent = 'SESSION LIMIT REACHED. TERMINAL ACCESS EXHAUSTED. CLOSE AND RE-ENTER TO START A NEW SESSION.';
      messages.appendChild(limitLine);
      input.disabled = true;
      sendBtn.disabled = true;
    }

  } catch (err) {
    if (processing.parentNode) processing.remove();

    const errorLine = document.createElement('div');
    errorLine.className = 'qt-line qt-error';
    errorLine.textContent = 'TRANSMISSION ERROR: CONNECTION TO WORKER FAILED. CHECK TERMINAL CONFIGURATION.';
    messages.appendChild(errorLine);
  }

  messages.scrollTop = messages.scrollHeight;
  input.focus();
}
