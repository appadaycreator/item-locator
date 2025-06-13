const ITEM_KEY = 'items';
const ROOM_KEY = 'rooms';
const LOCATION_KEY = 'locations';

let photoData = '';

const FONT_SIZE_KEY = 'fontSize';
const DEFAULT_FONT_SIZE = '16';

function applyFontSize(size) {
  document.documentElement.style.fontSize = size + 'px';
}

function loadFontSize() {
  return localStorage.getItem(FONT_SIZE_KEY) || DEFAULT_FONT_SIZE;
}

function saveFontSize(size) {
  localStorage.setItem(FONT_SIZE_KEY, size);
}

function initFontSizeControl() {
  const select = document.createElement('select');
  select.id = 'fontSizeSelect';
  // Remove fixed positioning so the control is placed in normal flow
  select.className = 'p-2 border rounded bg-white shadow text-sm';
  const options = [
    { v: '20', l: '特大' },
    { v: '18', l: '大' },
    { v: '16', l: '標準' },
    { v: '14', l: '小' },
    { v: '12', l: '極小' }
  ];
  options.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o.v;
    opt.textContent = o.l;
    select.appendChild(opt);
  });
  const container = document.querySelector('header') || document.body;
  container.appendChild(select);
  const size = loadFontSize();
  applyFontSize(size);
  select.value = size;
  select.addEventListener('change', e => {
    applyFontSize(e.target.value);
    saveFontSize(e.target.value);
  });
}

function loadRooms() {
  const data = localStorage.getItem(ROOM_KEY);
  if (data) return JSON.parse(data);
  const defaults = ['リビング', '寝室', 'キッチン', '書斎'];
  localStorage.setItem(ROOM_KEY, JSON.stringify(defaults));
  return defaults;
}

function saveRooms(rooms) {
  localStorage.setItem(ROOM_KEY, JSON.stringify(rooms));
}

function loadLocations() {
  const data = localStorage.getItem(LOCATION_KEY);
  if (data) return JSON.parse(data);
  const defaults = [];
  localStorage.setItem(LOCATION_KEY, JSON.stringify(defaults));
  return defaults;
}

function saveLocations(locations) {
  localStorage.setItem(LOCATION_KEY, JSON.stringify(locations));
}

function updateRoomOptions() {
  const select = document.getElementById('roomSelect');
  if (!select) return;
  const rooms = loadRooms();
  select.innerHTML = '<option>選択してください</option>' +
    rooms.map(r => `<option>${r}</option>`).join('');
}

function updateLocationOptions(room) {
  const select = document.getElementById('parentLocation');
  if (!select) return;
  const locations = loadLocations().filter(l => !room || l.room === room);
  select.innerHTML = '<option>選択してください</option>' +
    locations.map(l => `<option>${l.name}</option>`).join('');
}

function formatLocation(item) {
  if (item.locationPath && item.locationPath.length) {
    return item.locationPath.join(' > ');
  }
  return [item.room, item.location, item.detail].filter(Boolean).join(' > ');
}

