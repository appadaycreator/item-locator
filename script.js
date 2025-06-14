const ITEM_KEY = 'items';
const ROOM_KEY = 'rooms';
const LOCATION_KEY = 'locations';
const ROOM_SIZE_KEY = 'roomSizes';

// Supabase設定 - ご自身のURLとAnonキーに置き換えてください
const SUPABASE_URL = 'https://ynyudoqluixtptyimbfv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueXVkb3FsdWl4dHB0eWltYmZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5ODExNDUsImV4cCI6MjA2NTU1NzE0NX0.0qmfy-UXpLQ-q2h69lFLAArPlz5A6NJXo2_7rvDz3Jc';
let supabaseClient = null;
if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

async function syncFromSupabase() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient
      .from('appdata')
      .select('payload')
      .eq('id', 1)
      .single();
    if (!error && data && data.payload) {
      const { items, rooms, locations, roomSizes } = data.payload;
      if (items) localStorage.setItem(ITEM_KEY, JSON.stringify(items));
      if (rooms) localStorage.setItem(ROOM_KEY, JSON.stringify(rooms));
      if (locations) localStorage.setItem(LOCATION_KEY, JSON.stringify(locations));
      if (roomSizes) localStorage.setItem(ROOM_SIZE_KEY, JSON.stringify(roomSizes));
    }
  } catch (e) {
    console.error('Supabaseからの読み込みに失敗しました', e);
  }
}

async function syncToSupabase() {
  if (!supabaseClient) return;
  const payload = {
    items: JSON.parse(localStorage.getItem(ITEM_KEY) || '[]'),
    rooms: JSON.parse(localStorage.getItem(ROOM_KEY) || '[]'),
    locations: JSON.parse(localStorage.getItem(LOCATION_KEY) || '[]'),
    roomSizes: JSON.parse(localStorage.getItem(ROOM_SIZE_KEY) || '{}')
  };
  try {
    await supabaseClient.from('appdata').upsert({ id: 1, payload });
  } catch (e) {
    console.error('Supabaseへの保存に失敗しました', e);
  }
}

let photoData = '';
let editingItemId = null;
let editingLocationIndex = null;

const FONT_SIZE_KEY = 'fontSize';
const DEFAULT_FONT_SIZE = '16';
const DEFAULT_ROOM = '書斎';

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
  const containers = [];
  const target = document.getElementById('fontSize');
  if (target) containers.push(target);
  if (containers.length === 0) {
    const header = document.querySelector('header');
    if (header) containers.push(header);
  }

  const selects = [];
  const size = loadFontSize();
  applyFontSize(size);

  containers.forEach(c => {
    const select = document.createElement('select');
    select.className = 'p-2 border rounded bg-white shadow text-sm text-black';
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
    select.value = size;
    select.addEventListener('change', e => {
      const val = e.target.value;
      applyFontSize(val);
      saveFontSize(val);
      selects.forEach(s => { if (s !== e.target) s.value = val; });
    });
    c.appendChild(select);
    selects.push(select);
  });
}

function loadRooms() {
  const data = localStorage.getItem(ROOM_KEY);
  if (data) return JSON.parse(data);
  const defaults = [DEFAULT_ROOM, 'リビング', '寝室', 'キッチン'];
  localStorage.setItem(ROOM_KEY, JSON.stringify(defaults));
  return defaults;
}

function saveRooms(rooms) {
  localStorage.setItem(ROOM_KEY, JSON.stringify(rooms));
  syncToSupabase();
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
  syncToSupabase();
}

function loadRoomSizes() {
  const data = localStorage.getItem(ROOM_SIZE_KEY);
  if (data) return JSON.parse(data);
  const rooms = loadRooms();
  const defaults = {};
  rooms.forEach(r => { defaults[r] = { w: 240, h: 240 }; });
  localStorage.setItem(ROOM_SIZE_KEY, JSON.stringify(defaults));
  return defaults;
}

function saveRoomSizes(sizes) {
  localStorage.setItem(ROOM_SIZE_KEY, JSON.stringify(sizes));
  syncToSupabase();
}

