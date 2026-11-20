// picks the theme before the first paint so the page never flashes the wrong colors
// kept as its own file because the security policy only runs scripts from this site
// the ids and page colors match the list in src/lib/theme.ts
;(function () {
  // every theme and its page color, the first one is the default
  var themes = {
    paper: '#FFFFFF',
    walnut: '#2A1D15',
    cabin: '#1F1712',
    mahogany: '#2D1513',
    oak: '#3A2A1C',
    hearth: '#18110E',
  }
  var t = 'paper'

  // a saved pick from an earlier visit
  try {
    var saved = localStorage.getItem('theme')
    if (saved && themes.hasOwnProperty(saved)) t = saved
  } catch (e) {
    // storage blocked, the default it is
  }

  // a ?theme= link wins, and gets saved so the rest of the visit keeps it
  try {
    var asked = new URLSearchParams(window.location.search).get('theme')
    if (asked && themes.hasOwnProperty(asked)) {
      t = asked
      try {
        localStorage.setItem('theme', t)
      } catch (e) {
        // storage blocked, it still applies for this page
      }
    }
  } catch (e) {
    // very old browser, skip the link check
  }

  // puts the theme on the page and matches the phone's address bar to it
  document.documentElement.dataset.theme = t
  var meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', themes[t])
})()
