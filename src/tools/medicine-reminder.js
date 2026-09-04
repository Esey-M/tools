export default {
  slug: 'medicine-reminder',
  category: 'health',
  title: 'Medicine Schedule Planner – Work Out Your Dose Times',
  h1: 'Medicine Schedule Planner',
  cardText: 'Turns "three times a day" into actual times, and tracks today’s doses.',
  description:
    'Free medicine schedule planner. Turn a dosing frequency into specific times across your waking day, tick off each dose, and print or copy the schedule.',
  keywords: ['medication schedule', 'medicine reminder', 'dose times calculator', 'pill schedule', 'when to take medication'],
  updated: '2026-09-04',
  disclaimer: 'A planning aid only. Always follow the instructions on your prescription and your pharmacist’s advice.',
  lede: '"Three times a day" is not the same as "every 8 hours". This works out sensible times either way, and lets you tick off doses as you take them.',

  form: `
<form id="add-form" class="med-add">
  <input type="text" id="name" placeholder="Medicine name" maxlength="60" autocomplete="off" aria-label="Medicine name">
  <select id="freq" aria-label="How often">
    <option value="1">Once a day</option>
    <option value="2" selected>Twice a day</option>
    <option value="3">Three times a day</option>
    <option value="4">Four times a day</option>
    <option value="e4">Every 4 hours</option>
    <option value="e6">Every 6 hours</option>
    <option value="e8">Every 8 hours</option>
    <option value="e12">Every 12 hours</option>
  </select>
  <input type="time" id="first" value="08:00" aria-label="First dose time">
  <button type="submit" class="btn">Add</button>
</form>
<p class="hint" style="margin-top:8px">Choose “every N hours” only if your prescription says so — it means waking in the night.</p>

<div id="list" class="med-list"></div>

<div class="btn-row" style="margin-top:20px">
  <button type="button" class="btn btn-ghost" id="reset">Reset today’s ticks</button>
  <button type="button" class="btn btn-ghost" id="copy">Copy schedule</button>
  <button type="button" class="btn btn-ghost" id="clear">Remove all</button>
</div>
<p class="hint" id="meta" style="margin-top:12px"></p>`,

  css: `
.med-add{display:grid;grid-template-columns:1fr 170px 130px auto;gap:9px}
@media (max-width:680px){.med-add{grid-template-columns:1fr 1fr}.med-add input[type=text]{grid-column:1/-1}}
.med-list{margin-top:22px;display:flex;flex-direction:column;gap:12px}
.med-card{background:var(--bg-raised);border:1px solid var(--line);border-radius:var(--radius);padding:14px 16px}
.med-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:10px}
.med-head b{font-size:1.02rem;font-weight:620}
.med-head span{font-size:.82rem;color:var(--ink-3)}
.med-head button{border:none;background:transparent;color:var(--ink-3);cursor:pointer;font-size:1.05rem;
  border-radius:6px;width:28px;height:28px;flex:none}
.med-head button:hover{background:var(--bg-hover);color:var(--danger)}
.med-times{display:flex;flex-wrap:wrap;gap:8px}
.med-dose{display:flex;align-items:center;gap:7px;padding:7px 12px;border:1px solid var(--line-strong);
  border-radius:999px;background:var(--bg);cursor:pointer;font-size:.92rem;font-variant-numeric:tabular-nums}
.med-dose input{width:16px;height:16px;accent-color:var(--accent)}
.med-dose.taken{background:var(--accent-soft);border-color:var(--accent);color:var(--accent-ink);
  text-decoration:line-through}
.med-empty{color:var(--ink-3);text-align:center;padding:26px 0;font-size:.93rem}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var KEY = 'cp-meds';
  var meds = [];

  function pad(n){ return n < 10 ? '0' + n : '' + n; }
  function todayKey(){ var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function fmt(mins){
    mins = ((mins % 1440) + 1440) % 1440;
    var h = Math.floor(mins / 60), m = mins % 60;
    var suffix = h < 12 ? 'am' : 'pm';
    return (h % 12 === 0 ? 12 : h % 12) + ':' + pad(m) + ' ' + suffix;
  }

  /**
   * "N times a day" spreads doses across the waking day; "every N hours"
   * spaces them evenly round the clock, including overnight.
   */
  function times(med){
    var m = /^(\\d{1,2}):(\\d{2})$/.exec(med.first);
    var start = m ? (+m[1] * 60 + +m[2]) : 480;
    var out = [];
    if (med.freq[0] === 'e') {
      var gap = parseInt(med.freq.slice(1), 10) * 60;
      for (var t = 0; t < 24 * 60; t += gap) out.push(start + t);
    } else {
      var n = parseInt(med.freq, 10);
      if (n === 1) out.push(start);
      else {
        // Spread across a 14-hour waking day, so 3x a day is roughly 8am, 3pm, 10pm.
        var span = 14 * 60;
        for (var i = 0; i < n; i++) out.push(start + Math.round(span / (n - 1) * i));
      }
    }
    return out;
  }

  function label(freq){
    if (freq[0] === 'e') return 'every ' + freq.slice(1) + ' hours';
    var n = parseInt(freq, 10);
    return n === 1 ? 'once a day' : n + ' times a day';
  }

  function save(){ try { localStorage.setItem(KEY, JSON.stringify(meds)); } catch (e) {} }

  function render(){
    if (!meds.length) {
      $('list').innerHTML = '<p class="med-empty">No medicines added yet.</p>';
      $('meta').textContent = '';
      save();
      return;
    }
    var today = todayKey();
    var totalDoses = 0, taken = 0;

    $('list').innerHTML = meds.map(function(med, mi){
      var slots = times(med);
      med.taken = med.taken || {};
      if (med.takenDate !== today) { med.taken = {}; med.takenDate = today; }

      return '<div class="med-card"><div class="med-head">' +
        '<b>' + med.name.replace(/[<>&]/g, '') + '</b>' +
        '<span>' + label(med.freq) + ' · ' + slots.length + ' doses</span>' +
        '<button type="button" data-rm="' + mi + '" aria-label="Remove">×</button></div>' +
        '<div class="med-times">' + slots.map(function(t, ti){
          var on = !!med.taken[ti];
          totalDoses++; if (on) taken++;
          return '<label class="med-dose' + (on ? ' taken' : '') + '">' +
            '<input type="checkbox" data-m="' + mi + '" data-t="' + ti + '"' + (on ? ' checked' : '') + '>' +
            fmt(t) + '</label>';
        }).join('') + '</div></div>';
    }).join('');

    $('meta').textContent = taken + ' of ' + totalDoses + ' doses ticked today — saved in this browser';
    save();
  }

  $('add-form').addEventListener('submit', function(e){
    e.preventDefault();
    var name = $('name').value.trim();
    if (!name) return;
    meds.push({ name: name, freq: $('freq').value, first: $('first').value || '08:00', taken: {}, takenDate: todayKey() });
    $('name').value = '';
    render();
  });

  $('list').addEventListener('change', function(e){
    var cb = e.target.closest('input[data-m]'); if (!cb) return;
    var med = meds[parseInt(cb.getAttribute('data-m'), 10)];
    var ti = cb.getAttribute('data-t');
    if (cb.checked) med.taken[ti] = 1; else delete med.taken[ti];
    render();
  });
  $('list').addEventListener('click', function(e){
    var b = e.target.closest('button[data-rm]'); if (!b) return;
    meds.splice(parseInt(b.getAttribute('data-rm'), 10), 1);
    render();
  });

  $('reset').addEventListener('click', function(){
    meds.forEach(function(m){ m.taken = {}; });
    render();
  });
  $('clear').addEventListener('click', function(){
    if (meds.length && !confirm('Remove all medicines?')) return;
    meds = []; render();
  });
  $('copy').addEventListener('click', function(){
    var text = meds.map(function(m){
      return m.name + ' (' + label(m.freq) + '): ' + times(m).map(fmt).join(', ');
    }).join('\\n');
    navigator.clipboard.writeText(text).then(function(){
      var b = $('copy'); b.textContent = 'Copied'; setTimeout(function(){ b.textContent = 'Copy schedule'; }, 1400);
    });
  });

  try { meds = JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { meds = []; }
  render();
})();`,

  answerHeading: '"Three times a day" versus "every 8 hours"',
  answer: `<p><strong>These are different instructions, and confusing them is a common and occasionally serious error.</strong> "Three times a day" means spread across your waking hours — roughly 8am, 3pm and 10pm — and you sleep through the night. "Every 8 hours" means genuinely every 8 hours, including setting an alarm at 4am, because the drug needs an even blood concentration. Some antibiotics and painkillers specify the second deliberately. If your label says every N hours, follow it; if it says N times a day, waking up is not required.</p>`,

  steps: [
    'Enter the medicine name and how often it is prescribed.',
    'Set the time of your first dose.',
    'Tick each dose as you take it. Ticks reset automatically at midnight.',
  ],

  sections: [
    {
      id: 'timing',
      h2: 'Common instructions and what they mean',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Instruction</th><th>Means</th></tr></thead>
<tbody>
<tr><td>Once daily</td><td>Same time each day; consistency matters more than which time</td></tr>
<tr><td>Twice daily</td><td>Roughly 12 hours apart, typically morning and evening</td></tr>
<tr><td>Three times daily</td><td>Spread across waking hours, not every 8 hours</td></tr>
<tr><td>Every 8 hours</td><td>Genuinely every 8 hours, including overnight</td></tr>
<tr><td>Before food</td><td>Usually 30–60 minutes before eating</td></tr>
<tr><td>With or after food</td><td>To reduce stomach irritation or aid absorption</td></tr>
<tr><td>As needed (PRN)</td><td>Only when symptoms require it, respecting the maximum</td></tr>
</tbody></table></div>
<p>If the label and the leaflet disagree, or the instruction is ambiguous, ask the pharmacist. They will answer without an appointment and it is exactly what they are there for.</p>`,
    },
    {
      id: 'adherence',
      h2: 'Things that actually help you remember',
      html: `<ul>
<li><strong>Attach it to something you already do.</strong> Brushing your teeth, making coffee, going to bed. An existing habit is a far better trigger than an intention.</li>
<li><strong>Use a pill organiser.</strong> A weekly box answers "did I take it?" instantly, which is the question that causes accidental double doses.</li>
<li><strong>Keep it visible but safe.</strong> Next to the kettle beats inside a cupboard — provided there are no children in the house.</li>
<li><strong>Set a phone alarm for the awkward dose.</strong> The midday one is the one people miss.</li>
<li><strong>Never double up after a missed dose</strong> unless the leaflet says to. Take it when you remember, or skip to the next scheduled one.</li>
<li><strong>Finish the course of antibiotics</strong> even once you feel better.</li>
</ul>`,
    },
  ],

  faq: [
    { q: 'Does this send me notifications?', a: '<p>No. It is a planner and a checklist, not an alarm. For actual reminders, set alarms on your phone at the times shown.</p>' },
    { q: 'Is my medication list private?', a: '<p>Yes. It is stored in your browser and never uploaded. There is no account and no server.</p>' },
    { q: 'What if I miss a dose?', a: '<p>Generally take it when you remember, unless it is nearly time for the next one, in which case skip it. Do not double up. Check the leaflet, since some medications differ.</p>' },
    { q: 'Why does three times a day not mean every 8 hours?', a: '<p>Because "three times a day" is meant to fit your waking hours. "Every 8 hours" is prescribed when even blood levels matter enough to justify waking up. The label tells you which applies.</p>' },
    { q: 'Do the ticks reset each day?', a: '<p>Yes, automatically at midnight, so the schedule is clean each morning.</p>' },
  ],

  related: ['habit-tracker', 'sleep-calculator', 'water-intake-calculator', 'countdown-timer'],
};
