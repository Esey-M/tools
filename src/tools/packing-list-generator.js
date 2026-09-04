export default {
  slug: 'packing-list-generator',
  category: 'home',
  title: 'Packing List Generator – A Trip List You Will Not Forget',
  h1: 'Packing List Generator',
  cardText: 'Generates a packing list from your trip type, length and destination climate.',
  description:
    'Free packing list generator. Build a trip-specific list from length, climate and trip type, tick items off as you pack, and save it in your browser.',
  keywords: ['packing list', 'travel packing list', 'holiday packing list', 'what to pack', 'packing checklist'],
  updated: '2026-09-04',
  lede: 'Answer four questions and get a list built for your trip. Tick things off as you pack — it saves as you go.',

  form: `
<div class="row">
  <div class="field">
    <label for="nights">Nights away</label>
    <input type="number" id="nights" inputmode="numeric" min="1" max="60" step="1" value="7">
  </div>
  <div class="field">
    <label for="climate">Climate</label>
    <select id="climate">
      <option value="hot">Hot</option>
      <option value="mild" selected>Mild</option>
      <option value="cold">Cold</option>
    </select>
  </div>
  <div class="field">
    <label for="trip">Trip type</label>
    <select id="trip">
      <option value="leisure" selected>Holiday</option>
      <option value="business">Business</option>
      <option value="beach">Beach</option>
      <option value="hiking">Hiking or outdoors</option>
      <option value="city">City break</option>
    </select>
  </div>
  <div class="field">
    <label for="travel">Travelling by</label>
    <select id="travel">
      <option value="plane" selected>Plane</option>
      <option value="car">Car</option>
      <option value="train">Train</option>
    </select>
  </div>
</div>

<div class="pw-opts" style="margin-bottom:16px">
  <label><input type="checkbox" id="international" checked> International trip</label>
  <label><input type="checkbox" id="kids"> Travelling with children</label>
  <label><input type="checkbox" id="laundry"> Laundry available</label>
</div>

<div class="btn-row">
  <button type="button" class="btn btn-lg" id="make">Build my list</button>
  <button type="button" class="btn btn-ghost" id="copy">Copy list</button>
  <button type="button" class="btn btn-ghost" id="reset">Untick all</button>
</div>

<div id="list" class="pack-list"></div>
<p class="hint" id="meta" style="margin-top:12px"></p>`,

  css: `
.pw-opts{display:grid;gap:9px;grid-template-columns:repeat(auto-fit,minmax(190px,1fr))}
.pw-opts label{display:flex;align-items:center;gap:8px;font-size:.9rem;color:var(--ink-2);cursor:pointer}
.pw-opts input{width:auto}
.pack-list{margin-top:22px;display:grid;gap:20px;grid-template-columns:repeat(auto-fill,minmax(250px,1fr))}
.pack-group h3{font-size:.78rem;text-transform:uppercase;letter-spacing:.08em;color:var(--accent);
  font-weight:660;margin-bottom:9px}
.pack-group ul{list-style:none;padding:0;display:flex;flex-direction:column;gap:1px}
.pack-group li{display:flex;align-items:flex-start;gap:9px;padding:6px 8px;border-radius:6px}
.pack-group li:hover{background:var(--bg-raised)}
.pack-group input{width:17px;height:17px;flex:none;margin-top:2px;accent-color:var(--accent)}
.pack-group label{font-size:.92rem;cursor:pointer}
.pack-group li.done label{text-decoration:line-through;color:var(--ink-3)}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var KEY = 'cp-packing';
  var ticked = {};

  function n(){ return Math.max(1, parseInt($('nights').value, 10) || 1); }

  function build(){
    var nights = n();
    var climate = $('climate').value;
    var trip = $('trip').value;
    var travel = $('travel').value;
    var intl = $('international').checked;
    var kids = $('kids').checked;
    var laundry = $('laundry').checked;

    // With laundry, cap clothing at about a week's worth.
    var days = laundry ? Math.min(nights, 7) : nights;
    var plural = function(count, item){ return count + ' × ' + item; };

    var groups = [];

    groups.push(['Documents & money', [
      'Passport' + (intl ? '' : ' or photo ID'),
      intl ? 'Visa or entry documents' : null,
      'Travel insurance details',
      'Bank cards',
      'Some local cash',
      travel === 'plane' ? 'Boarding passes' : null,
      travel === 'car' ? 'Driving licence and car documents' : null,
      intl && travel === 'car' ? 'International driving permit' : null,
      'Accommodation confirmations',
      'Emergency contacts written down'
    ]]);

    var tops = Math.ceil(days * (climate === 'hot' ? 1.1 : 1));
    groups.push(['Clothing', [
      plural(Math.min(days + 2, 14), 'underwear'),
      plural(Math.min(days + 2, 14), 'pairs of socks'),
      plural(tops, 'tops or t-shirts'),
      plural(Math.max(2, Math.ceil(days / 3)), 'trousers or skirts'),
      climate === 'cold' ? plural(2, 'warm jumpers') : null,
      climate === 'cold' ? 'Warm coat' : (climate === 'mild' ? 'Light jacket' : null),
      climate === 'hot' ? 'Sun hat' : null,
      climate === 'cold' ? 'Hat, scarf and gloves' : null,
      'Sleepwear',
      trip === 'business' ? 'Suit or smart outfit' : null,
      trip === 'business' ? 'Formal shoes' : null,
      trip === 'beach' ? plural(2, 'swimwear') : null,
      trip === 'beach' ? 'Beach towel' : null,
      trip === 'hiking' ? 'Waterproof jacket' : null,
      trip === 'hiking' ? 'Walking boots, worn in' : null,
      trip === 'hiking' ? 'Base layers' : null,
      trip === 'city' ? 'Comfortable walking shoes' : null,
      nights > 4 ? 'One smart outfit for going out' : null
    ]]);

    groups.push(['Toiletries & health', [
      'Toothbrush and toothpaste',
      'Deodorant',
      'Shampoo and shower gel' + (travel === 'plane' ? ' (under 100ml)' : ''),
      'Razor and shaving kit',
      'Any prescription medication, in original packaging',
      'Painkillers',
      'Plasters and blister pads',
      climate === 'hot' || trip === 'beach' ? 'Sun cream, high factor' : null,
      climate === 'hot' ? 'After-sun' : null,
      trip === 'hiking' || climate === 'hot' ? 'Insect repellent' : null,
      'Hand sanitiser',
      intl ? 'Copy of prescriptions, if you carry medication' : null
    ]]);

    groups.push(['Electronics', [
      'Phone and charger',
      travel === 'plane' ? 'Power bank (carry-on only)' : 'Power bank',
      intl ? 'Travel adaptor' : null,
      'Headphones',
      trip === 'business' ? 'Laptop and charger' : null,
      trip === 'leisure' || trip === 'city' ? 'Camera and charger' : null,
      'Charging cables'
    ]]);

    groups.push(['Bag & practical', [
      'Day bag or backpack',
      'Reusable water bottle',
      travel === 'plane' ? 'Liquids bag for security' : null,
      nights > 3 ? 'Laundry bag for dirty clothes' : null,
      'Umbrella or packable rain jacket',
      trip === 'beach' ? 'Flip flops' : null,
      trip === 'hiking' ? 'Map or offline maps downloaded' : null,
      travel === 'car' ? 'Snacks and drinks for the journey' : null,
      travel === 'plane' && nights > 7 ? 'Luggage scales' : null,
      'Something to read'
    ]]);

    if (kids) {
      groups.push(['For the children', [
        'Snacks',
        'Favourite toy or comforter',
        'Tablet or entertainment, charged',
        'Spare clothes in hand luggage',
        'Child medication and thermometer',
        'Wet wipes',
        travel === 'car' ? 'Car seat' : null,
        intl ? 'Children’s passports' : null
      ]]);
    }

    groups.push(['Before you leave', [
      'Check passport expiry — many countries need 6 months',
      'Tell your bank you are travelling',
      'Set an out-of-office',
      'Check in online',
      'Arrange pet or plant care',
      'Turn down the heating',
      'Lock windows and doors',
      'Take the bins out'
    ]]);

    render(groups);
  }

  function render(groups){
    var total = 0, done = 0;
    $('list').innerHTML = groups.map(function(g){
      var items = g[1].filter(Boolean);
      return '<div class="pack-group"><h3>' + g[0] + '</h3><ul>' + items.map(function(item){
        var id = 'p-' + btoa(unescape(encodeURIComponent(g[0] + '|' + item))).replace(/[^a-zA-Z0-9]/g, '');
        var on = !!ticked[id];
        total++; if (on) done++;
        return '<li class="' + (on ? 'done' : '') + '"><input type="checkbox" id="' + id + '" data-k="' + id + '"' +
          (on ? ' checked' : '') + '><label for="' + id + '">' + item + '</label></li>';
      }).join('') + '</ul></div>';
    }).join('');

    $('meta').textContent = done + ' of ' + total + ' packed — ticks are saved in this browser';
    try { localStorage.setItem(KEY, JSON.stringify(ticked)); } catch (e) {}
  }

  $('list').addEventListener('change', function(e){
    var cb = e.target.closest('input[data-k]'); if (!cb) return;
    var k = cb.getAttribute('data-k');
    if (cb.checked) ticked[k] = 1; else delete ticked[k];
    cb.closest('li').classList.toggle('done', cb.checked);
    var boxes = $('list').querySelectorAll('input[data-k]');
    var done = $('list').querySelectorAll('input[data-k]:checked').length;
    $('meta').textContent = done + ' of ' + boxes.length + ' packed — ticks are saved in this browser';
    try { localStorage.setItem(KEY, JSON.stringify(ticked)); } catch (e) {}
  });

  $('make').addEventListener('click', build);
  $('reset').addEventListener('click', function(){ ticked = {}; build(); });
  $('copy').addEventListener('click', function(){
    var text = [].map.call($('list').querySelectorAll('.pack-group'), function(g){
      return g.querySelector('h3').textContent + '\\n' +
        [].map.call(g.querySelectorAll('li'), function(li){
          return (li.classList.contains('done') ? '[x] ' : '[ ] ') + li.querySelector('label').textContent;
        }).join('\\n');
    }).join('\\n\\n');
    navigator.clipboard.writeText(text).then(function(){
      var b = $('copy'); b.textContent = 'Copied'; setTimeout(function(){ b.textContent = 'Copy list'; }, 1400);
    });
  });
  ['nights','climate','trip','travel','international','kids','laundry'].forEach(function(id){
    $(id).addEventListener($(id).type === 'checkbox' || $(id).tagName === 'SELECT' ? 'change' : 'input', build);
  });

  try { ticked = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { ticked = {}; }
  build();
})();`,

  answerHeading: 'How to pack without overpacking',
  answer: `<p><strong>Almost everyone packs for the trip they imagine rather than the one they take.</strong> The reliable fix is to count clothing by days rather than by outfit ideas: underwear and socks for the number of nights plus two, tops for roughly one a day, and bottoms for every third day. If laundry is available anywhere on the trip, cap everything at about a week regardless of how long you are away. The classic test is to lay out everything you plan to take, then remove a third of the clothes and double the money.</p>`,

  steps: [
    'Set the number of nights, the climate and the type of trip.',
    'Tick international, children or laundry if they apply.',
    'The list rebuilds instantly. Tick things off as you pack.',
    'Use <strong>copy list</strong> to send it to someone else or print it.',
  ],

  sections: [
    {
      id: 'quantities',
      h2: 'How much clothing to take',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Item</th><th>Rule of thumb</th></tr></thead>
<tbody>
<tr><td>Underwear and socks</td><td>Nights + 2</td></tr>
<tr><td>Tops</td><td>One per day, plus one in hot climates</td></tr>
<tr><td>Trousers or skirts</td><td>One per three days, minimum two</td></tr>
<tr><td>Jumpers</td><td>Two in cold climates, one otherwise</td></tr>
<tr><td>Shoes</td><td>Two pairs, one worn on the journey</td></tr>
<tr><td>Anything "just in case"</td><td>Leave it, unless it is medication</td></tr>
</tbody></table></div>
<p>With laundry access, cap everything at about seven days. Two weeks away does not mean fourteen shirts — it means seven shirts and one wash.</p>`,
    },
    {
      id: 'carry-on',
      h2: 'What belongs in your hand luggage',
      html: `<p>Airlines lose or delay a small but non-trivial share of checked bags. The rule is simple: anything you cannot replace in a day goes in the cabin.</p>
<ul>
<li><strong>Medication</strong>, in original packaging, with enough for a few extra days.</li>
<li><strong>Passport, cards and cash.</strong></li>
<li><strong>Phone, chargers and power bank.</strong> Lithium batteries are not permitted in checked luggage at all.</li>
<li><strong>One change of clothes</strong> and basic toiletries.</li>
<li><strong>Anything valuable</strong> — laptop, camera, jewellery.</li>
<li><strong>Keys</strong>, so you can get back into your own home.</li>
</ul>
<p>Liquids in the cabin are limited to 100ml containers in a single transparent bag at most airports, though several are gradually removing the rule as scanners are upgraded. Assume the restriction applies unless you have checked.</p>`,
    },
  ],

  faq: [
    { q: 'How many outfits for a week away?', a: '<p>Roughly seven tops, three bottoms, and nine sets of underwear and socks. Mixing a few neutral bottoms with more varied tops gives many more combinations than packing complete outfits.</p>' },
    { q: 'What should I never put in checked luggage?', a: '<p>Medication, documents, valuables, and anything with a lithium battery — power banks and spare batteries are prohibited in the hold by most airlines.</p>' },
    { q: 'Is my list saved?', a: '<p>The ticks are, in your browser. Rebuilding the list for a different trip keeps ticks for items that appear in both.</p>' },
    { q: 'How early should I check my passport?', a: '<p>As soon as you book. Many countries require six months of validity beyond your return date, and renewals can take weeks.</p>' },
    { q: 'Roll or fold?', a: '<p>Rolling saves a little space and creases less for casual clothes. Fold anything structured — shirts and jackets — and use packing cubes if you want the real space saving.</p>' },
  ],

  related: ['countdown-timer', 'time-zone-converter', 'currency-converter', 'grocery-list-maker'],
};
