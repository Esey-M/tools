export default {
  slug: 'grocery-list-maker',
  category: 'home',
  title: 'Grocery List Maker – Organised by Supermarket Aisle',
  h1: 'Grocery List Maker',
  cardText: 'A shopping list that sorts itself into aisles so you only walk the shop once.',
  description:
    'Free grocery list maker. Type your shopping and it sorts automatically into supermarket aisles, saves in your browser, and works offline on your phone.',
  keywords: ['grocery list', 'shopping list maker', 'grocery list app', 'shopping list by aisle', 'free shopping list'],
  updated: '2026-09-04',
  lede: 'Type what you need and it drops into the right aisle automatically. Saved in your browser, so it is still there in the shop.',

  form: `
<form id="add-form" class="gl-add">
  <label for="item" class="vh">Add an item</label>
  <input type="text" id="item" placeholder="milk, 6 eggs, bread…" autocomplete="off" enterkeyhint="done">
  <button type="submit" class="btn">Add</button>
</form>
<p class="hint" style="margin-top:8px">Tip: type several separated by commas to add them all at once.</p>

<div id="list" class="gl-list"></div>

<div class="btn-row" style="margin-top:20px">
  <button type="button" class="btn btn-ghost" id="uncheck">Uncheck all</button>
  <button type="button" class="btn btn-ghost" id="clearDone">Remove ticked</button>
  <button type="button" class="btn btn-ghost" id="copy">Copy list</button>
  <button type="button" class="btn btn-ghost" id="clear">Clear everything</button>
</div>
<p class="hint" id="meta" style="margin-top:12px"></p>`,

  css: `
.gl-add{display:flex;gap:9px;align-items:stretch}
.gl-add input{flex:1;min-width:0;font-size:1.02rem}
.gl-add button{flex:none}
.gl-list{margin-top:22px;display:flex;flex-direction:column;gap:18px}
.gl-aisle h3{font-size:.78rem;text-transform:uppercase;letter-spacing:.08em;color:var(--accent);
  font-weight:660;margin-bottom:9px;display:flex;align-items:center;gap:8px}
.gl-aisle h3 span{color:var(--ink-3);font-weight:500;letter-spacing:0;text-transform:none;font-size:.8rem}
.gl-items{display:flex;flex-direction:column;gap:2px}
.gl-item{display:flex;align-items:center;gap:11px;padding:9px 11px;border-radius:var(--radius-sm);
  border:1px solid transparent}
.gl-item:hover{background:var(--bg-raised);border-color:var(--line)}
.gl-item input{width:auto;flex:none;accent-color:var(--accent);width:18px;height:18px}
.gl-item label{flex:1;cursor:pointer;font-size:.97rem}
.gl-item.done label{text-decoration:line-through;color:var(--ink-3)}
.gl-item button{width:30px;height:30px;border:none;background:transparent;color:var(--ink-3);
  cursor:pointer;font-size:1.1rem;line-height:1;border-radius:6px;flex:none}
.gl-item button:hover{background:var(--bg-hover);color:var(--danger)}
.gl-empty{color:var(--ink-3);font-size:.92rem;text-align:center;padding:26px 0}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var KEY = 'cp-grocery';
  var items = [];

  // Keyword to aisle. First match wins, so longer phrases come first.
  var AISLES = [
    ['Fruit & veg', ['apple','banana','orange','lemon','lime','grape','berry','berries','strawberr','blueberr','raspberr',
      'melon','peach','pear','plum','mango','pineapple','avocado','tomato','potato','onion','garlic','carrot','broccoli',
      'cauliflower','spinach','lettuce','salad','cucumber','pepper','courgette','zucchini','aubergine','eggplant',
      'mushroom','celery','leek','cabbage','sprout','bean','pea','corn','herb','basil','coriander','parsley','ginger','fruit','veg']],
    ['Meat & fish', ['chicken','beef','pork','lamb','mince','steak','bacon','sausage','ham','turkey','salmon','tuna',
      'cod','prawn','shrimp','fish','meat','chorizo','pancetta']],
    ['Dairy & eggs', ['milk','cheese','butter','yoghurt','yogurt','cream','egg','margarine','feta','mozzarella',
      'cheddar','parmesan','creme fraiche','custard']],
    ['Bakery', ['bread','roll','bagel','baguette','croissant','cake','muffin','pastry','tortilla','pitta','pita','naan','bun','crumpet']],
    ['Frozen', ['frozen','ice cream','peas frozen','chips','fries']],
    ['Cupboard', ['flour','sugar','rice','pasta','noodle','oil','vinegar','salt','pepper','spice','stock','tin','can',
      'sauce','ketchup','mayo','mustard','honey','jam','peanut butter','cereal','oats','lentil','chickpea','coconut',
      'soy sauce','curry','tomato puree','baking','yeast','vanilla','chocolate','biscuit','cracker','crisps','nuts','raisin']],
    ['Drinks', ['water','juice','coffee','tea','squash','cola','beer','wine','lemonade','drink','soda','smoothie']],
    ['Household', ['toilet','kitchen roll','paper towel','bin bag','washing','detergent','soap','shampoo','toothpaste',
      'cleaner','bleach','sponge','foil','cling film','nappy','nappies','tissue','deodorant','razor']]
  ];
  var OTHER = 'Other';

  function aisleFor(name){
    var lower = name.toLowerCase();
    for (var i = 0; i < AISLES.length; i++) {
      for (var k = 0; k < AISLES[i][1].length; k++) {
        if (lower.indexOf(AISLES[i][1][k]) > -1) return AISLES[i][0];
      }
    }
    return OTHER;
  }

  function save(){
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
  }

  function render(){
    if (!items.length) {
      $('list').innerHTML = '<p class="gl-empty">Your list is empty. Add something above.</p>';
      $('meta').textContent = '';
      save();
      return;
    }

    var order = AISLES.map(function(a){ return a[0]; }).concat([OTHER]);
    var grouped = {};
    items.forEach(function(it, i){
      (grouped[it.aisle] = grouped[it.aisle] || []).push({ item: it, index: i });
    });

    $('list').innerHTML = order.filter(function(a){ return grouped[a]; }).map(function(aisle){
      var rows = grouped[aisle];
      var doneCount = rows.filter(function(r){ return r.item.done; }).length;
      return '<div class="gl-aisle"><h3>' + aisle +
        '<span>' + rows.length + (doneCount ? ' · ' + doneCount + ' ticked' : '') + '</span></h3>' +
        '<div class="gl-items">' + rows.map(function(r){
          return '<div class="gl-item' + (r.item.done ? ' done' : '') + '">' +
            '<input type="checkbox" id="i' + r.index + '" data-i="' + r.index + '"' + (r.item.done ? ' checked' : '') + '>' +
            '<label for="i' + r.index + '">' + r.item.name.replace(/[<>&]/g, '') + '</label>' +
            '<button type="button" data-rm="' + r.index + '" aria-label="Remove ' + r.item.name.replace(/["<>&]/g, '') + '">×</button></div>';
        }).join('') + '</div></div>';
    }).join('');

    var done = items.filter(function(i){ return i.done; }).length;
    $('meta').textContent = items.length + (items.length === 1 ? ' item' : ' items') +
      (done ? ', ' + done + ' ticked off' : '') + ' — saved in this browser';
    save();
  }

  function add(text){
    // A comma-separated line adds several items at once.
    text.split(',').map(function(s){ return s.trim(); }).filter(Boolean).forEach(function(name){
      items.push({ name: name, aisle: aisleFor(name), done: false });
    });
    render();
  }

  $('add-form').addEventListener('submit', function(e){
    e.preventDefault();
    var v = $('item').value.trim();
    if (!v) return;
    add(v);
    $('item').value = '';
    $('item').focus();
  });

  $('list').addEventListener('change', function(e){
    var cb = e.target.closest('input[data-i]'); if (!cb) return;
    items[parseInt(cb.getAttribute('data-i'), 10)].done = cb.checked;
    render();
  });
  $('list').addEventListener('click', function(e){
    var b = e.target.closest('button[data-rm]'); if (!b) return;
    items.splice(parseInt(b.getAttribute('data-rm'), 10), 1);
    render();
  });

  $('uncheck').addEventListener('click', function(){
    items.forEach(function(i){ i.done = false; }); render();
  });
  $('clearDone').addEventListener('click', function(){
    items = items.filter(function(i){ return !i.done; }); render();
  });
  $('clear').addEventListener('click', function(){
    if (items.length && !confirm('Clear the whole list?')) return;
    items = []; render();
  });
  $('copy').addEventListener('click', function(){
    var text = items.map(function(i){ return (i.done ? '[x] ' : '[ ] ') + i.name; }).join('\\n');
    navigator.clipboard.writeText(text).then(function(){
      var b = $('copy'); b.textContent = 'Copied'; setTimeout(function(){ b.textContent = 'Copy list'; }, 1400);
    });
  });

  try { items = JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { items = []; }
  render();
})();`,

  answerHeading: 'Why sorting by aisle matters',
  answer: `<p><strong>A list written in the order you thought of things makes you walk the shop several times.</strong> Sorting by aisle means one pass: fruit and veg, then meat, then dairy, then cupboard. It also cuts impulse buying, which supermarkets rely on — the longer and more wandering your route, the more you pick up. This tool assigns an aisle automatically from the item name, saves everything in your browser, and keeps working with no signal in the shop.</p>`,

  steps: [
    'Type an item and press enter. Add several at once by separating them with commas.',
    'Items drop into the right aisle automatically.',
    'Tick things off as you shop — the list survives closing the page.',
    'Use <strong>remove ticked</strong> at the end to leave next week’s list clean.',
  ],

  sections: [
    {
      id: 'saving',
      h2: 'Spending less without much effort',
      html: `<p>Three habits do most of the work, and a list is the foundation for all of them.</p>
<ul>
<li><strong>Shop from a list and stick to it.</strong> The list is the plan; the shop is designed to change your mind.</li>
<li><strong>Never shop hungry.</strong> Well-documented and genuinely powerful — hunger shifts what looks appealing towards higher-calorie, higher-margin food.</li>
<li><strong>Check the unit price, not the pack price.</strong> The price per kilogram or per litre is on the shelf label, usually in small print. Bigger packs are not reliably cheaper.</li>
<li><strong>Plan meals before writing the list.</strong> Most food waste comes from ingredients bought without a specific plan for using them.</li>
<li><strong>Look at the top and bottom shelves.</strong> Eye level is prime retail space, sold to the brands that pay for it.</li>
</ul>`,
    },
    {
      id: 'offline',
      h2: 'It works with no signal',
      html: `<p>Supermarkets are notorious dead zones — thick walls, chillers, and a lot of people all using data at once.</p>
<p>Because this list is stored in your browser rather than on a server, it opens and works with no connection at all. Once the page has loaded, ticking items off needs no network.</p>
<p>The trade-off is that the list lives on one device. It does not sync to your partner's phone, and clearing your browser data clears the list. Use <strong>copy list</strong> to send it to someone else.</p>`,
    },
  ],

  faq: [
    { q: 'Is my list saved if I close the page?', a: '<p>Yes. It is stored in your browser’s local storage, so it is still there next time you open the page on the same device and browser.</p>' },
    { q: 'Does it work without internet in the shop?', a: '<p>Yes, once the page has loaded. Nothing needs a connection after that, which is useful given how poor signal usually is inside supermarkets.</p>' },
    { q: 'Can I share the list with someone else?', a: '<p>Press <strong>Copy list</strong> and paste it into a message. There is no live syncing, since that would require an account and a server.</p>' },
    { q: 'How do I add several items quickly?', a: '<p>Type them separated by commas — "milk, eggs, bread, bananas" adds four items in one go, each sorted to its aisle.</p>' },
    { q: 'What if something lands in the wrong aisle?', a: '<p>The aisle is guessed from keywords in the name, so unusual items land in "Other". Renaming with a more common word usually fixes it.</p>' },
    { q: 'Is my shopping list private?', a: '<p>Completely. It never leaves your device, and there is no account or server involved.</p>' },
  ],

  related: ['budget-tracker', 'recipe-scaler', 'cooking-converter', 'what-to-eat-picker'],
};