function loadItems() {
  const data = JSON.parse(localStorage.getItem(ITEM_KEY) || '[]');
  return data.map(i => {
    const item = { ...i, searchCount: i.searchCount || 0 };
    if (!item.locationPath) {
      const path = [];
      if (item.room) path.push(item.room);
      if (item.location) path.push(item.location);
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
  const rooms = new Set(items.map(i => (i.locationPath && i.locationPath[0]) || i.room));
  const locationCountEl = document.getElementById('locationCount');
  if (locationCountEl) locationCountEl.textContent = rooms.size;

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

function exportData() {
  const data = {
    items: loadItems(),
    rooms: loadRooms(),
    locations: loadLocations()
  };
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'item-locator-data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data.items) && Array.isArray(data.locations) && Array.isArray(data.rooms)) {
        localStorage.setItem(ITEM_KEY, JSON.stringify(data.items));
        localStorage.setItem(LOCATION_KEY, JSON.stringify(data.locations));
        localStorage.setItem(ROOM_KEY, JSON.stringify(data.rooms));
        updateDashboard();
        updateRoomOptions();
        const roomSelect = document.getElementById('roomSelect');
        updateLocationOptions(roomSelect ? roomSelect.value : '');
        renderLocations();
        if (typeof renderAllItems === 'function') renderAllItems();
        alert('データをインポートしました');
      } else {
        alert('データ形式が不正です');
      }
    } catch (err) {
      alert('データの読み込みに失敗しました');
    }
  };
  reader.readAsText(file);
}

function saveItem() {
  const name = document.getElementById('itemName').value.trim();
  if (!name) return alert('アイテム名を入力してください');
  let room = document.getElementById('roomSelect').value;
  let parent = document.getElementById('parentLocation').value;
  let detail = document.getElementById('detailLocation').value.trim();
  const pathInput = document.getElementById('locationPath');
  let locationPath = [];
  if (pathInput && pathInput.value.trim()) {
    locationPath = pathInput.value.trim().split('/').map(s => s.trim()).filter(Boolean);
    room = locationPath[0] || room;
    parent = locationPath[1] || parent;
    detail = locationPath[2] || detail;
  } else {
    locationPath = [room, parent, detail].filter(Boolean);
  }
  const tags = document.getElementById('itemTags').value.trim().split(/\s+/).filter(Boolean);
  const memo = document.getElementById('itemMemo').value.trim();
  const favorite = document.getElementById('favorite').checked;
  const image = photoData;

  const items = loadItems();
  items.push({
    id: Date.now(),
    name,
    room,
    location: parent,
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
  const loc = prompt('階層場所(/区切り)', (item.locationPath || [item.room, item.location, item.detail]).join('/'));
  if (loc === null) return;
  const locPath = loc.split('/').map(s => s.trim()).filter(Boolean);
  const memo = prompt('メモ', item.memo);
  if (memo === null) return;
  const tags = prompt('タグ(スペース区切り)', item.tags.join(' '));
  if (tags === null) return;

  item.name = name.trim();
  item.locationPath = locPath;
  item.room = locPath[0] || '';
  item.location = locPath[1] || '';
  item.detail = locPath[2] || '';
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

function renderRooms() {
  const container = document.getElementById('roomsList');
  if (!container) return;
  const rooms = loadRooms();
  container.innerHTML = '';
  rooms.forEach((room, i) => {
    const div = document.createElement('div');
    div.className = 'p-3 bg-white rounded-lg shadow flex items-center justify-between';
    const span = document.createElement('span');
    span.textContent = room;
    div.appendChild(span);
    const controls = document.createElement('div');
    controls.className = 'flex gap-2';
    const editBtn = document.createElement('button');
    editBtn.innerHTML = '<i class="fas fa-edit text-blue-500"></i>';
    editBtn.addEventListener('click', () => editRoom(i));
    const delBtn = document.createElement('button');
    delBtn.innerHTML = '<i class="fas fa-trash-alt text-red-500"></i>';
    delBtn.addEventListener('click', () => deleteRoom(i));
    controls.appendChild(editBtn);
    controls.appendChild(delBtn);
    div.appendChild(controls);
    container.appendChild(div);
  });
}

function addRoom() {
  const input = document.getElementById('newRoomName');
  if (!input) return;
  const name = input.value.trim();
  if (!name) return alert('部屋名を入力してください');
  const rooms = loadRooms();
  rooms.push(name);
  saveRooms(rooms);
  input.value = '';
  renderRooms();
  updateRoomOptions();
  updateLocationOptions();
}

function editRoom(index) {
  const rooms = loadRooms();
  const name = prompt('部屋名', rooms[index]);
  if (name === null) return;
  rooms[index] = name.trim();
  saveRooms(rooms);
  renderRooms();
  updateRoomOptions();
  updateLocationOptions();
}

function deleteRoom(index) {
  if (!confirm('この部屋を削除しますか？')) return;
  const rooms = loadRooms();
  rooms.splice(index, 1);
  saveRooms(rooms);
  renderRooms();
  updateRoomOptions();
  updateLocationOptions();
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
    span.textContent = `${loc.room} - ${loc.name}`;
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
  const roomSelect = document.getElementById('locationRoomSelect');
  if (!input) return;
  const name = input.value.trim();
  const room = roomSelect ? roomSelect.value : '';
  if (!name) return alert('収納場所名を入力してください');
  if (!room) return alert('部屋を選択してください');
  const locations = loadLocations();
  locations.push({ room, name });
  saveLocations(locations);
  input.value = '';
  if (roomSelect) roomSelect.selectedIndex = 0;
  renderLocations();
  updateLocationOptions(room);
}

function editLocation(index) {
  const locations = loadLocations();
  const loc = locations[index];
  const name = prompt('収納場所名', loc.name);
  if (name === null) return;
  loc.name = name.trim();
  saveLocations(locations);
  renderLocations();
  updateLocationOptions(loc.room);
}

function deleteLocation(index) {
  if (!confirm('この収納場所を削除しますか？')) return;
  const locations = loadLocations();
  const loc = locations.splice(index, 1)[0];
  saveLocations(locations);
  renderLocations();
  updateLocationOptions(loc.room);
}

window.addEventListener('DOMContentLoaded', () => {
  applyFontSize(loadFontSize());
  initFontSizeControl();
  updateDashboard();
  updateRoomOptions();
  const roomSelect = document.getElementById('roomSelect');
  updateLocationOptions(roomSelect ? roomSelect.value : '');
  renderLocations();
  renderRooms();
  const addRoomBtn = document.getElementById('addRoomBtn');
  if (addRoomBtn) addRoomBtn.addEventListener('click', addRoom);
  if (roomSelect) roomSelect.addEventListener('change', e => updateLocationOptions(e.target.value));
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

  const exportBtn = document.getElementById('exportDataBtn');
  if (exportBtn) exportBtn.addEventListener('click', exportData);
  const importBtn = document.getElementById('importDataBtn');
  const importInput = document.getElementById('importDataInput');
  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', e => {
      if (e.target.files[0]) importData(e.target.files[0]);
      importInput.value = '';
    });
  }
});
