export default {
  slug: 'currency-converter',
  category: 'converters',
  title: 'Currency Converter – Live Exchange Rates',
  h1: 'Currency Converter',
  cardText: 'Convert between 30 currencies using daily European Central Bank rates.',
  description:
    'Free currency converter using daily European Central Bank reference rates. Convert between 30 major currencies, with a clear note on why your bank gives you less.',
  keywords: ['currency converter', 'exchange rate calculator', 'usd to eur', 'gbp to usd', 'money converter'],
  updated: '2026-09-04',
  disclaimer: 'Reference rates only. What you actually receive depends on your bank or provider.',
  lede: 'Rates come from the European Central Bank, published each working day. These are mid-market reference rates — the number your bank quotes will be worse, and the page explains by how much.',

  form: `
<div class="row" style="align-items:end">
  <div class="field">
    <label for="amount">Amount</label>
    <input type="number" id="amount" inputmode="decimal" step="any" min="0" value="100" style="font-size:1.15rem">
  </div>
  <div class="field">
    <label for="from">From</label>
    <select id="from"></select>
  </div>
  <div class="field" style="flex:0 0 auto">
    <span class="field-label">&nbsp;</span>
    <button type="button" class="btn btn-ghost" id="swap" aria-label="Swap currencies" style="width:100%">⇄</button>
  </div>
  <div class="field">
    <label for="to">To</label>
    <select id="to"></select>
  </div>
</div>

<div class="result" id="out" aria-live="polite">
  <div class="result-label" id="lbl">Converted</div>
  <div class="result-value" id="value">—</div>
  <div class="result-note" id="rate"></div>
</div>

<p class="hint" id="status" style="margin-top:12px"></p>

<div style="margin-top:20px">
  <h2 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);margin-bottom:9px">Common amounts</h2>
  <div class="table-scroll"><table id="quick"><thead><tr><th>Amount</th><th id="qh">Converts to</th></tr></thead><tbody></tbody></table></div>
</div>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };

  var NAMES = {
    AUD:'Australian dollar', BGN:'Bulgarian lev', BRL:'Brazilian real', CAD:'Canadian dollar',
    CHF:'Swiss franc', CNY:'Chinese yuan', CZK:'Czech koruna', DKK:'Danish krone',
    EUR:'Euro', GBP:'British pound', HKD:'Hong Kong dollar', HUF:'Hungarian forint',
    IDR:'Indonesian rupiah', ILS:'Israeli shekel', INR:'Indian rupee', ISK:'Icelandic krona',
    JPY:'Japanese yen', KRW:'South Korean won', MXN:'Mexican peso', MYR:'Malaysian ringgit',
    NOK:'Norwegian krone', NZD:'New Zealand dollar', PHP:'Philippine peso', PLN:'Polish zloty',
    RON:'Romanian leu', SEK:'Swedish krona', SGD:'Singapore dollar', THB:'Thai baht',
    TRY:'Turkish lira', USD:'US dollar', ZAR:'South African rand'
  };

  // Baked in so the page still works if the rates service is unavailable.
  var FALLBACK = { date: '2026-09-04', base: 'USD', rates: { AUD: 1.3882, BRL: 5.1114, CAD: 1.38, CHF: 0.80924, CNY: 6.7109, CZK: 20.813, DKK: 6.4315, EUR: 0.86044, GBP: 0.7391, HKD: 7.8403, HUF: 312.58, IDR: 17636, ILS: 3.0076, INR: 94.49, ISK: 121.15, JPY: 156.25, KRW: 1350.35, MXN: 16.8991, MYR: 4.0445, NOK: 9.2957, NZD: 1.6998, PHP: 62.65, PLN: 3.7126, RON: 4.5199, SEK: 9.5513, SGD: 1.2669, THB: 32.92, TRY: 48.443, USD: 1.0, ZAR: 15.9672 } };
  var data = FALLBACK;
  var live = false;

  function fill(){
    var codes = Object.keys(data.rates).filter(function(c){ return NAMES[c]; }).sort();
    var opts = codes.map(function(c){
      return '<option value="' + c + '">' + c + ' — ' + NAMES[c] + '</option>';
    }).join('');
    $('from').innerHTML = opts;
    $('to').innerHTML = opts;
    $('from').value = 'USD';
    $('to').value = 'EUR';
  }

  function rate(from, to){
    // Everything is quoted against the base, so cross rates divide out.
    return data.rates[to] / data.rates[from];
  }

  function fmt(n, code){
    var decimals = (code === 'JPY' || code === 'KRW' || code === 'IDR' || code === 'HUF' || code === 'ISK') ? 0 : 2;
    return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  function convert(){
    var amount = parseFloat($('amount').value);
    var from = $('from').value, to = $('to').value;
    if (!isFinite(amount) || !data.rates[from] || !data.rates[to]) return;

    var r = rate(from, to);
    var result = amount * r;

    $('value').textContent = fmt(result, to) + ' ' + to;
    $('lbl').textContent = fmt(amount, from) + ' ' + from + ' equals';
    $('rate').textContent = '1 ' + from + ' = ' + (Math.round(r * 10000) / 10000) + ' ' + to +
      '  ·  1 ' + to + ' = ' + (Math.round((1 / r) * 10000) / 10000) + ' ' + from;

    $('qh').textContent = to;
    $('quick').querySelector('tbody').innerHTML = [1, 5, 10, 20, 50, 100, 500, 1000].map(function(a){
      return '<tr><td>' + a.toLocaleString('en-US') + ' ' + from + '</td><td>' + fmt(a * r, to) + ' ' + to + '</td></tr>';
    }).join('');
  }

  function setStatus(){
    $('status').textContent = live
      ? 'European Central Bank reference rates for ' + data.date + '. Updated each working day around 16:00 CET.'
      : 'Showing saved rates from ' + data.date + ' — the live rates service could not be reached, so these may be out of date.';
  }

  ['amount','from','to'].forEach(function(id){
    $(id).addEventListener($(id).tagName === 'SELECT' ? 'change' : 'input', convert);
  });
  $('swap').addEventListener('click', function(){
    var f = $('from').value; $('from').value = $('to').value; $('to').value = f;
    convert();
  });

  fill();
  setStatus();
  convert();

  // Fetch live rates; the page is already usable if this fails.
  fetch('https://api.frankfurter.dev/v1/latest?base=USD')
    .then(function(r){ return r.ok ? r.json() : Promise.reject(); })
    .then(function(json){
      json.rates.USD = 1;
      data = { date: json.date, base: 'USD', rates: json.rates };
      live = true;
      var f = $('from').value, t = $('to').value;
      fill();
      $('from').value = f; $('to').value = t;
      setStatus();
      convert();
    })
    .catch(function(){ /* keep the baked-in rates */ });
})();`,

  answerHeading: 'Why your bank gives you less than this',
  answer: `<p><strong>The rate shown here is the mid-market rate — the midpoint between what banks pay and charge each other, and the rate you will almost never actually get.</strong> Retail providers add a spread on top, typically 0.5% at a specialist money transfer service, 2–3% at a high street bank, and 5–12% at an airport bureau de change. A "0% commission" sign means the fee is hidden in the rate rather than charged separately. Comparing any provider's rate against the mid-market rate here shows exactly what they are charging you.</p>`,

  steps: [
    'Enter an amount and pick the two currencies.',
    'Use the swap button to reverse the direction.',
    'The table underneath shows common amounts at the same rate.',
  ],

  sections: [
    {
      id: 'spread',
      h2: 'What the spread actually costs',
      html: `<p>On exchanging $1,000, the difference between providers is real money.</p>
<div class="table-scroll"><table>
<thead><tr><th>Where</th><th>Typical markup</th><th>Cost on $1,000</th></tr></thead>
<tbody>
<tr><td>Specialist transfer service</td><td>0.3–0.7%</td><td>$3–7</td></tr>
<tr><td>Online broker</td><td>0.5–1%</td><td>$5–10</td></tr>
<tr><td>High street bank</td><td>2–3%</td><td>$20–30</td></tr>
<tr><td>Card payment abroad</td><td>0–3% depending on the card</td><td>$0–30</td></tr>
<tr><td>Airport bureau de change</td><td>5–12%</td><td>$50–120</td></tr>
</tbody></table></div>
<p>Two specific traps are worth knowing. <strong>Dynamic currency conversion</strong> is when a foreign card terminal offers to charge you in your home currency — always decline and pay in the local currency, since the terminal's rate is invariably worse. And <strong>airport exchange desks</strong> are the most expensive option available almost everywhere; withdrawing from an ATM with a fee-free card usually costs a fraction as much.</p>`,
    },
    {
      id: 'ecb',
      h2: 'Where these rates come from',
      html: `<p>The European Central Bank publishes reference rates each working day, based on a concertation procedure between central banks at around 14:15 CET, usually updated on the site by 16:00.</p>
<p>They are reference rates, not trading rates. They do not update through the day, and there are no rates published at weekends or on Eurosystem holidays — the figures shown then are the most recent working day's.</p>
<p>For a holiday budget or an invoice, that is entirely adequate. For anything where intraday movement matters, you need a live market feed rather than a daily reference.</p>`,
    },
    {
      id: 'privacy',
      h2: 'The one tool here that uses the network',
      html: `<p>Almost every tool on this site runs entirely in your browser with no requests at all. This one is the exception, because exchange rates have to come from somewhere.</p>
<p>When the page loads, your browser requests the day's rates from <code>api.frankfurter.dev</code>, an open-source service that republishes ECB data. Only that request is made — the amounts you type and the currencies you pick stay in your browser and are never sent anywhere.</p>
<p>If the request fails, the page falls back to rates baked in at build time and says so plainly rather than showing stale numbers as though they were current.</p>`,
    },
  ],

  faq: [
    { q: 'How often do the rates update?', a: '<p>Once per working day. The European Central Bank publishes reference rates in the afternoon CET, and there are no updates at weekends or on Eurosystem holidays.</p>' },
    { q: 'Why is my bank\'s rate different?', a: '<p>Because this is the mid-market rate. Every retail provider adds a margin — typically 2–3% at a high street bank and much more at an airport. The gap between their rate and this one is their charge.</p>' },
    { q: 'Should I pay in local currency or my own abroad?', a: '<p>Always local. When a terminal offers to charge in your home currency, that is dynamic currency conversion, and the rate is set by the terminal operator rather than your card network. It is consistently worse.</p>' },
    { q: 'Can I use this rate for accounting or tax?', a: '<p>Check what your tax authority requires. Many accept ECB or central bank reference rates for a given date, but some mandate their own published rates. These are ECB reference rates, with the date shown.</p>' },
    { q: 'Are my amounts sent anywhere?', a: '<p>No. Only a request for the day\'s rate table is made. What you type stays in your browser.</p>' },
    { q: 'Why are some currencies missing?', a: '<p>The ECB publishes around 30 major currencies. Currencies outside that set, including most pegged and thinly traded ones, are not covered.</p>' },
  ],

  related: ['unit-converter', 'percentage-calculator', 'sales-tax-calculator', 'budget-tracker'],
};
