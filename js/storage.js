/* ===== DATA STORAGE LAYER =====
   Uses IndexedDB for images (unlimited size) and localStorage for text/metadata.
   Data in localStorage (climbers_site):
     { subtitle, chapters: [{id, title, parts: [{id, title, text}]}], gallery: [{id, label}] }
   Images in IndexedDB (climbers_db / images store):
     key = id string, value = base64 data URL
*/

const STORAGE_KEY = 'climbers_site';
const PASS_KEY = 'climbers_admin_pass';
const SESSION_KEY = 'climbers_admin_session';
const DB_NAME = 'climbers_db';
const DB_VERSION = 1;
const IMG_STORE = 'images';

const DEFAULT_PASS_HASH = 'climbers2026';

// ===== IndexedDB helpers =====
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IMG_STORE)) {
        db.createObjectStore(IMG_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveImage(key, dataURL) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMG_STORE, 'readwrite');
    tx.objectStore(IMG_STORE).put(dataURL, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getImage(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMG_STORE, 'readonly');
    const req = tx.objectStore(IMG_STORE).get(key);
    req.onsuccess = () => resolve(req.result || '');
    req.onerror = () => reject(req.error);
  });
}

async function deleteImage(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMG_STORE, 'readwrite');
    tx.objectStore(IMG_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function clearAllImages() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMG_STORE, 'readwrite');
    tx.objectStore(IMG_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ===== Storage API =====
const Storage = {
  getData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        // Migrate old chapters that have `text` instead of `parts`
        if (data.chapters) {
          data.chapters.forEach(ch => {
            if (!ch.parts) {
              ch.parts = [];
              if (ch.text) {
                ch.parts.push({ id: genId(), title: 'Part I', text: ch.text });
                delete ch.text;
              }
            }
          });
        }
        return data;
      }
    } catch (e) {
      console.error('Storage read error', e);
    }
    return this.getDefaults();
  },

  save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  getDefaults() {
    return {
      subtitle: 'A story waiting to be told...',
      chapters: [],
      gallery: []
    };
  },

  // --- Chapters ---
  getChapters() {
    return this.getData().chapters || [];
  },

  getChapter(id) {
    return this.getChapters().find(c => c.id === id) || null;
  },

  async addChapter(chapter) {
    const data = this.getData();
    chapter.id = genId();
    if (chapter.image) {
      await saveImage('ch_' + chapter.id, chapter.image);
      delete chapter.image;
    }
    if (!chapter.parts) chapter.parts = [];
    data.chapters.push(chapter);
    this.save(data);
    return chapter;
  },

  async updateChapter(id, updates) {
    const data = this.getData();
    const idx = data.chapters.findIndex(c => c.id === id);
    if (idx !== -1) {
      if (updates.image) {
        await saveImage('ch_' + id, updates.image);
        delete updates.image;
      }
      // Preserve parts when updating chapter metadata
      const existing = data.chapters[idx];
      data.chapters[idx] = { ...existing, ...updates, parts: updates.parts || existing.parts };
      this.save(data);
    }
  },

  async removeChapter(id) {
    const data = this.getData();
    data.chapters = data.chapters.filter(c => c.id !== id);
    this.save(data);
    await deleteImage('ch_' + id);
  },

  reorderChapters(orderedIds) {
    const data = this.getData();
    const map = {};
    data.chapters.forEach(c => map[c.id] = c);
    data.chapters = orderedIds.map(id => map[id]).filter(Boolean);
    this.save(data);
  },

  async getChapterImage(id) {
    return await getImage('ch_' + id);
  },

  // --- Parts ---
  addPart(chapterId, part) {
    const data = this.getData();
    const ch = data.chapters.find(c => c.id === chapterId);
    if (!ch) return null;
    part.id = genId();
    ch.parts.push(part);
    this.save(data);
    return part;
  },

  updatePart(chapterId, partId, updates) {
    const data = this.getData();
    const ch = data.chapters.find(c => c.id === chapterId);
    if (!ch) return;
    const idx = ch.parts.findIndex(p => p.id === partId);
    if (idx !== -1) {
      ch.parts[idx] = { ...ch.parts[idx], ...updates };
      this.save(data);
    }
  },

  removePart(chapterId, partId) {
    const data = this.getData();
    const ch = data.chapters.find(c => c.id === chapterId);
    if (!ch) return;
    ch.parts = ch.parts.filter(p => p.id !== partId);
    this.save(data);
  },

  reorderParts(chapterId, orderedIds) {
    const data = this.getData();
    const ch = data.chapters.find(c => c.id === chapterId);
    if (!ch) return;
    const map = {};
    ch.parts.forEach(p => map[p.id] = p);
    ch.parts = orderedIds.map(id => map[id]).filter(Boolean);
    this.save(data);
  },

  // --- Gallery ---
  getGallery() {
    return this.getData().gallery || [];
  },

  async addGalleryItem(item) {
    const data = this.getData();
    item.id = genId();
    if (item.image) {
      await saveImage('gal_' + item.id, item.image);
      delete item.image;
    }
    data.gallery.push(item);
    this.save(data);
    return item;
  },

  async removeGalleryItem(id) {
    const data = this.getData();
    data.gallery = data.gallery.filter(g => g.id !== id);
    this.save(data);
    await deleteImage('gal_' + id);
  },

  reorderGallery(orderedIds) {
    const data = this.getData();
    const map = {};
    data.gallery.forEach(g => map[g.id] = g);
    data.gallery = orderedIds.map(id => map[id]).filter(Boolean);
    this.save(data);
  },

  async getGalleryImage(id) {
    return await getImage('gal_' + id);
  },

  // --- Banner / Site Settings ---
  async updateSiteSettings(settings) {
    const data = this.getData();
    if (settings.subtitle !== undefined) data.subtitle = settings.subtitle;
    if (settings.bannerImage) {
      await saveImage('banner', settings.bannerImage);
    }
    this.save(data);
  },

  async getBannerImage() {
    return await getImage('banner');
  },

  // --- Admin Auth ---
  getPassword() {
    return localStorage.getItem(PASS_KEY) || DEFAULT_PASS_HASH;
  },

  setPassword(pass) {
    localStorage.setItem(PASS_KEY, pass);
  },

  login(pass) {
    if (pass === this.getPassword()) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      return true;
    }
    return false;
  },

  isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  },

  logout() {
    sessionStorage.removeItem(SESSION_KEY);
  },

  // --- Reset ---
  async resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PASS_KEY);
    await clearAllImages();
  },

  // --- Utility: file to compressed base64 data URL ---
  fileToDataURL(file, maxWidth = 1200) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width;
          let h = img.height;
          if (w > maxWidth) {
            h = Math.round(h * maxWidth / w);
            w = maxWidth;
          }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
};
