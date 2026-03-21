/* ===== DATA STORAGE LAYER =====
   Uses localStorage to persist all site content.
   Data structure:
   - climbers_site: { banner, subtitle, bannerImage, chapters[], gallery[] }
   - climbers_admin_pass: hashed admin password
*/

const STORAGE_KEY = 'climbers_site';
const PASS_KEY = 'climbers_admin_pass';
const SESSION_KEY = 'climbers_admin_session';

// Default password is "climbers2026" — admin should change it on first login
const DEFAULT_PASS_HASH = 'climbers2026';

const Storage = {
  getData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Storage read error', e);
    }
    return this.getDefaults();
  },

  save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      alert('Storage limit reached! Try using smaller images (under 1MB each). Error: ' + e.message);
      throw e;
    }
  },

  getDefaults() {
    return {
      banner: 'Climbers',
      subtitle: 'A story waiting to be told...',
      bannerImage: '',
      chapters: [],
      gallery: []
    };
  },

  // --- Chapters ---
  getChapters() {
    return this.getData().chapters || [];
  },

  addChapter(chapter) {
    const data = this.getData();
    chapter.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    data.chapters.push(chapter);
    this.save(data);
    return chapter;
  },

  updateChapter(id, updates) {
    const data = this.getData();
    const idx = data.chapters.findIndex(c => c.id === id);
    if (idx !== -1) {
      data.chapters[idx] = { ...data.chapters[idx], ...updates };
      this.save(data);
    }
  },

  removeChapter(id) {
    const data = this.getData();
    data.chapters = data.chapters.filter(c => c.id !== id);
    this.save(data);
  },

  reorderChapters(orderedIds) {
    const data = this.getData();
    const map = {};
    data.chapters.forEach(c => map[c.id] = c);
    data.chapters = orderedIds.map(id => map[id]).filter(Boolean);
    this.save(data);
  },

  // --- Gallery ---
  getGallery() {
    return this.getData().gallery || [];
  },

  addGalleryItem(item) {
    const data = this.getData();
    item.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    data.gallery.push(item);
    this.save(data);
    return item;
  },

  removeGalleryItem(id) {
    const data = this.getData();
    data.gallery = data.gallery.filter(g => g.id !== id);
    this.save(data);
  },

  reorderGallery(orderedIds) {
    const data = this.getData();
    const map = {};
    data.gallery.forEach(g => map[g.id] = g);
    data.gallery = orderedIds.map(id => map[id]).filter(Boolean);
    this.save(data);
  },

  // --- Banner / Site Settings ---
  updateSiteSettings(settings) {
    const data = this.getData();
    if (settings.banner !== undefined) data.banner = settings.banner;
    if (settings.subtitle !== undefined) data.subtitle = settings.subtitle;
    if (settings.bannerImage !== undefined) data.bannerImage = settings.bannerImage;
    this.save(data);
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
