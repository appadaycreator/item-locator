function saveLayout() {
  saveLocations(window.layoutLocations);
}

function createLocationBox(loc, roomDiv) {
  const box = document.createElement('div');
  box.className = 'location absolute bg-blue-100 border border-blue-300 text-xs flex items-center justify-center cursor-move rounded';
  box.textContent = loc.name;
  loc.x = loc.x || 10;
  loc.y = loc.y || 10;
  loc.w = loc.w || 60;
  loc.h = loc.h || 60;
  box.style.left = loc.x + 'px';
  box.style.top = loc.y + 'px';
  box.style.width = loc.w + 'px';
  box.style.height = loc.h + 'px';
  roomDiv.appendChild(box);

  const handle = document.createElement('div');
  handle.className = 'resize-handle bg-blue-500 absolute bottom-0 right-0';
  box.appendChild(handle);

  function startResize(startX, startY, isTouch) {
    const origW = loc.w;
    const origH = loc.h;
    function onMove(ev) {
      const clientX = isTouch ? ev.touches[0].clientX : ev.clientX;
      const clientY = isTouch ? ev.touches[0].clientY : ev.clientY;
      const dx = clientX - startX;
      const dy = clientY - startY;
      let w = Math.max(20, origW + dx);
      let h = Math.max(20, origH + dy);
      w = Math.min(roomDiv.clientWidth - loc.x, w);
      h = Math.min(roomDiv.clientHeight - loc.y, h);
      box.style.width = w + 'px';
      box.style.height = h + 'px';
      loc.w = w;
      loc.h = h;
    }
    function endResize() {
      document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', onMove);
      document.removeEventListener(isTouch ? 'touchend' : 'mouseup', endResize);
      saveLayout();
    }
    document.addEventListener(isTouch ? 'touchmove' : 'mousemove', onMove, { passive: false });
    document.addEventListener(isTouch ? 'touchend' : 'mouseup', endResize);
  }

  handle.addEventListener('mousedown', e => {
    e.stopPropagation();
    e.preventDefault();
    startResize(e.clientX, e.clientY, false);
  });

  handle.addEventListener('touchstart', e => {
    e.stopPropagation();
    e.preventDefault();
    const t = e.touches[0];
    startResize(t.clientX, t.clientY, true);
  });

  function startPinch(e) {
    if (e.touches.length !== 2) return;
    e.preventDefault();
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    const startDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    const origW = loc.w;
    const origH = loc.h;
    function onMove(ev) {
      if (ev.touches.length !== 2) return;
      const n1 = ev.touches[0];
      const n2 = ev.touches[1];
      const dist = Math.hypot(n1.clientX - n2.clientX, n1.clientY - n2.clientY);
      const scale = dist / startDist;
      let w = Math.max(20, origW * scale);
      let h = Math.max(20, origH * scale);
      w = Math.min(roomDiv.clientWidth - loc.x, w);
      h = Math.min(roomDiv.clientHeight - loc.y, h);
      box.style.width = w + 'px';
      box.style.height = h + 'px';
      loc.w = w;
      loc.h = h;
    }
    function endPinch() {
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', endPinch);
      saveLayout();
    }
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', endPinch);
  }

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
    if (e.touches.length === 2) {
      startPinch(e);
    } else {
      e.preventDefault();
      const t = e.touches[0];
      moved = false;
      startDrag(t.clientX, t.clientY, true);
    }
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
  let filterRoom = selectedRoom !== undefined ? selectedRoom : params.get('room');

  const container = document.getElementById('layout');
  const rooms = loadRooms();
  if (!filterRoom && rooms.length) {
    filterRoom = rooms[0];
    const roomSelect = document.getElementById('layoutRoomSelect');
    if (roomSelect && !roomSelect.value) roomSelect.value = filterRoom;
  }
  const locations = loadLocations();
  rooms.sort((a, b) => {
    const hasA = locations.some(l => l.room === a);
    const hasB = locations.some(l => l.room === b);
    if (hasA === hasB) return 0;
    return hasA ? -1 : 1;
  });
  const roomSizes = loadRoomSizes ? loadRoomSizes() : {};
  window.layoutLocations = locations;
  container.innerHTML = '';
  rooms.forEach(room => {
    if (filterRoom && room !== filterRoom) return;
    const hasLoc = locations.some(l => l.room === room);
    const div = document.createElement('div');
    div.dataset.room = room;
    const size = roomSizes[room] || { w: 240, h: 240 };
    div.style.width = size.w + 'px';
    div.style.height = size.h + 'px';
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
    const handle = document.createElement('div');
    handle.className = 'resize-handle room-resize absolute bottom-0 right-0';
    div.appendChild(handle);

    function startResize(startX, startY, isTouch) {
      const origW = size.w;
      const origH = size.h;
      function onMove(ev) {
        const clientX = isTouch ? ev.touches[0].clientX : ev.clientX;
        const clientY = isTouch ? ev.touches[0].clientY : ev.clientY;
        const dx = clientX - startX;
        const dy = clientY - startY;
        let w = Math.max(120, origW + dx);
        let h = Math.max(120, origH + dy);
        div.style.width = w + 'px';
        div.style.height = h + 'px';
        roomSizes[room] = { w, h };
      }
      function endResize() {
        document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', onMove);
        document.removeEventListener(isTouch ? 'touchend' : 'mouseup', endResize);
        if (typeof saveRoomSizes === 'function') saveRoomSizes(roomSizes);
      }
      document.addEventListener(isTouch ? 'touchmove' : 'mousemove', onMove, { passive: false });
      document.addEventListener(isTouch ? 'touchend' : 'mouseup', endResize);
    }

    handle.addEventListener('mousedown', e => {
      e.stopPropagation();
      e.preventDefault();
      startResize(e.clientX, e.clientY, false);
    });
    handle.addEventListener('touchstart', e => {
      e.stopPropagation();
      e.preventDefault();
      const t = e.touches[0];
      startResize(t.clientX, t.clientY, true);
    });

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
