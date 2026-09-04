export default {
  slug: 'time-zone-converter',
  category: 'converters',
  title: 'Time Zone Converter – Compare Times Across Cities',
  h1: 'Time Zone Converter',
  cardText: 'Compare a time across several cities at once, with overlap hours shown.',
  description:
    'Free time zone converter. Pick a time and see it across several cities at once, with daylight saving handled and working-hours overlap highlighted.',
  keywords: ['time zone converter', 'world clock', 'time difference calculator', 'meeting planner time zones', 'what time is it in'],
  updated: '2026-09-04',
  lede: 'Set a time in one city and see it everywhere else. Daylight saving is handled automatically, including the dates it changes.',

  form: `
<div class="row">
  <div class="field">
    <label for="date">Date</label>
    <input type="date" id="date">
  </div>
  <div class="field">
    <label for="time">Time</label>
    <input type="time" id="time" value="14:00">
  </div>
  <div class="field">
    <label for="base">In this city</label>
    <select id="base"></select>
  </div>
</div>

<div class="btn-row" style="margin-bottom:6px">
  <button type="button" class="btn btn-ghost" id="now">Use current time</button>
</div>

<div class="field">
  <label for="add">Add a city</label>
  <select id="add"><option value="">Choose a city to add…</option></select>
</div>

<div id="zones" class="tz-list"></div>

<div style="margin-top:22px">
  <h2 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);margin-bottom:10px">Working-hours overlap</h2>
  <div id="overlap" class="tz-overlap"></div>
  <p class="hint" style="margin-top:9px">Green marks 09:00–17:00 local time. Columns where every city is green are good meeting slots.</p>
</div>`,

  css: `
.tz-list{display:flex;flex-direction:column;gap:8px;margin-top:16px}
.tz-row{display:flex;align-items:center;gap:14px;background:var(--bg-raised);border:1px solid var(--line);
  border-radius:var(--radius);padding:12px 15px}
.tz-row.base{border-color:var(--accent);background:var(--accent-soft)}
.tz-city{flex:1;min-width:0}
.tz-city b{display:block;font-size:.97rem;font-weight:600}
.tz-city span{display:block;font-size:.8rem;color:var(--ink-3);margin-top:2px}
.tz-time{text-align:right;flex:none}
.tz-time b{display:block;font-size:1.28rem;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.tz-time span{display:block;font-size:.78rem;color:var(--ink-3);margin-top:2px}
.tz-row .rm{width:30px;height:30px;border:none;background:transparent;color:var(--ink-3);cursor:pointer;
  font-size:1.1rem;border-radius:6px;flex:none}
.tz-row .rm:hover{background:var(--bg-hover);color:var(--danger)}
.tz-overlap{overflow-x:auto}
.tz-grid{display:grid;gap:2px;min-width:660px}
.tz-grid .lbl{font-size:.8rem;color:var(--ink-2);padding-right:10px;display:flex;align-items:center;white-space:nowrap}
.tz-cell{height:26px;border-radius:3px;background:var(--bg-sunken);display:grid;place-items:center;
  font-size:.68rem;color:var(--ink-3);font-variant-numeric:tabular-nums}
.tz-cell.work{background:color-mix(in srgb,var(--accent) 26%,transparent);color:var(--accent-ink);font-weight:600}
.tz-cell.edge{background:color-mix(in srgb,var(--warn) 24%,transparent);color:var(--warn)}
.tz-head{font-size:.68rem;color:var(--ink-3);text-align:center;font-variant-numeric:tabular-nums}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };

  var CITIES = [
    ['Los Angeles', 'America/Los_Angeles'], ['Denver', 'America/Denver'],
    ['Chicago', 'America/Chicago'], ['New York', 'America/New_York'],
    ['Toronto', 'America/Toronto'], ['Mexico City', 'America/Mexico_City'],
    ['São Paulo', 'America/Sao_Paulo'], ['London', 'Europe/London'],
    ['Dublin', 'Europe/Dublin'], ['Lisbon', 'Europe/Lisbon'],
    ['Paris', 'Europe/Paris'], ['Berlin', 'Europe/Berlin'],
    ['Madrid', 'Europe/Madrid'], ['Rome', 'Europe/Rome'],
    ['Stockholm', 'Europe/Stockholm'], ['Warsaw', 'Europe/Warsaw'],
    ['Athens', 'Europe/Athens'], ['Istanbul', 'Europe/Istanbul'],
    ['Moscow', 'Europe/Moscow'], ['Lagos', 'Africa/Lagos'],
    ['Cairo', 'Africa/Cairo'], ['Johannesburg', 'Africa/Johannesburg'],
    ['Nairobi', 'Africa/Nairobi'], ['Dubai', 'Asia/Dubai'],
    ['Karachi', 'Asia/Karachi'], ['Mumbai', 'Asia/Kolkata'],
    ['Dhaka', 'Asia/Dhaka'], ['Bangkok', 'Asia/Bangkok'],
    ['Jakarta', 'Asia/Jakarta'], ['Singapore', 'Asia/Singapore'],
    ['Hong Kong', 'Asia/Hong_Kong'], ['Shanghai', 'Asia/Shanghai'],
    ['Seoul', 'Asia/Seoul'], ['Tokyo', 'Asia/Tokyo'],
    ['Sydney', 'Australia/Sydney'], ['Melbourne', 'Australia/Melbourne'],
    ['Perth', 'Australia/Perth'], ['Auckland', 'Pacific/Auckland'],
    ['Honolulu', 'Pacific/Honolulu'], ['UTC', 'UTC']
  ];

  var selected = [];

  function pad(n){ return n < 10 ? '0' + n : '' + n; }

  /** The UTC instant for a wall-clock time in a given zone, found by iteration. */
  function zonedTimeToUtc(y, mo, d, h, mi, zone){
    var guess = Date.UTC(y, mo, d, h, mi);
    for (var i = 0; i < 3; i++) {
      var offset = offsetAt(new Date(guess), zone);
      guess = Date.UTC(y, mo, d, h, mi) - offset;
    }
    return new Date(guess);
  }

  /** Offset in ms between a zone and UTC at a given instant. */
  function offsetAt(date, zone){
    var dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: zone, hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    var parts = {};
    dtf.formatToParts(date).forEach(function(p){ if (p.type !== 'literal') parts[p.type] = p.value; });
    var asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day,
                         +parts.hour % 24, +parts.minute, +parts.second);
    return asUtc - Math.floor(date.getTime() / 1000) * 1000;
  }

  function partsIn(date, zone){
    var dtf = new Intl.DateTimeFormat('en-GB', {
      timeZone: zone, hour12: false,
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit'
    });
    var p = {};
    dtf.formatToParts(date).forEach(function(x){ if (x.type !== 'literal') p[x.type] = x.value; });
    return p;
  }

  function abbrev(date, zone){
    try {
      var s = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'short' }).formatToParts(date);
      for (var i = 0; i < s.length; i++) if (s[i].type === 'timeZoneName') return s[i].value;
    } catch (e) {}
    return '';
  }

  function fillSelects(){
    $('base').innerHTML = CITIES.map(function(c){
      return '<option value="' + c[1] + '">' + c[0] + '</option>';
    }).join('');
    $('add').innerHTML = '<option value="">Choose a city to add…</option>' +
      CITIES.map(function(c){ return '<option value="' + c[1] + '">' + c[0] + '</option>'; }).join('');
  }

  function nameOf(zone){
    for (var i = 0; i < CITIES.length; i++) if (CITIES[i][1] === zone) return CITIES[i][0];
    return zone;
  }

  function baseInstant(){
    var dv = $('date').value, tv = $('time').value || '00:00';
    var dm = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(dv);
    var tm = /^(\\d{1,2}):(\\d{2})$/.exec(tv);
    if (!dm || !tm) return null;
    return zonedTimeToUtc(+dm[1], +dm[2] - 1, +dm[3], +tm[1], +tm[2], $('base').value);
  }

  function render(){
    var instant = baseInstant();
    if (!instant) return;
    var baseZone = $('base').value;
    var zones = [baseZone].concat(selected.filter(function(z){ return z !== baseZone; }));

    $('zones').innerHTML = zones.map(function(z, i){
      var p = partsIn(instant, z);
      var diff = (offsetAt(instant, z) - offsetAt(instant, baseZone)) / 3600000;
      var diffLabel = i === 0 ? 'Reference' :
        (diff === 0 ? 'Same time' : (diff > 0 ? '+' : '') + (Math.round(diff * 10) / 10) + 'h');
      return '<div class="tz-row' + (i === 0 ? ' base' : '') + '">' +
        '<span class="tz-city"><b>' + nameOf(z) + '</b><span>' + p.weekday + ' ' + p.day + ' ' + p.month +
        ' · ' + abbrev(instant, z) + ' · ' + diffLabel + '</span></span>' +
        '<span class="tz-time"><b>' + p.hour + ':' + p.minute + '</b><span>' + z.replace('_', ' ') + '</span></span>' +
        (i === 0 ? '' : '<button type="button" class="rm" data-z="' + z + '" aria-label="Remove ' + nameOf(z) + '">×</button>') +
        '</div>';
    }).join('');

    renderOverlap(instant, zones);
  }

  function renderOverlap(instant, zones){
    // 24 columns starting from midnight in the reference zone.
    var baseZone = zones[0];
    var p = partsIn(instant, baseZone);
    var dm = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec($('date').value);
    if (!dm) return;
    var midnight = zonedTimeToUtc(+dm[1], +dm[2] - 1, +dm[3], 0, 0, baseZone);

    var html = '<div class="tz-grid" style="grid-template-columns:120px repeat(24,1fr)">';
    html += '<div class="lbl"></div>';
    for (var h = 0; h < 24; h++) html += '<div class="tz-head">' + pad(h) + '</div>';

    zones.forEach(function(z){
      html += '<div class="lbl">' + nameOf(z) + '</div>';
      for (var h = 0; h < 24; h++) {
        var t = new Date(midnight.getTime() + h * 3600000);
        var local = parseInt(partsIn(t, z).hour, 10);
        var cls = (local >= 9 && local < 17) ? ' work' : ((local >= 8 && local < 19) ? ' edge' : '');
        html += '<div class="tz-cell' + cls + '">' + pad(local) + '</div>';
      }
    });
    html += '</div>';
    $('overlap').innerHTML = html;
  }

  $('add').addEventListener('change', function(){
    if (this.value && selected.indexOf(this.value) === -1) selected.push(this.value);
    this.value = '';
    render();
  });
  $('zones').addEventListener('click', function(e){
    var b = e.target.closest('button[data-z]'); if (!b) return;
    selected = selected.filter(function(z){ return z !== b.getAttribute('data-z'); });
    render();
  });
  ['date','time','base'].forEach(function(id){
    $(id).addEventListener($(id).tagName === 'SELECT' ? 'change' : 'input', render);
  });
  $('now').addEventListener('click', function(){
    var n = new Date();
    var p = partsIn(n, $('base').value);
    var iso = new Intl.DateTimeFormat('en-CA', { timeZone: $('base').value, year: 'numeric', month: '2-digit', day: '2-digit' }).format(n);
    $('date').value = iso;
    $('time').value = p.hour + ':' + p.minute;
    render();
  });

  fillSelects();
  // Start in the visitor's own zone where we recognise it.
  var localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (CITIES.some(function(c){ return c[1] === localZone; })) $('base').value = localZone;
  else $('base').value = 'Europe/London';
  selected = ['America/New_York', 'Asia/Tokyo'].filter(function(z){ return z !== $('base').value; });

  var now = new Date();
  $('date').value = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
  render();
})();`,

  answerHeading: 'How the conversion handles daylight saving',
  answer: `<p><strong>Time zone offsets are not fixed — they change on daylight saving dates, and different countries change on different days.</strong> This converter uses your browser's built-in IANA time zone database rather than storing fixed offsets, so it knows that New York is 5 hours behind London in January but 4 hours behind for most of the year, and it handles the two-week windows in spring and autumn when the US and Europe have already switched but the other has not. That gap is where most scheduling mistakes actually happen.</p>`,

  steps: [
    'Set the date and time, and the city that time is in.',
    'Add more cities from the dropdown.',
    'Read the converted times, or use the overlap grid to find a slot that works for everyone.',
  ],

  sections: [
    {
      id: 'dst',
      h2: 'The two weeks nobody accounts for',
      html: `<p>The US switches to daylight saving on the second Sunday in March and back on the first Sunday in November. The EU and UK switch on the last Sundays of March and October.</p>
<p>That leaves two windows each year — roughly three weeks in March and one in late October — when the usual difference between, say, London and New York is off by an hour. Recurring meetings set months earlier quietly move, and half the participants arrive at the wrong time.</p>
<p>Australia and New Zealand complicate it further by being in the southern hemisphere: their daylight saving runs opposite to the north, so the gap between London and Sydney swings between 9 and 11 hours across the year.</p>
<p>Most of Asia, Africa and South America do not observe daylight saving at all.</p>`,
    },
    {
      id: 'scheduling',
      h2: 'Scheduling across time zones without annoying anyone',
      html: `<ul>
<li><strong>Always name the zone.</strong> "3pm ET" is unambiguous; "3pm" is not, and "3pm EST" is wrong for eight months of the year.</li>
<li><strong>Use the overlap grid.</strong> Columns where every city is green are the slots where nobody is being asked to work unsociable hours.</li>
<li><strong>Rotate the pain.</strong> If a team spans Europe and Asia-Pacific, no time suits everyone. Alternating who takes the early or late call is fairer than fixing it once.</li>
<li><strong>Send a calendar invite, not a time.</strong> Calendar software converts automatically; a time written in an email does not.</li>
<li><strong>Beware India and Nepal.</strong> India is UTC+5:30 and Nepal UTC+5:45 — half-hour and quarter-hour offsets are easy to round wrongly.</li>
</ul>`,
    },
  ],

  faq: [
    { q: 'Does this handle daylight saving automatically?', a: '<p>Yes. It uses the IANA time zone database built into your browser, so both the current rules and the exact changeover dates are applied for whatever date you pick.</p>' },
    { q: 'Why does the time difference change during the year?', a: '<p>Because countries start and end daylight saving on different dates. London and New York are usually 5 hours apart but spend a few weeks each spring and autumn 4 or 6 hours apart.</p>' },
    { q: 'What does the overlap grid show?', a: '<p>Each city’s local hour across 24 hours. Green is 09:00–17:00 and amber is the tolerable edges, 08:00–19:00. A column green all the way down is a comfortable meeting slot.</p>' },
    { q: 'Which zones have half-hour offsets?', a: '<p>India (UTC+5:30), Iran, Afghanistan (+4:30), parts of Australia (+9:30) and Newfoundland (−3:30). Nepal uses +5:45 and the Chatham Islands +12:45.</p>' },
    { q: 'Should I write EST or ET?', a: '<p>ET, unless you specifically mean standard time. EST is only correct in winter; from March to November the correct abbreviation is EDT. ET covers both.</p>' },
  ],

  related: ['date-difference-calculator', 'countdown-timer', 'age-calculator', 'unit-converter'],
};