function updateRoomOptions() {
  const selects = [
    document.getElementById('roomSelect'),
    document.getElementById('locationRoomSelect'),
    document.getElementById('editLocationRoom'),
    document.getElementById('layoutRoomSelect')
  ].filter(Boolean);
  if (selects.length === 0) return;
  const rooms = loadRooms();
  selects.forEach(select => {
    select.innerHTML = '<option>選択してください</option>' +
      rooms.map(r => `<option>${r}</option>`).join('');
    if (rooms.includes(DEFAULT_ROOM)) {
      select.value = DEFAULT_ROOM;
    }
  });
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
  syncToSupabase();
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
  if (editingItemId !== null) {
    const item = items.find(i => i.id === editingItemId);
    if (item) {
      item.name = name;
      item.room = room;
      item.location = parent;
      item.detail = detail;
      item.locationPath = locationPath;
      item.tags = tags;
      item.memo = memo;
      item.favorite = favorite;
      item.image = image;
    }
  } else {
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
  }
  try {
    saveItems(items);
  } catch (e) {
    alert('保存に失敗しました。画像サイズを小さくするか写真なしで試してください');
    return;
  }
  updateDashboard();
  if (typeof renderAllItems === 'function') renderAllItems();
  document.getElementById('itemName').value = '';
  document.getElementById('itemTags').value = '';
  document.getElementById('parentLocation').selectedIndex = 0;
  document.getElementById('detailLocation').value = '';
  if (pathInput) pathInput.value = '';
  document.getElementById('itemMemo').value = '';
  document.getElementById('favorite').checked = false;
  const roomSelect = document.getElementById('roomSelect');
  if (roomSelect) roomSelect.value = DEFAULT_ROOM;
  photoData = '';
  const preview = document.getElementById('photoPreview');
  if (preview) {
    preview.innerHTML = '<i class="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-2"></i><p class="text-gray-600">クリックまたはドラッグ＆ドロップで画像を追加</p><p class="text-gray-400 text-sm mt-1">写真があると探しやすくなります！</p>';
  }
  const msg = editingItemId !== null ? 'アイテムを更新しました' : 'アイテムを保存しました';
  alert(msg);
  editingItemId = null;
  const saveBtn = document.getElementById('saveItem');
  if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i>保存';
}

function editItem(id) {
  const items = loadItems();
  const item = items.find(i => i.id === id);
  if (!item) return;
  editingItemId = id;
  const form = document.getElementById('itemForm');
  if (form) form.classList.remove('hidden');
  const saveBtn = document.getElementById('saveItem');
  if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i>更新';
  document.getElementById('itemName').value = item.name;
  document.getElementById('itemTags').value = item.tags.join(' ');
  updateRoomOptions();
  document.getElementById('roomSelect').value = item.room || '選択してください';
  updateLocationOptions(item.room);
  document.getElementById('parentLocation').value = item.location || '選択してください';
  document.getElementById('detailLocation').value = item.detail || '';
  const pathInput = document.getElementById('locationPath');
  if (pathInput) pathInput.value = (item.locationPath || []).join('/');
  document.getElementById('itemMemo').value = item.memo || '';
  document.getElementById('favorite').checked = !!item.favorite;
  if (item.image) {
    photoData = item.image;
    const preview = document.getElementById('photoPreview');
    if (preview) {
      preview.innerHTML = `<img src="${photoData}" class="mx-auto mb-2 max-h-40 rounded-lg max-w-full" alt="preview">`;
    }
  } else {
    photoData = '';
  }
  form.scrollIntoView({ behavior: 'smooth' });
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
  const sizes = loadRoomSizes();
  sizes[name] = { w: 240, h: 240 };
  saveRoomSizes(sizes);
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
  const newName = name.trim();
  const oldName = rooms[index];
  rooms[index] = newName;
  const sizes = loadRoomSizes();
  if (sizes[oldName]) {
    sizes[newName] = sizes[oldName];
    delete sizes[oldName];
    saveRoomSizes(sizes);
  }
  saveRooms(rooms);
  renderRooms();
  updateRoomOptions();
  updateLocationOptions();
}

function deleteRoom(index) {
  if (!confirm('この部屋を削除しますか？')) return;
  const rooms = loadRooms();
  const removed = rooms.splice(index, 1)[0];
  const sizes = loadRoomSizes();
  delete sizes[removed];
  saveRoomSizes(sizes);
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
    span.classList.add('cursor-pointer');
    span.addEventListener('click', () => startEditLocation(i));
    div.appendChild(span);
    const controls = document.createElement('div');
    controls.className = 'flex gap-2';
    const editBtn = document.createElement('button');
    editBtn.innerHTML = '<i class="fas fa-edit text-blue-500"></i>';
    editBtn.addEventListener('click', () => startEditLocation(i));
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
  locations.push({ room, name, w: 60, h: 60 });
  saveLocations(locations);
  input.value = '';
  if (roomSelect) roomSelect.value = DEFAULT_ROOM;
  renderLocations();
  updateLocationOptions(room);
}

