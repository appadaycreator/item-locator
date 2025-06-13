const ITEM_KEY = 'items';
const LOCATION_KEY = 'locations';

let photoData = '';

function loadLocations() {
  const data = localStorage.getItem(LOCATION_KEY);
  if (data) return JSON.parse(data);
  const defaults = ['リビング', '寝室', 'キッチン', '書斎', 'クローゼット', 'その他'];
  localStorage.setItem(LOCATION_KEY, JSON.stringify(defaults));
  return defaults;
}

function saveLocations(locations) {
  localStorage.setItem(LOCATION_KEY, JSON.stringify(locations));
}

function updateLocationOptions() {
  const select = document.getElementById('parentLocation');
  if (!select) return;
  const locations = loadLocations();
  select.innerHTML = '<option>選択してください</option>' +
    locations.map(l => `<option>${l}</option>`).join('');
}

function formatLocation(item) {
  if (item.locationPath && item.locationPath.length) {
    return item.locationPath.join(' > ');
  }
  return [item.parent, item.detail].filter(Boolean).join(' > ');
}

function loadItems() {
  const data = JSON.parse(localStorage.getItem(ITEM_KEY) || '[]');
  return data.map(i => {
    const item = { ...i, searchCount: i.searchCount || 0 };
    if (!item.locationPath) {
      const path = [];
      if (item.parent) path.push(item.parent);
      if (item.detail) path.push(item.detail);
      item.locationPath = path;
    }
    return item;
  });
}

function saveItems(items) {
  localStorage.setItem(ITEM_KEY, JSON.stringify(items));
}

function updateDashboard() {
  const items = loadItems();
  const itemCountEl = document.getElementById('itemCount');
  if (itemCountEl) itemCountEl.textContent = items.length;
  const locations = new Set(items.map(i => (i.locationPath && i.locationPath[0]) || i.parent));
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
    info.innerHTML = `<span>${item.name} - ${formatLocation(item)}</span>`;
    div.appendChild(info);
    container.appendChild(div);
  });
}

function search(query) {
  const items = loadItems();
  const keywords = query.trim().toLowerCase().split(/\s+/);
  const results = items.filter(item => {
    const text = [item.name, item.memo, formatLocation(item), item.tags.join(' ')].join(' ').toLowerCase();
    return keywords.every(k => text.includes(k));
  });
  results.forEach(item => {
    item.searchCount = (item.searchCount || 0) + 1;
  });
  saveItems(items);
  renderResults(results);
  const countEl = document.getElementById('resultCount');
  if (countEl) countEl.textContent = `${results.length}件見つかりました`;
  updateDashboard();
}

function searchRecent() {
  const items = loadItems().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const results = items.slice(0, 10);
  renderResults(results);
  const countEl = document.getElementById('resultCount');
  if (countEl) countEl.textContent = `最近追加された${results.length}件を表示`;
}

function searchFavorite() {
  const items = loadItems().filter(i => i.favorite);
  renderResults(items);
  const countEl = document.getElementById('resultCount');
  if (countEl) countEl.textContent = `${items.length}件のお気に入り`;
}

function searchPhoto() {
  const items = loadItems().filter(i => i.image);
  renderResults(items);
  const countEl = document.getElementById('resultCount');
  if (countEl) countEl.textContent = `${items.length}件の写真付きアイテム`;
}

