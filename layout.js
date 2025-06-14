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

  box.addEventListener('mousedown', e => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = loc.x;
    const origY = loc.y;
    function onMove(ev) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let x = origX + dx;
      let y = origY + dy;
      x = Math.max(0, Math.min(roomDiv.clientWidth - box.offsetWidth, x));
      y = Math.max(0, Math.min(roomDiv.clientHeight - box.offsetHeight, y));
      box.style.left = x + 'px';
      box.style.top = y + 'px';
      loc.x = x;
      loc.y = y;
    }
    function endMove() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', endMove);
      saveLayout();
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', endMove);
  });
}

function initLayout() {
  const container = document.getElementById('layout');
  const rooms = loadRooms();
  const locations = loadLocations();
  window.layoutLocations = locations;
  container.innerHTML = '';
  rooms.forEach(room => {
    const div = document.createElement('div');
    div.className = 'room border border-gray-300 bg-white rounded relative';
    div.dataset.room = room;
    const title = document.createElement('div');
    title.textContent = room;
    title.className = 'bg-gray-100 text-sm px-2 py-1';
    div.appendChild(title);
    container.appendChild(div);
  });
  locations.forEach(loc => {
    const roomDiv = container.querySelector(`.room[data-room="${loc.room}"]`);
    if (roomDiv) createLocationBox(loc, roomDiv);
  });
}

document.addEventListener('DOMContentLoaded', initLayout);
