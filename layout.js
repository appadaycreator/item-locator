function saveLayout() {
  saveLocations(window.layoutLocations);
}

function createLocationBox(loc, roomDiv) {
  const box = document.createElement('div');
  box.className = 'location absolute bg-blue-100 border border-blue-300 text-xs flex items-center justify-center cursor-move rounded';
  box.textContent = loc.name;
  loc.x = loc.x || 10;
  loc.y = loc.y || 10;
  box.style.left = loc.x + 'px';
  box.style.top = loc.y + 'px';
  roomDiv.appendChild(box);

  let moved = false;
  function startDrag(startX, startY, isTouch) {
    const origX = loc.x;
    const origY = loc.y;
    function onMove(ev) {
      const clientX = isTouch ? ev.touches[0].clientX : ev.clientX;
      const clientY = isTouch ? ev.touches[0].clientY : ev.clientY;
      const dx = clientX - startX;
      const dy = clientY - startY;
      let x = origX + dx;
      let y = origY + dy;
      x = Math.max(0, Math.min(roomDiv.clientWidth - box.offsetWidth, x));
      y = Math.max(0, Math.min(roomDiv.clientHeight - box.offsetHeight, y));
      box.style.left = x + 'px';
      box.style.top = y + 'px';
      loc.x = x;
      loc.y = y;
      moved = true;
    }
    function endMove() {
      document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', onMove);
      document.removeEventListener(isTouch ? 'touchend' : 'mouseup', endMove);
      saveLayout();
    }
    document.addEventListener(isTouch ? 'touchmove' : 'mousemove', onMove);
    document.addEventListener(isTouch ? 'touchend' : 'mouseup', endMove);
  }

  box.addEventListener('mousedown', e => {
    e.preventDefault();
    moved = false;
    startDrag(e.clientX, e.clientY, false);
  });

  box.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.touches[0];
    moved = false;
    startDrag(t.clientX, t.clientY, true);
  });

  box.addEventListener('click', () => {
    if (!moved) {
      const path = encodeURIComponent(`${loc.room}/${loc.name}`);
      location.href = `items.html?loc=${path}`;
    }
  });
}

function initLayout(selectedRoom) {
  const params = new URLSearchParams(location.search);
  const filterRoom = selectedRoom !== undefined ? selectedRoom : params.get('room');

  const container = document.getElementById('layout');
  const rooms = loadRooms();
  const locations = loadLocations();
  rooms.sort((a, b) => {
    const hasA = locations.some(l => l.room === a);
    const hasB = locations.some(l => l.room === b);
    if (hasA === hasB) return 0;
    return hasA ? -1 : 1;
  });
  window.layoutLocations = locations;
  container.innerHTML = '';
  rooms.forEach(room => {
    if (filterRoom && room !== filterRoom) return;
    const hasLoc = locations.some(l => l.room === room);
    const div = document.createElement('div');
    div.dataset.room = room;
    if (hasLoc) {
      div.className = 'room border border-gray-300 bg-white rounded relative';
      const title = document.createElement('div');
      title.textContent = room;
      title.className = 'bg-gray-100 text-sm px-2 py-1';
      div.appendChild(title);
    } else {
      div.className = 'room empty border border-gray-300 bg-white rounded text-sm';
      div.textContent = room;
    }
    container.appendChild(div);
  });
  locations.forEach(loc => {
    if (filterRoom && loc.room !== filterRoom) return;
    const roomDiv = container.querySelector(`.room[data-room="${loc.room}"]`);
    if (roomDiv) createLocationBox(loc, roomDiv);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const roomSelect = document.getElementById('layoutRoomSelect');
  if (roomSelect) {
    initLayout(roomSelect.value || null);
    roomSelect.addEventListener('change', e => initLayout(e.target.value || null));
  } else {
    initLayout();
  }
  const btn = document.getElementById('addLocationBtn');
  if (btn) btn.addEventListener('click', () => setTimeout(() => {
    initLayout(roomSelect ? roomSelect.value || null : undefined);
  }, 0));
});