function searchFrequent() {
  const items = loadItems().sort((a, b) => (b.searchCount || 0) - (a.searchCount || 0));
  const results = items.slice(0, 10);
  renderResults(results);
  const countEl = document.getElementById('resultCount');
  if (countEl) countEl.textContent = `よく検索された${results.length}件`;
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
        preview.innerHTML = `<img src="${photoData}" class="mx-auto mb-2 max-h-40 rounded-lg max-w-full" alt="preview">`;
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function saveItem() {
  const name = document.getElementById('itemName').value.trim();
  if (!name) return alert('アイテム名を入力してください');
  let parent = document.getElementById('parentLocation').value;
  let detail = document.getElementById('detailLocation').value.trim();
  const pathInput = document.getElementById('locationPath');
  let locationPath = [];
  if (pathInput && pathInput.value.trim()) {
    locationPath = pathInput.value.trim().split('/').map(s => s.trim()).filter(Boolean);
    parent = locationPath[0] || parent;
    detail = locationPath[1] || detail;
  } else {
    locationPath = [parent, detail].filter(Boolean);
  }
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
    locationPath,
    tags,
    memo,
    favorite,
    image,
    createdAt: new Date().toISOString(),
    searchCount: 0
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
  if (pathInput) pathInput.value = '';
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
  const loc = prompt('階層場所(/区切り)', (item.locationPath || [item.parent, item.detail]).join('/'));
  if (loc === null) return;
  const locPath = loc.split('/').map(s => s.trim()).filter(Boolean);
  const memo = prompt('メモ', item.memo);
  if (memo === null) return;
  const tags = prompt('タグ(スペース区切り)', item.tags.join(' '));
  if (tags === null) return;

  item.name = name.trim();
  item.locationPath = locPath;
  item.parent = locPath[0] || '';
  item.detail = locPath[1] || '';
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

function renderLocations() {
  const container = document.getElementById('locationsList');
  if (!container) return;
  const locations = loadLocations();
  container.innerHTML = '';
  locations.forEach((loc, i) => {
    const div = document.createElement('div');
    div.className = 'p-3 bg-white rounded-lg shadow flex items-center justify-between';
    const span = document.createElement('span');
    span.textContent = loc;
    div.appendChild(span);
    const controls = document.createElement('div');
    controls.className = 'flex gap-2';
    const editBtn = document.createElement('button');
    editBtn.innerHTML = '<i class="fas fa-edit text-blue-500"></i>';
    editBtn.addEventListener('click', () => editLocation(i));
    const delBtn = document.createElement('button');
    delBtn.innerHTML = '<i class="fas fa-trash-alt text-red-500"></i>';
    delBtn.addEventListener('click', () => deleteLocation(i));
    controls.appendChild(editBtn);
    controls.appendChild(delBtn);
    div.appendChild(controls);
    container.appendChild(div);
  });
}

function addLocation() {
  const input = document.getElementById('newLocationName');
  if (!input) return;
  const name = input.value.trim();
  if (!name) return alert('収納場所名を入力してください');
  const locations = loadLocations();
  locations.push(name);
  saveLocations(locations);
  input.value = '';
  renderLocations();
  updateLocationOptions();
}

function editLocation(index) {
  const locations = loadLocations();
  const name = prompt('収納場所名', locations[index]);
  if (name === null) return;
  locations[index] = name.trim();
  saveLocations(locations);
  renderLocations();
  updateLocationOptions();
}

function deleteLocation(index) {
  if (!confirm('この収納場所を削除しますか？')) return;
  const locations = loadLocations();
  locations.splice(index, 1);
  saveLocations(locations);
  renderLocations();
  updateLocationOptions();
}

window.addEventListener('DOMContentLoaded', () => {
  updateDashboard();
  updateLocationOptions();
  renderLocations();
  const addLocBtn = document.getElementById('addLocationBtn');
  if (addLocBtn) addLocBtn.addEventListener('click', addLocation);
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const q = document.getElementById('searchInput').value;
      if (q) search(q);
    });
  }
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', e => search(e.target.value));
  }
  const recentBtn = document.getElementById('recentBtn');
  if (recentBtn) recentBtn.addEventListener('click', searchRecent);
  const favoriteBtn = document.getElementById('favoriteBtn');
  if (favoriteBtn) favoriteBtn.addEventListener('click', searchFavorite);
  const photoBtn = document.getElementById('photoBtn');
  if (photoBtn) photoBtn.addEventListener('click', searchPhoto);
  const frequentBtn = document.getElementById('frequentBtn');
  if (frequentBtn) frequentBtn.addEventListener('click', searchFrequent);
  const voiceBtn = document.getElementById('voiceBtn');
  if (voiceBtn && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Rec();
    recognition.lang = 'ja-JP';
    recognition.addEventListener('result', e => {
      const text = e.results[0][0].transcript;
      if (searchInput) {
        searchInput.value = text;
        search(text);
      }
    });
    voiceBtn.addEventListener('click', () => recognition.start());
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
