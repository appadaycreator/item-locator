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
  const overlay = document.getElementById('menuOverlay');
  const closeBtn = document.getElementById('closeMenu');

  function closeMenu() {
    if (menu) menu.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
  }

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('show');
      if (overlay) overlay.classList.toggle('show');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeMenu);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }

  if (menu) {
    const links = menu.querySelectorAll('a[href]');
    links.forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  const exportNav = document.getElementById('exportDataNav');
  if (exportNav) exportNav.addEventListener('click', exportData);
  const importNav = document.getElementById('importDataNav');
  const importInputNav = document.getElementById('importDataInputNav');
  if (importNav && importInputNav) {
    importNav.addEventListener('click', (e) => {
      e.preventDefault();
      importInputNav.click();
    });
    importInputNav.addEventListener('change', (e) => {
      if (e.target.files[0]) importData(e.target.files[0]);
      importInputNav.value = '';
    });
  }

  if (menu) {
    const current = location.pathname.split('/').pop();
    const links = menu.querySelectorAll('a[href]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href !== '#' && current === href) {
        link.classList.add('active');
      }
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
