/* ===== DATA STORAGE LAYER (GitHub-backed) =====
   Content is stored in the GitHub repository so ALL visitors see it:
   - data/site.json  : metadata (chapters, parts, gallery, subtitle)
   - uploads/        : images  (banner.jpg, ch_{id}.jpg, gal_{id}.jpg)

   Admin writes via GitHub API (requires a Personal Access Token).
   The public site reads files directly from GitHub Pages (no token needed).
*/

const REPO_OWNER = 'fintechjunkie';
const REPO_NAME = 'climbers-website';
const DATA_PATH = 'data/site.json';
const GH_API = 'https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + '/contents/';

const GH_TOKEN_KEY = 'climbers_gh_token';
const ADMIN_PASS_KEY = 'climbers_admin_pass';
const SESSION_KEY = 'climbers_admin_session';
const DEFAULT_PASS = 'climbers2026';

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const Storage = {

  // ===== GitHub Token Management =====
  getToken() { return localStorage.getItem(GH_TOKEN_KEY) || ''; },
  setToken(token) { localStorage.setItem(GH_TOKEN_KEY, token.trim()); },
  hasToken() { return !!this.getToken(); },

  async validateToken(token) {
    try {
      const resp = await fetch('https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': 'token ' + token.trim()
        }
      });
      return resp.ok;
    } catch (e) { return false; }
  },

  // ===== GitHub API Helpers =====
  async _ghGet(path) {
    const token = this.getToken();
    const headers = { 'Accept': 'application/vnd.github.v3+json' };
    if (token) headers['Authorization'] = 'token ' + token;
    return fetch(GH_API + path, { headers, cache: 'no-store' });
  },

  async _ghPut(path, base64Content, message) {
    const token = this.getToken();
    if (!token) throw new Error('GitHub token not configured. Go to Settings to add it.');

    // Get existing SHA if file already exists
    let sha = '';
    try {
      const getResp = await this._ghGet(path);
      if (getResp.ok) {
        const existing = await getResp.json();
        sha = existing.sha;
      }
    } catch (e) { /* file doesn't exist yet, that's fine */ }

    const body = { message, content: base64Content };
    if (sha) body.sha = sha;

    const resp = await fetch(GH_API + path, {
      method: 'PUT',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': 'token ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.message || 'GitHub API error: ' + resp.status);
    }
    return resp;
  },

  async _ghDelete(path) {
    const token = this.getToken();
    if (!token) return;

    try {
      const getResp = await this._ghGet(path);
      if (!getResp.ok) return;
      const existing = await getResp.json();

      await fetch(GH_API + path, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': 'token ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Delete ' + path,
          sha: existing.sha
        })
      });
    } catch (e) {
      console.warn('Delete failed:', e);
    }
  },

  // ===== Data Read / Write =====
  async getData() {
    const token = this.getToken();

    // If admin has a token, use GitHub API for always-fresh data
    if (token) {
      try {
        const resp = await this._ghGet(DATA_PATH);
        if (resp.ok) {
          const file = await resp.json();
          const raw = file.content.replace(/\n/g, '');
          return JSON.parse(decodeURIComponent(escape(atob(raw))));
        }
      } catch (e) {
        console.warn('GitHub API read failed, falling back to Pages:', e);
      }
    }

    // Public site (no token): fetch from GitHub Pages directly
    try {
      const resp = await fetch('data/site.json?t=' + Date.now());
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn('Pages fetch failed:', e);
    }

    return this.getDefaults();
  },

  async save(data) {
    const json = JSON.stringify(data, null, 2);
    const base64 = btoa(unescape(encodeURIComponent(json)));
    await this._ghPut(DATA_PATH, base64, 'Update site content');
  },

  async _uploadImage(filename, dataURL) {
    const base64 = dataURL.split(',')[1];
    await this._ghPut('uploads/' + filename, base64, 'Upload ' + filename);
  },

  async _deleteImage(filename) {
    await this._ghDelete('uploads/' + filename);
  },

  getDefaults() {
    return { subtitle: 'A story waiting to be told...', chapters: [], gallery: [], questron: { enabled: false, workerUrl: '' } };
  },

  // ===== Chapters =====
  async getChapters() {
    const data = await this.getData();
    return data.chapters || [];
  },

  async getChapter(id) {
    const chapters = await this.getChapters();
    return chapters.find(c => c.id === id) || null;
  },

  async addChapter(chapter) {
    const data = await this.getData();
    chapter.id = genId();
    if (chapter.image) {
      await this._uploadImage('ch_' + chapter.id + '.jpg', chapter.image);
      delete chapter.image;
    }
    if (!chapter.parts) chapter.parts = [];
    if (!chapter.fanArt) chapter.fanArt = [];
    data.chapters.push(chapter);
    await this.save(data);
    return chapter;
  },

  async updateChapter(id, updates) {
    const data = await this.getData();
    const idx = data.chapters.findIndex(c => c.id === id);
    if (idx !== -1) {
      if (updates.image) {
        await this._uploadImage('ch_' + id + '.jpg', updates.image);
        delete updates.image;
      }
      const existing = data.chapters[idx];
      data.chapters[idx] = { ...existing, ...updates, parts: updates.parts || existing.parts };
      await this.save(data);
    }
  },

  async removeChapter(id) {
    const data = await this.getData();
    data.chapters = data.chapters.filter(c => c.id !== id);
    await this.save(data);
    try { await this._deleteImage('ch_' + id + '.jpg'); } catch (e) {}
  },

  async reorderChapters(orderedIds) {
    const data = await this.getData();
    const map = {};
    data.chapters.forEach(c => map[c.id] = c);
    data.chapters = orderedIds.map(id => map[id]).filter(Boolean);
    await this.save(data);
  },

  getChapterImageUrl(id) {
    return 'uploads/ch_' + id + '.jpg';
  },

  // ===== Parts =====
  async addPart(chapterId, part) {
    const data = await this.getData();
    const ch = data.chapters.find(c => c.id === chapterId);
    if (!ch) return null;
    part.id = genId();
    ch.parts.push(part);
    await this.save(data);
    return part;
  },

  async updatePart(chapterId, partId, updates) {
    const data = await this.getData();
    const ch = data.chapters.find(c => c.id === chapterId);
    if (!ch) return;
    const idx = ch.parts.findIndex(p => p.id === partId);
    if (idx !== -1) {
      ch.parts[idx] = { ...ch.parts[idx], ...updates };
      await this.save(data);
    }
  },

  async removePart(chapterId, partId) {
    const data = await this.getData();
    const ch = data.chapters.find(c => c.id === chapterId);
    if (!ch) return;
    ch.parts = ch.parts.filter(p => p.id !== partId);
    await this.save(data);
  },

  async reorderParts(chapterId, orderedIds) {
    const data = await this.getData();
    const ch = data.chapters.find(c => c.id === chapterId);
    if (!ch) return;
    const map = {};
    ch.parts.forEach(p => map[p.id] = p);
    ch.parts = orderedIds.map(id => map[id]).filter(Boolean);
    await this.save(data);
  },

  // ===== Gallery =====
  async getGallery() {
    const data = await this.getData();
    return data.gallery || [];
  },

  async addGalleryItem(item) {
    const data = await this.getData();
    item.id = genId();
    if (item.image) {
      await this._uploadImage('gal_' + item.id + '.jpg', item.image);
      delete item.image;
    }
    data.gallery.push(item);
    await this.save(data);
    return item;
  },

  async updateGalleryItem(id, updates) {
    const data = await this.getData();
    const idx = data.gallery.findIndex(g => g.id === id);
    if (idx !== -1) {
      if (updates.image) {
        await this._uploadImage('gal_' + id + '.jpg', updates.image);
        delete updates.image;
      }
      data.gallery[idx] = { ...data.gallery[idx], ...updates };
      await this.save(data);
    }
  },

  async removeGalleryItem(id) {
    const data = await this.getData();
    data.gallery = data.gallery.filter(g => g.id !== id);
    await this.save(data);
    try { await this._deleteImage('gal_' + id + '.jpg'); } catch (e) {}
  },

  async reorderGallery(orderedIds) {
    const data = await this.getData();
    const map = {};
    data.gallery.forEach(g => map[g.id] = g);
    data.gallery = orderedIds.map(id => map[id]).filter(Boolean);
    await this.save(data);
  },

  getGalleryImageUrl(id) {
    return 'uploads/gal_' + id + '.jpg';
  },

  getGalleryVideoUrl(id) {
    return 'uploads/vid_' + id + '.mp4';
  },

  // ===== Fan Art =====
  async addFanArt(chapterId, item) {
    const data = await this.getData();
    const ch = data.chapters.find(c => c.id === chapterId);
    if (!ch) return null;
    if (!ch.fanArt) ch.fanArt = [];
    item.id = genId();
    if (item.image) {
      await this._uploadImage('fa_' + chapterId + '_' + item.id + '.jpg', item.image);
      delete item.image;
    }
    ch.fanArt.push(item);
    await this.save(data);
    return item;
  },

  async removeFanArt(chapterId, artId) {
    const data = await this.getData();
    const ch = data.chapters.find(c => c.id === chapterId);
    if (!ch) return;
    ch.fanArt = (ch.fanArt || []).filter(a => a.id !== artId);
    await this.save(data);
    try { await this._deleteImage('fa_' + chapterId + '_' + artId + '.jpg'); } catch (e) {}
  },

  getFanArtImageUrl(chapterId, artId) {
    return 'uploads/fa_' + chapterId + '_' + artId + '.jpg';
  },

  // ===== Questron =====
  async updateQuestronSettings(settings) {
    const data = await this.getData();
    if (!data.questron) data.questron = { enabled: false, workerUrl: '' };
    if (settings.enabled !== undefined) data.questron.enabled = settings.enabled;
    if (settings.workerUrl !== undefined) data.questron.workerUrl = settings.workerUrl;
    if (settings.headerImage) {
      await this._uploadImage('questron_header.jpg', settings.headerImage);
    }
    if (settings.avatarImage) {
      await this._uploadImage('questron_avatar.jpg', settings.avatarImage);
    }
    if (settings.kbFile) {
      await this._uploadImage('questron_kb.txt', settings.kbFile);
    }
    await this.save(data);
  },

  getQuestronHeaderUrl() {
    return 'uploads/questron_header.jpg';
  },

  getQuestronAvatarUrl() {
    return 'uploads/questron_avatar.jpg';
  },

  getQuestronKbUrl() {
    return 'uploads/questron_kb.txt';
  },

  // ===== Oath Lords =====
  async getOathLords() {
    const data = await this.getData();
    return data.oathLords || null; // null means use hardcoded defaults
  },

  async saveOathLords(lords) {
    const data = await this.getData();
    data.oathLords = lords;
    await this.save(data);
  },

  async updateOathLord(id, updates) {
    const data = await this.getData();
    if (!data.oathLords) return;
    const idx = data.oathLords.findIndex(l => l.id === id);
    if (idx !== -1) {
      if (updates.portraitImage) {
        await this._uploadImage('lord_' + id + '_portrait.jpg', updates.portraitImage);
        delete updates.portraitImage;
      }
      if (updates.factionImage) {
        await this._uploadImage('lord_' + id + '_faction.png', updates.factionImage);
        delete updates.factionImage;
      }
      data.oathLords[idx] = { ...data.oathLords[idx], ...updates };
      await this.save(data);
    }
  },

  getLordPortraitUrl(id) {
    return 'uploads/lord_' + id + '_portrait.jpg';
  },

  getLordFactionUrl(id) {
    return 'uploads/lord_' + id + '_faction.png';
  },

  // ===== Archive Events =====
  async getArchiveEvents() {
    const data = await this.getData();
    return data.archiveEvents || null; // null means use hardcoded defaults
  },

  async saveArchiveEvents(events) {
    const data = await this.getData();
    data.archiveEvents = events;
    await this.save(data);
  },

  async updateArchiveEvent(id, updates) {
    const data = await this.getData();
    if (!data.archiveEvents) return;
    const idx = data.archiveEvents.findIndex(e => e.id === id);
    if (idx !== -1) {
      if (updates.eventImage) {
        await this._uploadImage('archive_' + id + '.jpg', updates.eventImage);
        delete updates.eventImage;
      }
      data.archiveEvents[idx] = { ...data.archiveEvents[idx], ...updates };
      await this.save(data);
    }
  },

  getArchiveEventImageUrl(id) {
    return 'uploads/archive_' + id + '.jpg';
  },

  // ===== Banner / Site Settings =====
  async updateSiteSettings(settings) {
    const data = await this.getData();
    if (settings.subtitle !== undefined) data.subtitle = settings.subtitle;
    if (settings.bannerImage) {
      await this._uploadImage('banner.jpg', settings.bannerImage);
    }
    await this.save(data);
  },

  getBannerImageUrl() {
    return 'uploads/banner.jpg';
  },

  getAmbientAudioUrl() {
    return 'uploads/ambient_audio.mp3';
  },

  // ===== Admin Auth (browser-local only) =====
  getPassword() { return localStorage.getItem(ADMIN_PASS_KEY) || DEFAULT_PASS; },
  setPassword(pass) { localStorage.setItem(ADMIN_PASS_KEY, pass); },
  login(pass) {
    if (pass === this.getPassword()) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      return true;
    }
    return false;
  },
  isLoggedIn() { return sessionStorage.getItem(SESSION_KEY) === 'true'; },
  logout() { sessionStorage.removeItem(SESSION_KEY); },

  // ===== Reset =====
  async resetAll() {
    await this.save(this.getDefaults());
    localStorage.removeItem(ADMIN_PASS_KEY);
  },

  // ===== Utility: file to compressed base64 =====
  fileToDataURL(file, maxWidth = 1200) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
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
