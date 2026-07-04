// Applies the saved (or OS-preferred) theme before first paint to avoid a
// flash of the wrong theme. Kept as an external file for CSP (script-src 'self').
try {
  var t = localStorage.getItem('theme')
  if (t !== 'light' && t !== 'dark') {
    t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  }
  document.documentElement.dataset.theme = t
} catch (e) { /* storage unavailable — dark default applies */ }
