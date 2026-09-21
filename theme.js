(() => {
  'use strict';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  try {
    const saved = localStorage.getItem('pranav-theme');
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch { /* The theme still works when storage is unavailable. */ }
  function apply(theme) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#151a16' : '#f5f3ed');
    const toggle = document.querySelector('#theme-toggle');
    if (!toggle) return;
    const dark = theme === 'dark';
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
    toggle.firstElementChild.textContent = dark ? '☀' : '☾';
    document.querySelector('#theme-label').textContent = dark ? 'Light' : 'Dark';
  }
  apply(preference || (system.matches ? 'dark' : 'light'));
  system.addEventListener('change', event => { if (!preference) apply(event.matches ? 'dark' : 'light'); });
  document.addEventListener('DOMContentLoaded', () => {
    apply(root.dataset.theme);
    document.querySelector('#theme-toggle').addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('pranav-theme', preference); } catch { /* Optional persistence. */ }
      apply(preference);
    });
  });
})();
