const ITEM_KEY = 'items';
const HISTORY_KEY = 'history';

let selectedPhotoData = '';

function loadItems() {
  return JSON.parse(localStorage.getItem(ITEM_KEY) || '[]');
}

function saveItems(items) {
  localStorage.setItem(ITEM_KEY, JSON.stringify(items));
}

function loadHistory() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function addHistory(entry) {
  const history = loadHistory();
  history.unshift(entry);
  history.splice(20); // keep last 20
  saveHistory(history);
}

function updateDashboard() {
  const items = loadItems();
  document.getElementById('itemCount').textContent = items.length;
  const locations = new Set(items.map(i => i.parent));
  document.getElementById('locationCount').textContent = locations.size;

  const now = new Date();
  const month = now.getMonth();
  const history = loadHistory();
  const searches = history.filter(h => h.action === 'search' && new Date(h.timestamp).getMonth() === month);
  document.getElementById('searchCount').textContent = searches.length;
}

function renderHistory() {
  const list = document.getElementById('activityList');
  list.innerHTML = '';
  const history = loadHistory().slice(0, 3);
  history.forEach(h => {
    const div = document.createElement('div');
    div.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg';
    const info = document.createElement('div');
    info.className = 'flex items-center';
    const icon = document.createElement('i');
    if (h.action === 'add') icon.className = 'fas fa-plus-circle text-green-500 mr-3';
    else icon.className = 'fas fa-search text-blue-500 mr-3';
    const span = document.createElement('span');
    span.className = 'text-gray-700';
    if (h.action === 'add') span.textContent = `「${h.item.name}」を${h.item.parent}に登録`;
    else span.textContent = `「${h.query}」を検索 (${h.results})件`;
    const time = document.createElement('span');
    time.className = 'text-gray-400 text-sm';
    time.textContent = new Date(h.timestamp).toLocaleTimeString();
    info.appendChild(icon);
    info.appendChild(span);
    div.appendChild(info);
    div.appendChild(time);
    list.appendChild(div);
  });
}

function renderResults(results) {
  const container = document.getElementById('searchResults');
  container.innerHTML = '';
  results.forEach(item => {
    const div = document.createElement('div');
    div.className = 'p-3 bg-gray-50 rounded-lg flex justify-between';
    div.innerHTML = `<span>${item.name} - ${item.parent} ${item.detail}</span>`;
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
  addHistory({ action: 'search', query, results: results.length, timestamp: new Date().toISOString() });
  updateDashboard();
  renderHistory();
}

function saveItem() {
  const name = document.getElementById('itemName').value.trim();
  if (!name) return alert('アイテム名を入力してください');
  const parent = document.getElementById('parentLocation').value;
  const detail = document.getElementById('detailLocation').value.trim();
  const tags = document.getElementById('itemTags').value.trim().split(/\s+/).filter(Boolean);
  const memo = document.getElementById('itemMemo').value.trim();
  const favorite = document.getElementById('favorite').checked;
  const photo = selectedPhotoData;

  const items = loadItems();
  items.push({
    id: Date.now(),
    name,
    parent,
    detail,
    tags,
    memo,
    favorite,
    photo,
    createdAt: new Date().toISOString()
  });
  saveItems(items);
  addHistory({ action: 'add', item: { name, parent }, timestamp: new Date().toISOString() });
  updateDashboard();
  renderHistory();
  document.getElementById('itemName').value = '';
  document.getElementById('itemTags').value = '';
  document.getElementById('parentLocation').selectedIndex = 0;
  document.getElementById('detailLocation').value = '';
  document.getElementById('itemMemo').value = '';
  document.getElementById('favorite').checked = false;
  document.getElementById('itemPhoto').value = '';
  document.getElementById('photoPreview').classList.add('hidden');
  document.getElementById('photoPreview').src = '';
  selectedPhotoData = '';
  alert('アイテムを保存しました');
}

window.addEventListener('DOMContentLoaded', () => {
  updateDashboard();
  renderHistory();
  document.getElementById('searchBtn').addEventListener('click', () => {
    const q = document.getElementById('searchInput').value;
    if (q) search(q);
  });
  document.getElementById('saveItem').addEventListener('click', saveItem);
  const form = document.getElementById('itemForm');
  document.getElementById('showItemForm').addEventListener('click', () => {
    form.classList.remove('hidden');
    form.scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('cancelItem').addEventListener('click', () => {
    form.classList.add('hidden');
  });

  const photoInput = document.getElementById('itemPhoto');
  const photoPreview = document.getElementById('photoPreview');
  if (photoInput) {
    photoInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        selectedPhotoData = reader.result;
        photoPreview.src = selectedPhotoData;
        photoPreview.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    });
  }

  const addFromPhotoBtn = document.getElementById('addFromPhoto');
  if (addFromPhotoBtn) {
    addFromPhotoBtn.addEventListener('click', () => {
      form.classList.remove('hidden');
      form.scrollIntoView({ behavior: 'smooth' });
      photoInput.click();
    });
  }
});
