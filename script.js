const ITEM_KEY = 'items';

let photoData = '';

function loadItems() {
  return JSON.parse(localStorage.getItem(ITEM_KEY) || '[]');
}

function saveItems(items) {
  localStorage.setItem(ITEM_KEY, JSON.stringify(items));
}

function updateDashboard() {
  const items = loadItems();
  const itemCountEl = document.getElementById('itemCount');
  if (itemCountEl) itemCountEl.textContent = items.length;
  const locations = new Set(items.map(i => i.parent));
  const locationCountEl = document.getElementById('locationCount');
  if (locationCountEl) locationCountEl.textContent = locations.size;

}


function renderResults(results) {
  const container = document.getElementById('searchResults');
  container.innerHTML = '';
  results.forEach(item => {
    const div = document.createElement('div');
    div.className = 'p-3 bg-gray-50 rounded-lg flex items-center gap-3';
    const info = document.createElement('div');
    if (item.image) {
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.name;
      img.className = 'w-16 h-16 object-cover rounded';
      div.appendChild(img);
    }
    info.innerHTML = `<span>${item.name} - ${item.parent} ${item.detail}</span>`;
    div.appendChild(info);
    container.appendChild(div);
  });
}

function search(query) {
  const items = loadItems();
  const keywords = query.trim().toLowerCase().split(/\s+/);
  const results = items.filter(item => {
    const text = [item.name, item.memo, item.parent, item.detail, item.tags.join(' ')].join(' ').toLowerCase();
    return keywords.every(k => text.includes(k));
  });
  renderResults(results);
  updateDashboard();
}

function handlePhoto(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const MAX_SIZE = 800;
      let { width, height } = img;
      const scale = Math.min(1, MAX_SIZE / Math.max(width, height));
      width *= scale;
      height *= scale;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      photoData = canvas.toDataURL('image/jpeg', 0.8);
      const preview = document.getElementById('photoPreview');
      if (preview) {
        preview.innerHTML = `<img src="${photoData}" class="mx-auto mb-2 max-h-40 rounded-lg" alt="preview">`;
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function saveItem() {
  const name = document.getElementById('itemName').value.trim();
  if (!name) return alert('アイテム名を入力してください');
  const parent = document.getElementById('parentLocation').value;
  const detail = document.getElementById('detailLocation').value.trim();
  const tags = document.getElementById('itemTags').value.trim().split(/\s+/).filter(Boolean);
  const memo = document.getElementById('itemMemo').value.trim();
  const favorite = document.getElementById('favorite').checked;
  const image = photoData;

  const items = loadItems();
  items.push({
    id: Date.now(),
    name,
    parent,
    detail,
    tags,
    memo,
    favorite,
    image,
    createdAt: new Date().toISOString()
  });
  try {
    saveItems(items);
  } catch (e) {
    alert('保存に失敗しました。画像サイズを小さくするか写真なしで試してください');
    return;
  }
  updateDashboard();
  document.getElementById('itemName').value = '';
  document.getElementById('itemTags').value = '';
  document.getElementById('parentLocation').selectedIndex = 0;
  document.getElementById('detailLocation').value = '';
  document.getElementById('itemMemo').value = '';
  document.getElementById('favorite').checked = false;
  photoData = '';
  const preview = document.getElementById('photoPreview');
  if (preview) {
    preview.innerHTML = '<i class="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-2"></i><p class="text-gray-600">クリックまたはドラッグ＆ドロップで画像を追加</p><p class="text-gray-400 text-sm mt-1">写真があると探しやすくなります！</p>';
  }
  alert('アイテムを保存しました');
}

function editItem(id) {
  const items = loadItems();
  const item = items.find(i => i.id === id);
  if (!item) return;
  const name = prompt('アイテム名', item.name);
  if (name === null) return;
  const parent = prompt('場所', item.parent);
  if (parent === null) return;
  const detail = prompt('詳細', item.detail);
  if (detail === null) return;
  const memo = prompt('メモ', item.memo);
  if (memo === null) return;
  const tags = prompt('タグ(スペース区切り)', item.tags.join(' '));
  if (tags === null) return;

  item.name = name.trim();
  item.parent = parent.trim();
  item.detail = detail.trim();
  item.memo = memo.trim();
  item.tags = tags.trim().split(/\s+/).filter(Boolean);
  saveItems(items);
  updateDashboard();
  if (typeof renderAllItems === 'function') renderAllItems();
}

function deleteItem(id) {
  if (!confirm('このアイテムを削除しますか？')) return;
  const items = loadItems().filter(i => i.id !== id);
  saveItems(items);
  updateDashboard();
  if (typeof renderAllItems === 'function') renderAllItems();
}

window.addEventListener('DOMContentLoaded', () => {
  updateDashboard();
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const q = document.getElementById('searchInput').value;
      if (q) search(q);
    });
  }
  const saveBtn = document.getElementById('saveItem');
  if (saveBtn) saveBtn.addEventListener('click', saveItem);
  const form = document.getElementById('itemForm');
  const showFormBtn = document.getElementById('showItemForm');
  if (showFormBtn && form) {
    showFormBtn.addEventListener('click', () => {
      form.classList.remove('hidden');
      form.scrollIntoView({ behavior: 'smooth' });
    });
  }
  const cancelBtn = document.getElementById('cancelItem');
  if (cancelBtn && form) {
    cancelBtn.addEventListener('click', () => {
      form.classList.add('hidden');
    });
  }

  const photoInput = document.getElementById('itemPhoto');
  const dropArea = document.getElementById('photoDrop');

  const addFromPhotoBtn = document.getElementById('addFromPhoto');
  if (addFromPhotoBtn && form && photoInput) {
    addFromPhotoBtn.addEventListener('click', () => {
      form.classList.remove('hidden');
      form.scrollIntoView({ behavior: 'smooth' });
      photoInput.click();
    });
  }
  if (photoInput && dropArea) {
    photoInput.addEventListener('change', e => {
      if (e.target.files[0]) handlePhoto(e.target.files[0]);
    });
    dropArea.addEventListener('dragover', e => {
      e.preventDefault();
      dropArea.classList.add('border-blue-400');
    });
    dropArea.addEventListener('dragleave', () => {
      dropArea.classList.remove('border-blue-400');
    });
    dropArea.addEventListener('drop', e => {
      e.preventDefault();
      dropArea.classList.remove('border-blue-400');
      if (e.dataTransfer.files[0]) handlePhoto(e.dataTransfer.files[0]);
    });
  }
});
