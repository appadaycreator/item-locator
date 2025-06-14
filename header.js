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
}
window.addEventListener('DOMContentLoaded', loadCommonHeader);
