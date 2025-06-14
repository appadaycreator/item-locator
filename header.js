async function loadCommonHeader() {
  const existing = document.querySelector('header');
  if (!existing) {
    try {
      const res = await fetch('header.html');
      if (res.ok) {
        const html = await res.text();
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const header = temp.querySelector('header');
        if (header) {
          document.body.insertBefore(header, document.body.firstChild);
        }
      }
    } catch (e) {
      console.error('Failed to load header:', e);
    }
  }
  initFontSizeControl();
  const headerElem = document.querySelector('header');
  if (headerElem) {
    document.body.style.paddingTop = headerElem.offsetHeight + 'px';
  }
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('navMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('show');
    });
  }

  const backBtn = document.getElementById('backButton');
  if (backBtn && !location.pathname.endsWith('index.html')) {
    backBtn.style.display = 'inline';
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      history.back();
    });
  }
}

window.addEventListener('DOMContentLoaded', loadCommonHeader);
