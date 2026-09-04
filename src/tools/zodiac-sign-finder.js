export default {
  slug: 'zodiac-sign-finder',
  category: 'fun',
  title: 'Zodiac Sign Finder – Your Star Sign From Your Birth Date',
  h1: 'Zodiac Sign Finder',
  cardText: 'Your star sign, element, and the Chinese zodiac animal for your birth year.',
  description:
    'Free zodiac sign finder. Enter your birth date to get your western star sign with its element and dates, plus your Chinese zodiac animal and birthstone.',
  keywords: ['zodiac sign', 'star sign', 'what is my zodiac sign', 'chinese zodiac', 'horoscope sign dates'],
  updated: '2026-09-04',
  lede: 'Enter your birth date for your star sign, its element and ruling planet, plus your Chinese zodiac animal and birth month stone.',

  form: `
<div class="field">
  <label for="dob">Your birth date</label>
  <input type="date" id="dob" autocomplete="bday">
</div>

<div class="result" id="out" hidden aria-live="polite">
  <div class="zodiac-head">
    <span class="zodiac-glyph" id="glyph" aria-hidden="true">♈</span>
    <div>
      <div class="result-label">Your star sign</div>
      <div class="result-value" id="sign" style="font-size:2.4rem">—</div>
      <div class="result-note" id="dates"></div>
    </div>
  </div>
  <dl class="result-grid">
    <div class="stat"><dt>Element</dt><dd id="element" style="font-size:1.1rem">—</dd></div>
    <div class="stat"><dt>Ruling planet</dt><dd id="planet" style="font-size:1.1rem">—</dd></div>
    <div class="stat"><dt>Chinese zodiac</dt><dd id="chinese" style="font-size:1.1rem">—</dd></div>
    <div class="stat"><dt>Birthstone</dt><dd id="stone" style="font-size:1.1rem">—</dd></div>
  </dl>
  <p class="result-note" id="traits" style="margin-top:14px"></p>
</div>
<p class="hint" id="prompt" style="margin-top:14px">Pick your birth date.</p>`,

  css: `
.zodiac-head{display:flex;align-items:center;gap:18px}
.zodiac-glyph{font-size:3.4rem;line-height:1;color:var(--accent);flex:none}
@media (max-width:460px){.zodiac-head{gap:12px}.zodiac-glyph{font-size:2.6rem}}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };

  // [name, glyph, startMonth, startDay, element, planet, traits]
  var SIGNS = [
    ['Capricorn','♑',12,22,'Earth','Saturn','disciplined, patient and quietly ambitious'],
    ['Aquarius','♒',1,20,'Air','Uranus','independent, inventive and a little contrary'],
    ['Pisces','♓',2,19,'Water','Neptune','imaginative, empathetic and easily moved'],
    ['Aries','♈',3,21,'Fire','Mars','direct, energetic and quick to start things'],
    ['Taurus','♉',4,20,'Earth','Venus','steady, sensual and hard to shift once decided'],
    ['Gemini','♊',5,21,'Air','Mercury','curious, talkative and endlessly adaptable'],
    ['Cancer','♋',6,21,'Water','the Moon','protective, intuitive and deeply loyal'],
    ['Leo','♌',7,23,'Fire','the Sun','warm, generous and comfortable being seen'],
    ['Virgo','♍',8,23,'Earth','Mercury','precise, practical and quietly helpful'],
    ['Libra','♎',9,23,'Air','Venus','diplomatic, sociable and drawn to balance'],
    ['Scorpio','♏',10,23,'Water','Pluto','intense, perceptive and privately determined'],
    ['Sagittarius','♐',11,22,'Fire','Jupiter','optimistic, restless and blunt to a fault']
  ];

  var CHINESE = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'];
  var CH_EMOJI = ['🐀','🐂','🐅','🐇','🐉','🐍','🐎','🐐','🐒','🐓','🐕','🐖'];

  var STONES = ['Garnet','Amethyst','Aquamarine','Diamond','Emerald','Pearl',
                'Ruby','Peridot','Sapphire','Opal','Topaz','Turquoise'];

  function signFor(month, day){
    // Walk the list and take the last sign whose start date is on or before this date.
    var ordered = SIGNS.slice().sort(function(a, b){ return (a[2] * 100 + a[3]) - (b[2] * 100 + b[3]); });
    var key = month * 100 + day;
    var found = ordered[ordered.length - 1];   // wraps to Capricorn for early January
    for (var i = 0; i < ordered.length; i++) {
      if (key >= ordered[i][2] * 100 + ordered[i][3]) found = ordered[i];
    }
    return found;
  }

  function nextOf(sign){
    var ordered = SIGNS.slice().sort(function(a, b){ return (a[2] * 100 + a[3]) - (b[2] * 100 + b[3]); });
    var i = ordered.indexOf(sign);
    return ordered[(i + 1) % ordered.length];
  }

  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function endDate(next){
    var m = next[2], d = next[3] - 1;
    if (d < 1) { m = m === 1 ? 12 : m - 1; d = [31,28,31,30,31,30,31,31,30,31,30,31][m - 1]; }
    return MONTHS[m - 1] + ' ' + d;
  }

  $('dob').addEventListener('input', function(){
    var m = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(this.value);
    if (!m) { $('out').hidden = true; $('prompt').hidden = false; return; }
    var year = +m[1], month = +m[2], day = +m[3];

    var s = signFor(month, day);
    var next = nextOf(s);

    $('glyph').textContent = s[1];
    $('sign').textContent = s[0];
    $('dates').textContent = MONTHS[s[2] - 1] + ' ' + s[3] + ' – ' + endDate(next);
    $('element').textContent = s[4];
    $('planet').textContent = s[5].charAt(0).toUpperCase() + s[5].slice(1);
    $('traits').textContent = s[0] + ' is traditionally described as ' + s[6] + '.';

    // Chinese zodiac cycles every 12 years; 1900 was a Rat year.
    var idx = ((year - 1900) % 12 + 12) % 12;
    $('chinese').textContent = CH_EMOJI[idx] + ' ' + CHINESE[idx];
    $('stone').textContent = STONES[month - 1];

    $('out').hidden = false; $('prompt').hidden = true;
  });

  var t = new Date();
  var pad = function(n){ return n < 10 ? '0' + n : n; };
  $('dob').max = t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
})();`,

  answerHeading: 'How star signs are assigned',
  answer: `<p><strong>Your western star sign comes from where the Sun appeared against the constellations on the date you were born</strong> — as mapped roughly 2,000 years ago. The zodiac is divided into twelve equal 30-degree segments, each about a month long. Because the Earth's axis wobbles slowly, a phenomenon called precession, the constellations have since shifted by nearly a full sign relative to those dates. Western astrology keeps the original fixed dates anyway, which is why the sign you are told is not where the Sun literally was.</p>`,

  steps: [
    'Enter your birth date.',
    'Your sign, element, ruling planet, Chinese zodiac animal and birthstone appear immediately.',
  ],

  sections: [
    {
      id: 'dates',
      h2: 'Star sign dates',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Sign</th><th>Dates</th><th>Element</th><th>Ruling planet</th></tr></thead>
<tbody>
<tr><td>♑ Capricorn</td><td>22 Dec – 19 Jan</td><td>Earth</td><td>Saturn</td></tr>
<tr><td>♒ Aquarius</td><td>20 Jan – 18 Feb</td><td>Air</td><td>Uranus</td></tr>
<tr><td>♓ Pisces</td><td>19 Feb – 20 Mar</td><td>Water</td><td>Neptune</td></tr>
<tr><td>♈ Aries</td><td>21 Mar – 19 Apr</td><td>Fire</td><td>Mars</td></tr>
<tr><td>♉ Taurus</td><td>20 Apr – 20 May</td><td>Earth</td><td>Venus</td></tr>
<tr><td>♊ Gemini</td><td>21 May – 20 Jun</td><td>Air</td><td>Mercury</td></tr>
<tr><td>♋ Cancer</td><td>21 Jun – 22 Jul</td><td>Water</td><td>Moon</td></tr>
<tr><td>♌ Leo</td><td>23 Jul – 22 Aug</td><td>Fire</td><td>Sun</td></tr>
<tr><td>♍ Virgo</td><td>23 Aug – 22 Sep</td><td>Earth</td><td>Mercury</td></tr>
<tr><td>♎ Libra</td><td>23 Sep – 22 Oct</td><td>Air</td><td>Venus</td></tr>
<tr><td>♏ Scorpio</td><td>23 Oct – 21 Nov</td><td>Water</td><td>Pluto</td></tr>
<tr><td>♐ Sagittarius</td><td>22 Nov – 21 Dec</td><td>Fire</td><td>Jupiter</td></tr>
</tbody></table></div>
<p>Boundary dates shift by a day either way depending on the year and your time zone, so if you were born within a day of a cusp the exact time and place of birth decides it.</p>`,
    },
    {
      id: 'chinese',
      h2: 'The Chinese zodiac',
      html: `<p>A separate twelve-year cycle, one animal per year, running Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig.</p>
<p>One caveat worth knowing: the Chinese year begins at Lunar New Year, which falls somewhere between 21 January and 20 February. If you were born in January or early February, your animal is the previous year's. This tool uses the simple calendar-year calculation, so check the Lunar New Year date for your birth year if you fall in that window.</p>`,
    },
    {
      id: 'science',
      h2: 'A note on what this is',
      html: `<p>Astrology is a tradition, not a science. Controlled studies — most notably Shawn Carlson's 1985 double-blind test published in <em>Nature</em> — have consistently found that astrologers cannot match birth charts to personality profiles better than chance.</p>
<p>The reason horoscopes feel accurate is the Barnum effect: vague, generally flattering descriptions are read as personally specific. In a classic demonstration, students given identical generic personality profiles rated them as highly accurate descriptions of themselves.</p>
<p>None of which stops it being fun. It is a shared vocabulary and a conversation starter, and this page is offered in that spirit.</p>`,
    },
  ],

  faq: [
    { q: 'What is my zodiac sign?', a: '<p>Enter your birth date above. It is determined by where the Sun sits in the traditional zodiac on that date.</p>' },
    { q: 'What if I was born on a cusp?', a: '<p>Sign boundaries move by up to a day depending on the year and time zone. If your birthday falls within a day of a boundary, you need your exact birth time and location to be sure. There is no such thing as "being both signs" in standard astrology.</p>' },
    { q: 'Why do some sources say the dates have changed?', a: '<p>Because of precession — Earth’s axis wobbles, so the constellations have drifted nearly a full sign since the dates were set 2,000 years ago. Western astrology deliberately keeps the traditional fixed dates; sidereal astrology, used in India, follows the actual constellations.</p>' },
    { q: 'Is Ophiuchus a real zodiac sign?', a: '<p>The Sun does pass through the constellation Ophiuchus, but western astrology uses twelve equal segments rather than the uneven real constellations, so it has never been part of the system.</p>' },
    { q: 'What is my Chinese zodiac animal?', a: '<p>It is shown above, based on your birth year in a twelve-year cycle. If you were born in January or early February, check your year’s Lunar New Year date, as the Chinese year may not have started yet.</p>' },
  ],

  related: ['birthday-countdown', 'age-calculator', 'love-calculator', 'random-fact-generator'],
};
