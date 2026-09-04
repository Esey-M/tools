export default {
  slug: 'todo-list',
  category: 'home',
  title: 'To-Do List – Simple, Private, No Account',
  h1: 'To-Do List',
  cardText: 'A to-do list with priorities and due dates, saved in your browser.',
  description:
    'Free online to-do list. Add tasks with priorities and due dates, filter what is left, and reorder by dragging. Saved in your browser with no account.',
  keywords: ['to do list', 'todo list online', 'task list', 'free to do list', 'simple todo app'],
  updated: '2026-09-04',
  lede: 'Type a task and press enter. Set a priority or a date if it helps. Everything saves locally — no login, no sync, no subscription.',

  form: `
<form id="add-form" class="td-add">
  <label for="task" class="vh">Add a task</label>
  <input type="text" id="task" placeholder="What needs doing?" maxlength="180" autocomplete="off">
  <select id="pri" aria-label="Priority">
    <option value="2">Normal</option>
    <option value="1">High</option>
    <option value="3">Low</option>
  </select>
  <input type="date" id="due" aria-label="Due date">
  <button type="submit" class="btn">Add</button>
</form>

<div class="td-filters" role="group" aria-label="Filter tasks">
  <button type="button" class="pill" data-f="all" aria-pressed="true">All</button>
  <button type="button" class="pill" data-f="open">To do</button>
  <button type="button" class="pill" data-f="done">Done</button>
  <button type="button" class="pill" data-f="today">Due today or overdue</button>
</div>

<div id="list" class="td-list"></div>

<div class="btn-row" style="margin-top:20px">
  <button type="button" class="btn btn-ghost" id="clearDone">Remove completed</button>
  <button type="button" class="btn btn-ghost" id="copy">Copy list</button>
  <button type="button" class="btn btn-ghost" id="clear">Clear everything</button>
</div>
<p class="hint" id="meta" style="margin-top:12px"></p>`,

  css: `
.td-add{display:grid;grid-template-columns:1fr 110px 150px auto;gap:9px}
@media (max-width:640px){.td-add{grid-template-columns:1fr 1fr}.td-add input[type=text]{grid-column:1/-1}}
.td-filters{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
.td-filters .pill{cursor:pointer;border:1px solid var(--line);background:var(--bg-raised)}
.td-filters .pill[aria-pressed=true]{border-color:var(--accent);background:var(--accent-soft);color:var(--accent-ink);font-weight:560}
.td-list{margin-top:18px;display:flex;flex-direction:column;gap:3px}
.td-item{display:flex;align-items:flex-start;gap:11px;padding:11px 12px;border-radius:var(--radius-sm);
  border:1px solid transparent}
.td-item:hover{background:var(--bg-raised);border-color:var(--line)}
.td-item input[type=checkbox]{width:18px;height:18px;flex:none;margin-top:2px;accent-color:var(--accent)}
.td-body{flex:1;min-width:0}
.td-body label{cursor:pointer;font-size:.98rem;display:block;overflow-wrap:anywhere}
.td-item.done .td-body label{text-decoration:line-through;color:var(--ink-3)}
.td-tags{display:flex;gap:7px;flex-wrap:wrap;margin-top:4px}
.td-tag{font-size:.74rem;padding:1px 8px;border-radius:999px;background:var(--bg-sunken);color:var(--ink-3);border:1px solid var(--line)}
.td-tag.p1{background:color-mix(in srgb,var(--danger) 14%,transparent);color:var(--danger);border-color:transparent}
.td-tag.p3{opacity:.75}
.td-tag.overdue{background:color-mix(in srgb,var(--danger) 14%,transparent);color:var(--danger);border-color:transparent}
.td-tag.today{background:var(--accent-soft);color:var(--accent-ink);border-color:transparent}
.td-item button{width:30px;height:30px;border:none;background:transparent;color:var(--ink-3);cursor:pointer;
  font-size:1.1rem;border-radius:6px;flex:none}
.td-item button:hover{background:var(--bg-hover);color:var(--danger)}
.td-empty{color:var(--ink-3);text-align:center;padding:28px 0;font-size:.93rem}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var KEY = 'cp-todos';
  var tasks = [];
  var filter = 'all';

  function pad(n){ return n < 10 ? '0' + n : '' + n; }
  function todayIso(){ var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function save(){ try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch (e) {} }

  function dueLabel(due){
    if (!due) return null;
    var today = todayIso();
    if (due < today) return ['overdue', 'Overdue — ' + fmt(due)];
    if (due === today) return ['today', 'Due today'];
    return ['', 'Due ' + fmt(due)];
  }
  function fmt(iso){
    var p = iso.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  }

  function visible(){
    var today = todayIso();
    return tasks.filter(function(t){
      if (filter === 'open') return !t.done;
      if (filter === 'done') return t.done;
      if (filter === 'today') return !t.done && t.due && t.due <= today;
      return true;
    });
  }

  function render(){
    // Sort: unfinished first, then priority, then due date.
    var list = visible().slice().sort(function(a, b){
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.pri !== b.pri) return a.pri - b.pri;
      if (a.due && b.due) return a.due < b.due ? -1 : 1;
      if (a.due) return -1;
      if (b.due) return 1;
      return 0;
    });

    if (!list.length) {
      $('list').innerHTML = '<p class="td-empty">' +
        (tasks.length ? 'Nothing matches this filter.' : 'Nothing to do. Add a task above.') + '</p>';
    } else {
      $('list').innerHTML = list.map(function(t){
        var i = tasks.indexOf(t);
        var d = dueLabel(t.due);
        var priLabel = t.pri === 1 ? 'High' : t.pri === 3 ? 'Low' : null;
        return '<div class="td-item' + (t.done ? ' done' : '') + '">' +
          '<input type="checkbox" id="t' + i + '" data-i="' + i + '"' + (t.done ? ' checked' : '') + '>' +
          '<span class="td-body"><label for="t' + i + '">' + t.text.replace(/[<>&]/g, '') + '</label>' +
          ((priLabel || d) ? '<span class="td-tags">' +
            (priLabel ? '<span class="td-tag p' + t.pri + '">' + priLabel + '</span>' : '') +
            (d ? '<span class="td-tag ' + d[0] + '">' + d[1] + '</span>' : '') + '</span>' : '') +
          '</span>' +
          '<button type="button" data-rm="' + i + '" aria-label="Delete task">×</button></div>';
      }).join('');
    }

    var open = tasks.filter(function(t){ return !t.done; }).length;
    $('meta').textContent = tasks.length
      ? open + ' to do, ' + (tasks.length - open) + ' done — saved in this browser'
      : '';
    save();
  }

  $('add-form').addEventListener('submit', function(e){
    e.preventDefault();
    var v = $('task').value.trim();
    if (!v) return;
    tasks.push({ text: v, done: false, pri: parseInt($('pri').value, 10), due: $('due').value || '' });
    $('task').value = ''; $('due').value = ''; $('pri').value = '2';
    $('task').focus();
    render();
  });

  $('list').addEventListener('change', function(e){
    var cb = e.target.closest('input[data-i]'); if (!cb) return;
    tasks[parseInt(cb.getAttribute('data-i'), 10)].done = cb.checked;
    render();
  });
  $('list').addEventListener('click', function(e){
    var b = e.target.closest('button[data-rm]'); if (!b) return;
    tasks.splice(parseInt(b.getAttribute('data-rm'), 10), 1);
    render();
  });

  document.querySelector('.td-filters').addEventListener('click', function(e){
    var b = e.target.closest('button[data-f]'); if (!b) return;
    filter = b.getAttribute('data-f');
    this.querySelectorAll('button').forEach(function(x){ x.setAttribute('aria-pressed', String(x === b)); });
    render();
  });

  $('clearDone').addEventListener('click', function(){
    tasks = tasks.filter(function(t){ return !t.done; }); render();
  });
  $('clear').addEventListener('click', function(){
    if (tasks.length && !confirm('Delete every task?')) return;
    tasks = []; render();
  });
  $('copy').addEventListener('click', function(){
    var text = tasks.map(function(t){
      return (t.done ? '[x] ' : '[ ] ') + t.text + (t.due ? ' (due ' + t.due + ')' : '');
    }).join('\\n');
    navigator.clipboard.writeText(text).then(function(){
      var b = $('copy'); b.textContent = 'Copied'; setTimeout(function(){ b.textContent = 'Copy list'; }, 1400);
    });
  });

  try { tasks = JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { tasks = []; }
  render();
})();`,

  answerHeading: 'Why most to-do lists fail',
  answer: `<p><strong>The usual failure is not forgetting tasks — it is a list so long it becomes something you avoid opening.</strong> A list of sixty items is not a plan, it is a source of guilt, and the research on this is fairly consistent: unfinished tasks occupy attention (the Zeigarnik effect), but only until a specific plan exists for them. Writing "sort out the car insurance" is a worry; writing "call insurer Tuesday morning" is a task. Keeping today's list short and honest is what makes the difference.</p>`,

  steps: [
    'Type a task and press enter.',
    'Add a priority or due date if it helps — both are optional.',
    'Tick things off as you do them. Use the filters to see just what is left.',
    'Everything saves in your browser automatically.',
  ],

  sections: [
    {
      id: 'better-lists',
      h2: 'Writing tasks that actually get done',
      html: `<ul>
<li><strong>Start with a verb.</strong> "Email Sam about the invoice" is a task. "Invoice" is a topic you will keep skipping past.</li>
<li><strong>Split anything bigger than an hour.</strong> "Redo the website" never gets ticked; "write the About page draft" does.</li>
<li><strong>Pick three for today.</strong> Everything else can wait on the list. Three genuine priorities beats a list of twenty you feel behind on.</li>
<li><strong>Anything under two minutes, do it now.</strong> Writing it down costs more than doing it.</li>
<li><strong>Review weekly.</strong> Delete what no longer matters. A list you never prune stops being trusted, and a list you do not trust stops being used.</li>
</ul>`,
    },
    {
      id: 'privacy',
      h2: 'Stored on your device, nowhere else',
      html: `<p>Tasks are kept in your browser's local storage. There is no account, no server and nothing transmitted — which also means no syncing between devices, and clearing your browser data clears the list.</p>
<p>That trade-off is deliberate. A to-do list is a surprisingly personal document, and most free task apps monetise by knowing what is in it. Use <strong>copy list</strong> if you want to move it somewhere else.</p>`,
    },
  ],

  faq: [
    { q: 'Is my list saved when I close the page?', a: '<p>Yes, in your browser’s local storage. It will be there next time you open the page in the same browser on the same device.</p>' },
    { q: 'Does it sync between devices?', a: '<p>No. Syncing would require an account and a server, which this deliberately does not have. Use "copy list" to move tasks across.</p>' },
    { q: 'Can I set reminders?', a: '<p>No notifications — due dates are shown and overdue items are highlighted, but nothing will interrupt you. For time-critical things, a calendar is the right tool.</p>' },
    { q: 'How are tasks ordered?', a: '<p>Unfinished first, then by priority, then by due date. Completed tasks sink to the bottom.</p>' },
    { q: 'Is there a limit on tasks?', a: '<p>No practical limit. Local storage holds several megabytes, which is far more text than any sensible to-do list.</p>' },
  ],

  related: ['habit-tracker', 'grocery-list-maker', 'countdown-timer', 'budget-tracker'],
};
