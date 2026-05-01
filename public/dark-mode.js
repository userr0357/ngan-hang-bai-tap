/**
 * dark-mode.js — Global dark mode toggle, shared across all pages
 */
(function () {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') document.body.classList.add('dark-mode');
})();

function applyDarkModeIcons(isDark) {
  document.querySelectorAll('[data-theme-btn]').forEach(function(btn) {
    btn.innerHTML = isDark
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    btn.title = isDark ? 'Chuyển sang sáng' : 'Chuyển sang tối';
  });
}

function toggleDarkMode() {
  var isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  applyDarkModeIcons(isDark);
}

document.addEventListener('DOMContentLoaded', function () {
  var savedTheme = localStorage.getItem('theme');
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

  if (isDark) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark-mode');
  }

  // Bind all buttons that have onclick="toggleDarkMode()" or data-theme-btn
  document.querySelectorAll('[data-theme-btn], #theme-toggle').forEach(function(btn) {
    btn.setAttribute('data-theme-btn', '');
    btn.onclick = toggleDarkMode;
  });

  applyDarkModeIcons(isDark);
});
