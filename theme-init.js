/* Applies the saved (or system-preferred) theme before first paint to avoid a flash. */
(function () {
  try {
    var stored = localStorage.getItem('dgv-theme');
    var theme = stored
      || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