function startEditLocation(index) {
  const locations = loadLocations();
  const loc = locations[index];
  const form = document.getElementById('editLocationForm');
  const roomSelect = document.getElementById('editLocationRoom');
  const nameInput = document.getElementById('editLocationName');
  if (!form || !roomSelect || !nameInput) return;
  editingLocationIndex = index;
  updateRoomOptions();
  roomSelect.value = loc.room;
  nameInput.value = loc.name;
  form.classList.remove('hidden');
}

function saveEditLocation() {
  if (editingLocationIndex === null) return;
  const locations = loadLocations();
  const loc = locations[editingLocationIndex];
  const rooms = loadRooms();
  const roomSelect = document.getElementById('editLocationRoom');
  const nameInput = document.getElementById('editLocationName');
  if (!roomSelect || !nameInput) return;
  const room = roomSelect.value;
  const name = nameInput.value.trim();
  if (!room) return alert('部屋を選択してください');
  if (!name) return alert('収納場所名を入力してください');
  if (!rooms.includes(room)) {
    if (confirm(`${room} を新しい部屋として追加しますか？`)) {
      rooms.push(room);
      saveRooms(rooms);
    } else {
      return;
    }
  }
  loc.room = room;
  loc.name = name;
  saveLocations(locations);
  const form = document.getElementById('editLocationForm');
  if (form) form.classList.add('hidden');
  editingLocationIndex = null;
  renderLocations();
  updateRoomOptions();
  updateLocationOptions(room);
}

function cancelEditLocation() {
  editingLocationIndex = null;
  const form = document.getElementById('editLocationForm');
  if (form) form.classList.add('hidden');
}

function deleteLocation(index) {
  if (!confirm('この収納場所を削除しますか？')) return;
  const locations = loadLocations();
  const loc = locations.splice(index, 1)[0];
  saveLocations(locations);
  if (editingLocationIndex !== null) {
    if (editingLocationIndex === index) {
      cancelEditLocation();
    } else if (editingLocationIndex > index) {
      editingLocationIndex--;
    }
  }
  renderLocations();
  updateLocationOptions(loc.room);
}

window.addEventListener('DOMContentLoaded', async () => {
  await syncFromSupabase();
  applyFontSize(loadFontSize());
  updateDashboard();
  updateRoomOptions();
  const roomSelect = document.getElementById('roomSelect');
  updateLocationOptions(roomSelect ? roomSelect.value : '');
  renderLocations();
  renderRooms();
  const layoutRoomSelect = document.getElementById('layoutRoomSelect');
  if (layoutRoomSelect) {
    const rooms = loadRooms();
    if (rooms.length) layoutRoomSelect.value = rooms[0];
  }
  const addRoomBtn = document.getElementById('addRoomBtn');
  if (addRoomBtn) addRoomBtn.addEventListener('click', addRoom);
  if (roomSelect) roomSelect.addEventListener('change', e => updateLocationOptions(e.target.value));
  const addLocBtn = document.getElementById('addLocationBtn');
  if (addLocBtn) addLocBtn.addEventListener('click', addLocation);
  const saveEditLocBtn = document.getElementById('saveEditLocationBtn');
  if (saveEditLocBtn) saveEditLocBtn.addEventListener('click', saveEditLocation);
  const cancelEditLocBtn = document.getElementById('cancelEditLocationBtn');
  if (cancelEditLocBtn) cancelEditLocBtn.addEventListener('click', cancelEditLocation);
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
      editingItemId = null;
      const saveBtn = document.getElementById('saveItem');
      if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i>保存';
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

  const exportNav = document.getElementById('exportDataNav');
  if (exportNav) exportNav.addEventListener('click', exportData);
  const importNav = document.getElementById('importDataNav');
  const importInputNav = document.getElementById('importDataInputNav');
  if (importNav && importInputNav) {
    importNav.addEventListener('click', () => importInputNav.click());
    importInputNav.addEventListener('change', e => {
      if (e.target.files[0]) importData(e.target.files[0]);
      importInputNav.value = '';
    });
  }
  const syncNav = document.getElementById('syncSupabaseNav');
  if (syncNav) syncNav.addEventListener('click', syncToSupabase);
});
