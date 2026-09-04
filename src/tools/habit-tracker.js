export default {
  slug: 'habit-tracker',
  category: 'home',
  title: 'Habit Tracker – Build a Streak, Free and Private',
  h1: 'Habit Tracker',
  cardText: 'Track daily habits on a simple grid and watch the streaks build.',
  description:
    'Free habit tracker. Add daily habits, tick them off on a 30-day grid, and see your current streak and completion rate. Saved in your browser, no account.',
  keywords: ['habit tracker', 'daily habit tracker', 'streak tracker', 'habit tracker online', 'free habit tracker'],
  updated: '2026-09-04',
  lede: 'Add a habit, tick each day you do it. Everything saves in your browser — no account, no app, no reminders nagging you.',

  form: `
<form id="add-form" class="ht-add">
  <label for="habit" class="vh">Add a habit</label>
  <input type="text" id="habit" placeholder="Read for 20 minutes" maxlength="60" autocomplete="off">
  <button type="submit" class="btn">Add habit</button>
</form>

<div id="grid" class="ht-wrap"></div>

<div class="btn-row" style="margin-top:20px">
  <button type="button" class="btn btn-ghost" id="export">Copy as text</button>
  <button type="button" class="btn btn-ghost" id="clear">Clear everything</button>
</div>
<p class="hint" id="meta" style="margin-top:12px"></p>`,

  css: `
.ht-add{display:flex;gap:9px}
.ht-add input{flex:1;min-width:0;font-size:1.02rem}
.ht-add button{flex:none}
.ht-wrap{margin-top:22px;overflow-x:auto}
.ht-table{border-collapse:separate;border-spacing:3px;min-width:640px}
.ht-table th{font-size:.66rem;color:var(--ink-3);font-weight:600;text-align:center;padding:0 0 4px;
  font-variant-numeric:tabular-nums}
.ht-table th.today{color:var(--accent);font-weight:800}
.ht-name{text-align:left !important;min-width:170px;font-size:.94rem;font-weight:560;color:var(--ink);
  padding-right:12px !important}
.ht-name .sub{display:block;font-size:.75rem;color:var(--ink-3);font-weight:400;margin-top:2px}
.ht-cell{width:22px;height:22px;border-radius:5px;background:var(--bg-sunken);border:1px solid var(--line);
  cursor:pointer;padding:0;display:block}
.ht-cell:hover{border-color:var(--accent)}
.ht-cell.on{background:var(--accent);border-color:var(--accent)}
.ht-cell.future{opacity:.35;cursor:default}
.ht-cell.today-col{box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 35%,transparent)}
.ht-rm{width:28px;height:28px;border:none;background:transparent;color:var(--ink-3);cursor:pointer;
  font-size:1.05rem;border-radius:6px}
.ht-rm:hover{background:var(--bg-hover);color:var(--danger)}
.ht-empty{color:var(--ink-3);text-align:center;padding:30px 0;font-size:.93rem}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var KEY = 'cp-habits';
  var DAYS = 30;
  var habits = [];

  function pad(n){ return n < 10 ? '0' + n : '' + n; }
  function iso(d){ return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  /** The last DAYS days, oldest first, ending today. */
  function window30(){
    var out = [], today = new Date();
    today.setHours(0, 0, 0, 0);
    for (var i = DAYS - 1; i >= 0; i--) {
      var d = new Date(today);
      d.setDate(d.getDate() - i);
      out.push(d);
    }
    return out;
  }

  function streak(habit){
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var count = 0;
    var d = new Date(today);
    // A habit not yet ticked today does not break the streak — check yesterday.
    if (!habit.days[iso(d)]) d.setDate(d.getDate() - 1);
    while (habit.days[iso(d)]) { count++; d.setDate(d.getDate() - 1); }
    return count;
  }

  function save(){
    try { localStorage.setItem(KEY, JSON.stringify(habits)); } catch (e) {}
  }

  function render(){
    if (!habits.length) {
      $('grid').innerHTML = '<p class="ht-empty">No habits yet. Add one above to start.</p>';
      $('meta').textContent = '';
      save();
      return;
    }

    var days = window30();
    var todayIso = iso(new Date());

    var html = '<table class="ht-table"><thead><tr><th class="ht-name"></th>';
    days.forEach(function(d){
      var isToday = iso(d) === todayIso;
      html += '<th' + (isToday ? ' class="today"' : '') + '>' + d.getDate() + '</th>';
    });
    html += '<th></th></tr></thead><tbody>';

    habits.forEach(function(h, hi){
      var done = days.filter(function(d){ return h.days[iso(d)]; }).length;
      var s = streak(h);
      html += '<tr><td class="ht-name">' + h.name.replace(/[<>&]/g, '') +
        '<span class="sub">' + (s > 0 ? s + ' day streak · ' : '') + done + '/' + DAYS + ' days · ' +
        Math.round(done / DAYS * 100) + '%</span></td>';
      days.forEach(function(d){
        var key = iso(d);
        var on = !!h.days[key];
        var isToday = key === todayIso;
        html += '<td><button type="button" class="ht-cell' + (on ? ' on' : '') + (isToday ? ' today-col' : '') +
          '" data-h="' + hi + '" data-d="' + key + '" aria-pressed="' + on + '" aria-label="' +
          h.name.replace(/["<>&]/g, '') + ' on ' + key + '"></button></td>';
      });
      html += '<td><button type="button" class="ht-rm" data-rm="' + hi + '" aria-label="Remove habit">×</button></td></tr>';
    });
    html += '</tbody></table>';
    $('grid').innerHTML = html;

    var totalDone = habits.reduce(function(a, h){
      return a + days.filter(function(d){ return h.days[iso(d)]; }).length;
    }, 0);
    $('meta').textContent = habits.length + (habits.length === 1 ? ' habit' : ' habits') + ' · ' +
      totalDone + ' of ' + (habits.length * DAYS) + ' possible days ticked · saved in this browser';
    save();
  }

  $('add-form').addEventListener('submit', function(e){
    e.preventDefault();
    var v = $('habit').value.trim();
    if (!v) return;
    habits.push({ name: v, days: {} });
    $('habit').value = '';
    render();
  });

  $('grid').addEventListener('click', function(e){
    var cell = e.target.closest('button[data-d]');
    if (cell) {
      var h = habits[parseInt(cell.getAttribute('data-h'), 10)];
      var key = cell.getAttribute('data-d');
      if (h.days[key]) delete h.days[key]; else h.days[key] = 1;
      render();
      return;
    }
    var rm = e.target.closest('button[data-rm]');
    if (rm) {
      habits.splice(parseInt(rm.getAttribute('data-rm'), 10), 1);
      render();
    }
  });

  $('clear').addEventListener('click', function(){
    if (habits.length && !confirm('Clear all habits and history?')) return;
    habits = []; render();
  });

  $('export').addEventListener('click', function(){
    var days = window30();
    var text = habits.map(function(h){
      return h.name + '  ' + days.map(function(d){ return h.days[iso(d)] ? '#' : '.'; }).join('') +
        '  (' + streak(h) + ' day streak)';
    }).join('\\n');
    navigator.clipboard.writeText(text).then(function(){
      var b = $('export'); b.textContent = 'Copied'; setTimeout(function(){ b.textContent = 'Copy as text'; }, 1400);
    });
  });

  try { habits = JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { habits = []; }
  render();
})();`,

  answerHeading: 'Why ticking a box works',
  answer: `<p><strong>Tracking a habit changes the behaviour, not just the record of it.</strong> The effect is well documented in behaviour research: measuring something makes it salient, and a visible run of ticks creates a small but real reluctance to break the chain. It also replaces a vague sense of "I've been meaning to" with an honest number. The common claim that habits take 21 days to form is a misreading of a 1960s plastic surgery observation — the actual research puts it at a median of 66 days, with enormous variation.</p>`,

  steps: [
    'Add a habit, phrased as something you either did or did not do today.',
    'Tap a square for each day you complete it. You can fill in past days you missed marking.',
    'Watch the streak and completion rate build.',
    'Everything is saved in your browser automatically.',
  ],

  sections: [
    {
      id: 'design',
      h2: 'Choosing habits that stick',
      html: `<ul>
<li><strong>Make it embarrassingly small to start.</strong> "Read one page" beats "read for an hour" because it survives bad days, and the hard part is showing up, not the volume.</li>
<li><strong>Make it binary.</strong> A habit you can definitively tick or not tick works; "eat better" does not.</li>
<li><strong>Attach it to something you already do.</strong> "After I make coffee, I read one page" is far more reliable than an intention with no trigger.</li>
<li><strong>Track no more than three or four at once.</strong> A grid full of gaps is demoralising and stops being useful.</li>
<li><strong>Never miss twice.</strong> One missed day is noise. Two in a row is how a habit quietly ends.</li>
</ul>`,
    },
    {
      id: 'privacy',
      h2: 'No account, and no nagging',
      html: `<p>Habit apps generally want an account, notifications and often a subscription. This is deliberately none of those things.</p>
<p>Your habits are stored in your browser's local storage. Nothing is uploaded, there is nothing to sign into, and no notification will ever appear. The trade-off is that the data lives on one device and clearing your browser data clears it — use <strong>copy as text</strong> if you want a record elsewhere.</p>
<p>Bookmark the page, or add it to your phone's home screen, and it opens like an app.</p>`,
    },
  ],

  faq: [
    { q: 'Is my data private?', a: '<p>Completely. Habits are stored in your browser and never transmitted. There is no account and no server involved.</p>' },
    { q: 'Will it sync between my phone and laptop?', a: '<p>No. Local storage is per device and per browser. Use "copy as text" to move a record across.</p>' },
    { q: 'How long does it take to form a habit?', a: '<p>Research by Phillippa Lally found a median of 66 days to reach automaticity, ranging from 18 to 254 depending on the person and the habit. The popular 21-day figure has no research behind it.</p>' },
    { q: 'Can I tick off past days?', a: '<p>Yes. Any day in the 30-day grid can be toggled, so you can fill in days you forgot to mark at the time.</p>' },
    { q: 'What happens if I miss a day?', a: '<p>The streak resets, but the completion percentage keeps the fuller picture. Missing one day matters much less than missing two in a row.</p>' },
  ],

  related: ['todo-list', 'budget-tracker', 'countdown-timer', 'sleep-calculator'],
};
