/* ===== ADMIN PANEL LOGIC ===== */

document.addEventListener('DOMContentLoaded', () => {
  const loginScreen = document.getElementById('loginScreen');
  const dashboard = document.getElementById('adminDashboard');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const loadingText = document.getElementById('loadingText');
  const tokenBanner = document.getElementById('tokenBanner');

  // --- Loading helpers ---
  function showLoading(msg) {
    loadingText.textContent = msg || 'Saving to GitHub...';
    loadingOverlay.style.display = 'flex';
  }
  function hideLoading() {
    loadingOverlay.style.display = 'none';
  }

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

  async function showDashboard() {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'block';

    // Show token warning if not configured
    if (!Storage.hasToken()) {
      tokenBanner.style.display = 'block';
    } else {
      tokenBanner.style.display = 'none';
    }

    // Load GitHub token field
    document.getElementById('ghTokenInput').value = Storage.getToken() ? '********' : '';

    await loadBannerSettings();
    await loadChaptersList();
    await loadGalleryList();
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
  // GITHUB TOKEN SETUP
  // ===========================
  document.getElementById('saveTokenBtn').addEventListener('click', async () => {
    const input = document.getElementById('ghTokenInput');
    const token = input.value.trim();

    if (!token || token === '********') {
      showMessage('settingsMsg', 'Please enter a valid token.', 'error');
      return;
    }

    showLoading('Validating token...');
    const valid = await Storage.validateToken(token);
    hideLoading();

    if (valid) {
      Storage.setToken(token);
      input.value = '********';
      tokenBanner.style.display = 'none';
      showMessage('settingsMsg', 'GitHub token saved! You can now manage content.', 'success');
    } else {
      showMessage('settingsMsg', 'Invalid token. Make sure it has "repo" permissions for ' + 'fintechjunkie/climbers-website.', 'error');
    }
  });

  document.getElementById('setupTokenBtn').addEventListener('click', () => {
    // Switch to settings tab
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    document.querySelector('[data-tab="settings-panel"]').classList.add('active');
    document.getElementById('settings-panel').classList.add('active');
    document.getElementById('ghTokenInput').focus();
  });

  // ===========================
  // BANNER & SITE INFO
  // ===========================
  async function loadBannerSettings() {
    const data = await Storage.getData();
    document.getElementById('bannerSubtitle').value = data.subtitle || '';

    // Show banner image preview
    const previewContainer = document.getElementById('bannerImagePreview');
    previewContainer.innerHTML = '';
    const previewImg = document.createElement('img');
    previewImg.src = Storage.getBannerImageUrl();
    previewImg.style.cssText = 'max-height:150px;border-radius:8px;margin-top:.5rem';
    previewImg.onload = () => { previewContainer.appendChild(previewImg); };
  }

  document.getElementById('saveBannerBtn').addEventListener('click', async () => {
    if (!Storage.hasToken()) {
      showMessage('bannerMsg', 'Set up your GitHub token in Settings first.', 'error');
      return;
    }

    const subtitle = document.getElementById('bannerSubtitle').value.trim();
    const fileInput = document.getElementById('bannerImageFile');

    try {
      showLoading('Saving banner settings...');
      const settings = {};
      if (subtitle) settings.subtitle = subtitle;
      if (fileInput.files.length > 0) {
        showLoading('Uploading banner image...');
        settings.bannerImage = await Storage.fileToDataURL(fileInput.files[0]);
      }
      await Storage.updateSiteSettings(settings);
      hideLoading();
      showMessage('bannerMsg', 'Banner settings saved!', 'success');
      fileInput.value = '';
      await loadBannerSettings();
    } catch (err) {
      hideLoading();
      showMessage('bannerMsg', 'Failed to save: ' + err.message, 'error');
    }
  });

  // ===========================
  // CHAPTERS
  // ===========================
  const chapterFormBox = document.getElementById('chapterFormBox');
  const chapterFormTitle = document.getElementById('chapterFormTitle');
  const chapterTitleInput = document.getElementById('chapterTitle');
  const chapterImageInput = document.getElementById('chapterImage');
  const chapterImagePreview = document.getElementById('chapterImagePreview');
  const saveChapterBtn = document.getElementById('saveChapterBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const editingIdInput = document.getElementById('editingChapterId');

  // Save (add or update)
  saveChapterBtn.addEventListener('click', async () => {
    if (!Storage.hasToken()) {
      showMessage('chaptersMsg', 'Set up your GitHub token in Settings first.', 'error');
      return;
    }

    const title = chapterTitleInput.value.trim();
    const editingId = editingIdInput.value;

    if (!title) {
      showMessage('chaptersMsg', 'Please enter a chapter title.', 'error');
      return;
    }

    try {
      let image = '';
      if (chapterImageInput.files.length > 0) {
        image = await Storage.fileToDataURL(chapterImageInput.files[0]);
      }

      if (editingId) {
        showLoading('Updating chapter...');
        const updates = { title };
        if (image) updates.image = image;
        await Storage.updateChapter(editingId, updates);
        hideLoading();
        showMessage('chaptersMsg', 'Chapter updated!', 'success');
      } else {
        showLoading('Adding chapter...');
        await Storage.addChapter({ title, image });
        hideLoading();
        showMessage('chaptersMsg', '"' + title + '" added!', 'success');
      }

      resetChapterForm();
      await loadChaptersList();
    } catch (err) {
      hideLoading();
      showMessage('chaptersMsg', 'Failed: ' + err.message, 'error');
    }
  });

  cancelEditBtn.addEventListener('click', () => {
    resetChapterForm();
  });

  function resetChapterForm() {
    chapterTitleInput.value = '';
    chapterImageInput.value = '';
    chapterImagePreview.innerHTML = '';
    editingIdInput.value = '';
    chapterFormTitle.textContent = 'Add New Chapter';
    saveChapterBtn.textContent = 'Add Chapter';
    cancelEditBtn.style.display = 'none';
    chapterFormBox.classList.remove('editing');
  }

  function startEditChapter(ch) {
    chapterTitleInput.value = ch.title;
    editingIdInput.value = ch.id;
    chapterFormTitle.textContent = 'Editing: ' + ch.title;
    saveChapterBtn.textContent = 'Save Changes';
    cancelEditBtn.style.display = '';
    chapterFormBox.classList.add('editing');

    // Show current image preview
    chapterImagePreview.innerHTML = '';
    const img = document.createElement('img');
    img.src = Storage.getChapterImageUrl(ch.id);
    img.style.cssText = 'max-height:150px;border-radius:8px;margin-top:.5rem';
    img.onload = () => { chapterImagePreview.appendChild(img); };

    chapterFormBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Chapter list
  async function loadChaptersList() {
    const data = await Storage.getData();
    const chapters = data.chapters || [];
    const list = document.getElementById('chaptersList');

    if (chapters.length === 0) {
      list.innerHTML = '<p class="empty-state">No chapters yet. Add your first chapter above.</p>';
      return;
    }

    list.innerHTML = '';
    for (let idx = 0; idx < chapters.length; idx++) {
      const ch = chapters[idx];
      const wrapper = document.createElement('div');
      wrapper.style.marginBottom = '1rem';

      // --- Main row ---
      const item = document.createElement('div');
      item.className = 'content-item';
      item.style.marginBottom = '0';

      // Order controls
      const orderDiv = document.createElement('div');
      orderDiv.className = 'order-controls';
      const upBtn = createOrderBtn('\u25B2', 'Move up', idx === 0);
      upBtn.addEventListener('click', () => { moveChapter(idx, -1); });
      const downBtn = createOrderBtn('\u25BC', 'Move down', idx === chapters.length - 1);
      downBtn.addEventListener('click', () => { moveChapter(idx, 1); });
      orderDiv.appendChild(upBtn);
      orderDiv.appendChild(downBtn);

      // Thumbnail
      const img = document.createElement('img');
      img.src = Storage.getChapterImageUrl(ch.id);
      img.alt = ch.title;
      img.onerror = () => {
        img.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#222"/></svg>');
        img.onerror = null;
      };

      // Info
      const info = document.createElement('div');
      info.className = 'item-info';
      const partCount = (ch.parts || []).length;
      info.innerHTML = '<h3>' + escapeHtml(ch.title) + '</h3><p>' + partCount + ' part' + (partCount !== 1 ? 's' : '') + '</p>';

      // Actions
      const actions = document.createElement('div');
      actions.className = 'item-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-secondary';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => startEditChapter(ch));

      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-danger';
      delBtn.textContent = 'Remove';
      delBtn.addEventListener('click', async () => {
        if (confirm('Remove "' + ch.title + '" and all its parts? This cannot be undone.')) {
          try {
            showLoading('Removing chapter...');
            await Storage.removeChapter(ch.id);
            hideLoading();
            resetChapterForm();
            await loadChaptersList();
            showMessage('chaptersMsg', 'Chapter removed.', 'success');
          } catch (err) {
            hideLoading();
            showMessage('chaptersMsg', 'Failed: ' + err.message, 'error');
          }
        }
      });

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      item.appendChild(orderDiv);
      item.appendChild(img);
      item.appendChild(info);
      item.appendChild(actions);
      wrapper.appendChild(item);

      // --- Parts section ---
      const partsSection = document.createElement('div');
      partsSection.className = 'chapter-parts-section';
      partsSection.innerHTML = '<h4>Parts</h4>';

      const partsContainer = document.createElement('div');
      (ch.parts || []).forEach((part, pIdx) => {
        const partItem = createPartItem(ch.id, part, pIdx, ch.parts.length);
        partsContainer.appendChild(partItem);
      });
      partsSection.appendChild(partsContainer);

      // Add part form
      const addPartBtn = document.createElement('button');
      addPartBtn.className = 'btn btn-secondary';
      addPartBtn.textContent = '+ Add Part';
      addPartBtn.style.marginTop = '.5rem';
      addPartBtn.style.fontSize = '.8rem';

      const addPartForm = document.createElement('div');
      addPartForm.className = 'add-part-form';
      addPartForm.style.display = 'none';

      addPartForm.innerHTML =
        '<div class="form-group"><label>Part Title</label>' +
        '<input type="text" class="part-title-input" placeholder="Part ' + toRoman((ch.parts || []).length + 1) + '"></div>' +
        '<div class="form-group"><label>Part Text</label>' +
        '<textarea class="part-text-input" placeholder="Paste or type the part text here..." style="min-height:200px;resize:vertical"></textarea></div>' +
        '<div style="display:flex;gap:.5rem">' +
        '<button class="btn btn-primary save-part-btn" style="font-size:.85rem">Save Part</button>' +
        '<button class="btn btn-secondary cancel-part-btn" style="font-size:.85rem">Cancel</button></div>';

      addPartBtn.addEventListener('click', async () => {
        addPartForm.style.display = '';
        addPartBtn.style.display = 'none';
        // Refresh chapter data to get accurate part count
        const freshCh = await Storage.getChapter(ch.id);
        const nextNum = (freshCh ? freshCh.parts.length : 0) + 1;
        addPartForm.querySelector('.part-title-input').value = 'Part ' + toRoman(nextNum);
        addPartForm.querySelector('.part-text-input').value = '';
        addPartForm.querySelector('.part-title-input').focus();
      });

      addPartForm.querySelector('.cancel-part-btn').addEventListener('click', () => {
        addPartForm.style.display = 'none';
        addPartBtn.style.display = '';
      });

      addPartForm.querySelector('.save-part-btn').addEventListener('click', async () => {
        const partTitle = addPartForm.querySelector('.part-title-input').value.trim();
        const partText = addPartForm.querySelector('.part-text-input').value;
        if (!partTitle) { alert('Please enter a part title.'); return; }

        try {
          showLoading('Adding part...');
          await Storage.addPart(ch.id, { title: partTitle, text: partText });
          hideLoading();
          await loadChaptersList();
          showMessage('chaptersMsg', 'Part added!', 'success');
        } catch (err) {
          hideLoading();
          showMessage('chaptersMsg', 'Failed: ' + err.message, 'error');
        }
      });

      partsSection.appendChild(addPartBtn);
      partsSection.appendChild(addPartForm);
      wrapper.appendChild(partsSection);

      list.appendChild(wrapper);
    }
  }

  function createPartItem(chapterId, part, pIdx, totalParts) {
    const partItem = document.createElement('div');
    partItem.className = 'part-item';

    const pOrder = document.createElement('div');
    pOrder.className = 'order-controls';
    const pUp = createOrderBtn('\u25B2', 'Move up', pIdx === 0);
    pUp.addEventListener('click', () => { movePart(chapterId, pIdx, -1); });
    const pDown = createOrderBtn('\u25BC', 'Move down', pIdx === totalParts - 1);
    pDown.addEventListener('click', () => { movePart(chapterId, pIdx, 1); });
    pOrder.appendChild(pUp);
    pOrder.appendChild(pDown);

    const pInfo = document.createElement('div');
    pInfo.className = 'part-info';
    const preview = (part.text || '').substring(0, 80);
    pInfo.innerHTML = '<strong>' + escapeHtml(part.title) + '</strong><p>' + escapeHtml(preview) + (preview.length >= 80 ? '...' : '') + '</p>';

    const pActions = document.createElement('div');
    pActions.className = 'part-actions';

    const pEditBtn = document.createElement('button');
    pEditBtn.className = 'btn btn-secondary';
    pEditBtn.textContent = 'Edit';
    pEditBtn.addEventListener('click', () => startEditPart(chapterId, part));

    const pDelBtn = document.createElement('button');
    pDelBtn.className = 'btn btn-danger';
    pDelBtn.textContent = 'Remove';
    pDelBtn.addEventListener('click', async () => {
      if (confirm('Remove "' + part.title + '"?')) {
        try {
          showLoading('Removing part...');
          await Storage.removePart(chapterId, part.id);
          hideLoading();
          await loadChaptersList();
          showMessage('chaptersMsg', 'Part removed.', 'success');
        } catch (err) {
          hideLoading();
          showMessage('chaptersMsg', 'Failed: ' + err.message, 'error');
        }
      }
    });

    pActions.appendChild(pEditBtn);
    pActions.appendChild(pDelBtn);

    partItem.appendChild(pOrder);
    partItem.appendChild(pInfo);
    partItem.appendChild(pActions);
    return partItem;
  }

  function startEditPart(chapterId, part) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;padding:2rem';

    const box = document.createElement('div');
    box.style.cssText = 'background:#1a1a1a;border:1px solid #c9a84c;border-radius:12px;padding:1.5rem;width:100%;max-width:700px;max-height:90vh;overflow-y:auto';

    box.innerHTML =
      '<h3 style="color:#c9a84c;margin-bottom:1rem">Edit Part</h3>' +
      '<div class="form-group"><label style="color:#c9a84c;font-weight:600;font-size:.9rem">Part Title</label>' +
      '<input type="text" id="editPartTitle" style="width:100%;padding:.75rem 1rem;background:#111;border:1px solid #333;border-radius:8px;color:#e0e0e0;font-size:1rem" value="' + escapeAttr(part.title) + '"></div>' +
      '<div class="form-group"><label style="color:#c9a84c;font-weight:600;font-size:.9rem">Part Text</label>' +
      '<textarea id="editPartText" style="width:100%;padding:.75rem 1rem;background:#111;border:1px solid #333;border-radius:8px;color:#e0e0e0;font-size:1rem;font-family:inherit;min-height:300px;resize:vertical">' + escapeHtml(part.text || '') + '</textarea></div>' +
      '<div style="display:flex;gap:.75rem">' +
      '<button class="btn btn-primary" id="saveEditPartBtn">Save Changes</button>' +
      '<button class="btn btn-secondary" id="cancelEditPartBtn">Cancel</button></div>';

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    document.getElementById('editPartTitle').focus();

    document.getElementById('saveEditPartBtn').addEventListener('click', async () => {
      const newTitle = document.getElementById('editPartTitle').value.trim();
      const newText = document.getElementById('editPartText').value;
      if (!newTitle) { alert('Part title is required.'); return; }

      try {
        showLoading('Saving part...');
        await Storage.updatePart(chapterId, part.id, { title: newTitle, text: newText });
        hideLoading();
        document.body.removeChild(overlay);
        await loadChaptersList();
        showMessage('chaptersMsg', 'Part updated!', 'success');
      } catch (err) {
        hideLoading();
        showMessage('chaptersMsg', 'Failed: ' + err.message, 'error');
      }
    });

    document.getElementById('cancelEditPartBtn').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    overlay.addEventListener('click', e => {
      if (e.target === overlay) document.body.removeChild(overlay);
    });
  }

  async function moveChapter(fromIdx, direction) {
    try {
      const chapters = await Storage.getChapters();
      const toIdx = fromIdx + direction;
      if (toIdx < 0 || toIdx >= chapters.length) return;
      const ids = chapters.map(c => c.id);
      [ids[fromIdx], ids[toIdx]] = [ids[toIdx], ids[fromIdx]];
      showLoading('Reordering...');
      await Storage.reorderChapters(ids);
      hideLoading();
      await loadChaptersList();
    } catch (err) {
      hideLoading();
      showMessage('chaptersMsg', 'Failed: ' + err.message, 'error');
    }
  }

  async function movePart(chapterId, fromIdx, direction) {
    try {
      const ch = await Storage.getChapter(chapterId);
      if (!ch) return;
      const toIdx = fromIdx + direction;
      if (toIdx < 0 || toIdx >= ch.parts.length) return;
      const ids = ch.parts.map(p => p.id);
      [ids[fromIdx], ids[toIdx]] = [ids[toIdx], ids[fromIdx]];
      showLoading('Reordering...');
      await Storage.reorderParts(chapterId, ids);
      hideLoading();
      await loadChaptersList();
    } catch (err) {
      hideLoading();
      showMessage('chaptersMsg', 'Failed: ' + err.message, 'error');
    }
  }

  // ===========================
  // GALLERY
  // ===========================
  async function loadGalleryList() {
    const data = await Storage.getData();
    const gallery = data.gallery || [];
    const list = document.getElementById('galleryList');

    if (gallery.length === 0) {
      list.innerHTML = '<p class="empty-state">No gallery items yet. Add your first image above.</p>';
      return;
    }

    list.innerHTML = '';
    for (let idx = 0; idx < gallery.length; idx++) {
      const item = gallery[idx];
      const div = document.createElement('div');
      div.className = 'content-item';

      const orderDiv = document.createElement('div');
      orderDiv.className = 'order-controls';
      const upBtn = createOrderBtn('\u25B2', 'Move up', idx === 0);
      upBtn.addEventListener('click', () => moveGallery(idx, -1));
      const downBtn = createOrderBtn('\u25BC', 'Move down', idx === gallery.length - 1);
      downBtn.addEventListener('click', () => moveGallery(idx, 1));
      orderDiv.appendChild(upBtn);
      orderDiv.appendChild(downBtn);

      const img = document.createElement('img');
      img.src = Storage.getGalleryImageUrl(item.id);
      img.alt = item.label || '';
      img.onerror = () => { img.src = ''; img.onerror = null; };

      const info = document.createElement('div');
      info.className = 'item-info';
      info.innerHTML = '<h3>' + escapeHtml(item.label || 'Untitled') + '</h3>';

      const actions = document.createElement('div');
      actions.className = 'item-actions';

      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-danger';
      delBtn.textContent = 'Remove';
      delBtn.addEventListener('click', async () => {
        if (confirm('Remove this gallery item?')) {
          try {
            showLoading('Removing gallery item...');
            await Storage.removeGalleryItem(item.id);
            hideLoading();
            await loadGalleryList();
            showMessage('galleryMsg', 'Gallery item removed.', 'success');
          } catch (err) {
            hideLoading();
            showMessage('galleryMsg', 'Failed: ' + err.message, 'error');
          }
        }
      });

      actions.appendChild(delBtn);
      div.appendChild(orderDiv);
      div.appendChild(img);
      div.appendChild(info);
      div.appendChild(actions);
      list.appendChild(div);
    }
  }

  async function moveGallery(fromIdx, direction) {
    try {
      const gallery = await Storage.getGallery();
      const toIdx = fromIdx + direction;
      if (toIdx < 0 || toIdx >= gallery.length) return;
      const ids = gallery.map(g => g.id);
      [ids[fromIdx], ids[toIdx]] = [ids[toIdx], ids[fromIdx]];
      showLoading('Reordering...');
      await Storage.reorderGallery(ids);
      hideLoading();
      await loadGalleryList();
    } catch (err) {
      hideLoading();
      showMessage('galleryMsg', 'Failed: ' + err.message, 'error');
    }
  }

  document.getElementById('addGalleryBtn').addEventListener('click', async () => {
    if (!Storage.hasToken()) {
      showMessage('galleryMsg', 'Set up your GitHub token in Settings first.', 'error');
      return;
    }

    const label = document.getElementById('galleryLabel').value.trim();
    const fileInput = document.getElementById('galleryImage');

    if (fileInput.files.length === 0) {
      showMessage('galleryMsg', 'Please select an image.', 'error');
      return;
    }

    try {
      showLoading('Uploading gallery image...');
      const image = await Storage.fileToDataURL(fileInput.files[0]);
      await Storage.addGalleryItem({ label, image });
      hideLoading();
      document.getElementById('galleryLabel').value = '';
      fileInput.value = '';
      await loadGalleryList();
      showMessage('galleryMsg', 'Image added to gallery!', 'success');
    } catch (err) {
      hideLoading();
      showMessage('galleryMsg', 'Failed to add image: ' + err.message, 'error');
    }
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

  document.getElementById('resetDataBtn').addEventListener('click', async () => {
    if (!Storage.hasToken()) {
      showMessage('settingsMsg', 'Set up your GitHub token first.', 'error');
      return;
    }
    if (confirm('Are you SURE you want to delete all content? This cannot be undone.')) {
      if (confirm('Last chance \u2014 this will remove all chapters, gallery items, and settings.')) {
        try {
          showLoading('Resetting all data...');
          await Storage.resetAll();
          hideLoading();
          showMessage('settingsMsg', 'All data has been reset.', 'success');
          resetChapterForm();
          await loadBannerSettings();
          await loadChaptersList();
          await loadGalleryList();
        } catch (err) {
          hideLoading();
          showMessage('settingsMsg', 'Failed: ' + err.message, 'error');
        }
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
    setTimeout(() => { el.style.display = 'none'; }, 5000);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function createOrderBtn(symbol, title, disabled) {
    const btn = document.createElement('button');
    btn.className = 'order-btn';
    btn.textContent = symbol;
    btn.title = title;
    btn.disabled = disabled;
    return btn;
  }

  function toRoman(num) {
    const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
    const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
    let result = '';
    for (let i = 0; i < vals.length; i++) {
      while (num >= vals[i]) { result += syms[i]; num -= vals[i]; }
    }
    return result;
  }
});
