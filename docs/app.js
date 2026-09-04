(function () {
  'use strict';

  /* ---------------------------------------------------------------- theme */
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var current = root.getAttribute('data-theme');
      if (!current) {
        current = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      var next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('cp-theme', next); } catch (e) {}
    });
  }

  /* --------------------------------------------------------------- search */
  var indexEl = document.getElementById('tool-index');
  if (!indexEl) return;

  var tools = [];
  try { tools = JSON.parse(indexEl.textContent); } catch (e) { return; }

  function score(tool, q) {
    var name = tool.n.toLowerCase();
    var i = name.indexOf(q);
    if (i === 0) return 100;                       // starts with the query
    if (i > 0) return 70 - i;                      // contains it
    var words = name.split(/\s+/);
    for (var w = 0; w < words.length; w++) {
      if (words[w].indexOf(q) === 0) return 60;    // a word starts with it
    }
    if ((tool.k || '').indexOf(q) > -1) return 40; // keyword match
    if ((tool.c || '').toLowerCase().indexOf(q) > -1) return 20;
    return 0;
  }

  /* Each search input on the page gets its own independent results panel. */
  function wire(input) {
    var panel = document.getElementById(input.id + '-results');
    if (!panel) return;
    var active = -1;

    function render(list) {
      active = -1;
      if (!list.length) {
        panel.innerHTML = '<div class="sr-empty">No tool matches that. Try \u201cbmi\u201d, \u201ctip\u201d or \u201cqr\u201d.</div>';
      } else {
        panel.innerHTML = list.map(function (t) {
          return '<a role="option" href="' + t.u + '"><span>' + t.n + '</span>' +
                 '<span class="sr-cat">' + t.c + '</span></a>';
        }).join('');
      }
      panel.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }

    function close() {
      panel.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      active = -1;
    }

    function search() {
      var q = input.value.trim().toLowerCase();
      if (q.length < 2) { close(); return; }
      var hits = [];
      for (var i = 0; i < tools.length; i++) {
        var s = score(tools[i], q);
        if (s > 0) hits.push({ s: s, t: tools[i] });
      }
      hits.sort(function (a, b) { return b.s - a.s; });
      render(hits.slice(0, 8).map(function (h) { return h.t; }));
    }

    function move(delta) {
      var links = panel.querySelectorAll('a');
      if (!links.length) return;
      if (active > -1) links[active].classList.remove('is-active');
      active = (active + delta + links.length) % links.length;
      links[active].classList.add('is-active');
      links[active].scrollIntoView({ block: 'nearest' });
    }

    input.addEventListener('input', search);
    input.addEventListener('focus', function () { if (input.value.trim().length >= 2) search(); });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter') {
        var links = panel.querySelectorAll('a');
        if (!panel.hidden && links.length) {
          e.preventDefault();
          links[active > -1 ? active : 0].click();
        }
      } else if (e.key === 'Escape') { close(); input.blur(); }
    });

    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && e.target !== input) close();
    });
  }

  var inputs = document.querySelectorAll('.js-search');
  for (var n = 0; n < inputs.length; n++) wire(inputs[n]);

  // "/" anywhere on the page jumps to the first search box.
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && inputs.length &&
        !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
      e.preventDefault();
      inputs[0].focus();
    }
  });
})();
