/* ===== ADMIN PANEL LOGIC ===== */

document.addEventListener('DOMContentLoaded', () => {
  const loginScreen = document.getElementById('loginScreen');
  const dashboard = document.getElementById('adminDashboard');

  // Check if already logged in
  if (Storage.isLoggedIn()) {
    showDashboard();
  }

  // --- Login ---
  document.getElementById('loginBtn').addEventListener('click', attemptLogin);
  document.getElementById('loginPass').addEventListener('keydown', e => {
    if (e.key === 'Enter') attemptLogin();
  });

  function attemptLogin() {
    const pass = document.getElementById('loginPass').value;
    if (Storage.login(pass)) {
      showDashboard();
    } else {
      document.getElementById('loginError').style.display = 'block';
    }
  }

  function showDashboard() {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'block';
    loadBannerSettings();
    loadChaptersList();
    loadGalleryList();
  }

  // --- Logout ---
  document.getElementById('logoutBtn').addEventListener('click', () => {
    Storage.logout();
    location.reload();
  });

  // --- Tabs ---
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });

  // ===========================
  // BANNER & SITE INFO
  // ===========================
  function loadBannerSettings() {
    const data = Storage.getData();
    document.getElementById('bannerTitle').value = data.banner || '';
    document.getElementById('bannerSubtitle').value = data.subtitle || '';
    if (data.bannerImage) {
      showImagePreview('bannerImagePreview', data.bannerImage);
    }
  }

  document.getElementById('saveBannerBtn').addEventListener('click', async () => {
    const title = document.getElementById('bannerTitle').value.trim();
    const subtitle = document.getElementById('bannerSubtitle').value.trim();
    const fileInput = document.getElementById('bannerImageFile');

    const settings = {};
    if (title) settings.banner = title;
    if (subtitle) settings.subtitle = subtitle;

    if (fileInput.files.length > 0) {
      settings.bannerImage = await Storage.fileToDataURL(fileInput.files[0]);
    }

    Storage.updateSiteSettings(settings);
    showMessage('bannerMsg', 'Banner settings saved!', 'success');
    loadBannerSettings();
  });

  // ===========================
  // CHAPTERS
  // ===========================
  function loadChaptersList() {
    const chapters = Storage.getChapters();
    const list = document.getElementById('chaptersList');

    if (chapters.length === 0) {
      list.innerHTML = '<p class="empty-state">No chapters yet. Add your first chapter above.</p>';
      return;
    }

    list.innerHTML = '';
    chapters.forEach((ch, idx) => {
      const item = document.createElement('div');
      item.className = 'content-item';

      // Order controls
      const orderDiv = document.createElement('div');
      orderDiv.className = 'order-controls';

      const upBtn = document.createElement('button');
      upBtn.className = 'order-btn';
      upBtn.innerHTML = '&#9650;';
      upBtn.title = 'Move up';
      upBtn.disabled = idx === 0;
      upBtn.addEventListener('click', () => moveChapter(idx, -1));

      const downBtn = document.createElement('button');
      downBtn.className = 'order-btn';
      downBtn.innerHTML = '&#9660;';
      downBtn.title = 'Move down';
      downBtn.disabled = idx === chapters.length - 1;
      downBtn.addEventListener('click', () => moveChapter(idx, 1));

      orderDiv.appendChild(upBtn);
      orderDiv.appendChild(downBtn);

      // Thumbnail
      const img = document.createElement('img');
      img.src = ch.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="%23222"><rect width="80" height="80"/></svg>';
      img.alt = ch.title;

      // Info
      const info = document.createElement('div');
      info.className = 'item-info';
      info.innerHTML = '<h3>' + escapeHtml(ch.title) + '</h3><p>' + escapeHtml((ch.text || '').substring(0, 120)) + '...</p>';

      // Actions
      const actions = document.createElement('div');
      actions.className = 'item-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-secondary';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => editChapter(ch));

      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-danger';
      delBtn.textContent = 'Remove';
      delBtn.addEventListener('click', () => {
        if (confirm('Remove "' + ch.title + '"? This cannot be undone.')) {
          Storage.removeChapter(ch.id);
          loadChaptersList();
          showMessage('chaptersMsg', 'Chapter removed.', 'success');
        }
      });

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      item.appendChild(orderDiv);
      item.appendChild(img);
      item.appendChild(info);
      item.appendChild(actions);
      list.appendChild(item);
    });
  }

  function moveChapter(fromIdx, direction) {
    const chapters = Storage.getChapters();
    const toIdx = fromIdx + direction;
    if (toIdx < 0 || toIdx >= chapters.length) return;
    const ids = chapters.map(c => c.id);
    [ids[fromIdx], ids[toIdx]] = [ids[toIdx], ids[fromIdx]];
    Storage.reorderChapters(ids);
    loadChaptersList();
  }

  document.getElementById('addChapterBtn').addEventListener('click', async () => {
    const title = document.getElementById('chapterTitle').value.trim();
    const text = document.getElementById('chapterText').value;
    const fileInput = document.getElementById('chapterImage');

    if (!title) {
      showMessage('chaptersMsg', 'Please enter a chapter title.', 'error');
      return;
    }

    let image = '';
    if (fileInput.files.length > 0) {
      image = await Storage.fileToDataURL(fileInput.files[0]);
    }

    Storage.addChapter({ title, text, image });

    // Clear form
    document.getElementById('chapterTitle').value = '';
    document.getElementById('chapterText').value = '';
    fileInput.value = '';

    loadChaptersList();
    showMessage('chaptersMsg', '"' + title + '" added!', 'success');
  });

  function editChapter(ch) {
    const newTitle = prompt('Chapter title:', ch.title);
    if (newTitle === null) return;
    const newText = prompt('Chapter text (you can paste long text here):', ch.text);
    if (newText === null) return;

    Storage.updateChapter(ch.id, { title: newTitle, text: newText });
    loadChaptersList();
    showMessage('chaptersMsg', 'Chapter updated.', 'success');
  }

  // ===========================
  // GALLERY
  // ===========================
  function loadGalleryList() {
    const gallery = Storage.getGallery();
    const list = document.getElementById('galleryList');

    if (gallery.length === 0) {
      list.innerHTML = '<p class="empty-state">No gallery items yet. Add your first image above.</p>';
      return;
    }

    list.innerHTML = '';
    gallery.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'content-item';

      // Order controls
      const orderDiv = document.createElement('div');
      orderDiv.className = 'order-controls';

      const upBtn = document.createElement('button');
      upBtn.className = 'order-btn';
      upBtn.innerHTML = '&#9650;';
      upBtn.title = 'Move up';
      upBtn.disabled = idx === 0;
      upBtn.addEventListener('click', () => moveGallery(idx, -1));

      const downBtn = document.createElement('button');
      downBtn.className = 'order-btn';
      downBtn.innerHTML = '&#9660;';
      downBtn.title = 'Move down';
      downBtn.disabled = idx === gallery.length - 1;
      downBtn.addEventListener('click', () => moveGallery(idx, 1));

      orderDiv.appendChild(upBtn);
      orderDiv.appendChild(downBtn);

      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.label || '';

      const info = document.createElement('div');
      info.className = 'item-info';
      info.innerHTML = '<h3>' + escapeHtml(item.label || 'Untitled') + '</h3>';

      const actions = document.createElement('div');
      actions.className = 'item-actions';

      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-danger';
      delBtn.textContent = 'Remove';
      delBtn.addEventListener('click', () => {
        if (confirm('Remove this gallery item?')) {
          Storage.removeGalleryItem(item.id);
          loadGalleryList();
          showMessage('galleryMsg', 'Gallery item removed.', 'success');
        }
      });

      actions.appendChild(delBtn);

      div.appendChild(orderDiv);
      div.appendChild(img);
      div.appendChild(info);
      div.appendChild(actions);
      list.appendChild(div);
    });
  }

  function moveGallery(fromIdx, direction) {
    const gallery = Storage.getGallery();
    const toIdx = fromIdx + direction;
    if (toIdx < 0 || toIdx >= gallery.length) return;
    const ids = gallery.map(g => g.id);
    [ids[fromIdx], ids[toIdx]] = [ids[toIdx], ids[fromIdx]];
    Storage.reorderGallery(ids);
    loadGalleryList();
  }

  document.getElementById('addGalleryBtn').addEventListener('click', async () => {
    const label = document.getElementById('galleryLabel').value.trim();
    const fileInput = document.getElementById('galleryImage');

    if (fileInput.files.length === 0) {
      showMessage('galleryMsg', 'Please select an image.', 'error');
      return;
    }

    const image = await Storage.fileToDataURL(fileInput.files[0]);
    Storage.addGalleryItem({ label, image });

    document.getElementById('galleryLabel').value = '';
    fileInput.value = '';

    loadGalleryList();
    showMessage('galleryMsg', 'Image added to gallery!', 'success');
  });

  // ===========================
  // SETTINGS
  // ===========================
  document.getElementById('changePassBtn').addEventListener('click', () => {
    const current = document.getElementById('currentPass').value;
    const newP = document.getElementById('newPass').value;
    const confirm2 = document.getElementById('confirmPass').value;

    if (current !== Storage.getPassword()) {
      showMessage('settingsMsg', 'Current password is incorrect.', 'error');
      return;
    }
    if (newP.length < 4) {
      showMessage('settingsMsg', 'New password must be at least 4 characters.', 'error');
      return;
    }
    if (newP !== confirm2) {
      showMessage('settingsMsg', 'New passwords do not match.', 'error');
      return;
    }

    Storage.setPassword(newP);
    document.getElementById('currentPass').value = '';
    document.getElementById('newPass').value = '';
    document.getElementById('confirmPass').value = '';
    showMessage('settingsMsg', 'Password changed successfully!', 'success');
  });

  document.getElementById('resetDataBtn').addEventListener('click', () => {
    if (confirm('Are you SURE you want to delete all content? This cannot be undone.')) {
      if (confirm('Last chance — this will remove all chapters, gallery items, and settings.')) {
        localStorage.removeItem('climbers_site');
        localStorage.removeItem('climbers_admin_pass');
        showMessage('settingsMsg', 'All data has been reset.', 'success');
        loadBannerSettings();
        loadChaptersList();
        loadGalleryList();
      }
    }
  });

  // ===========================
  // HELPERS
  // ===========================
  function showMessage(containerId, text, type) {
    const el = document.getElementById(containerId);
    el.className = 'admin-message ' + type;
    el.textContent = text;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
  }

  function showImagePreview(containerId, src) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<img src="' + src + '" style="max-height:150px;border-radius:8px;margin-top:.5rem">';
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
