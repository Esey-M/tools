/* ---------------------------------------------------------------------------
 * "How many days until X" pages.
 *
 * The static content is the date, weekday and week/month breakdown — facts that
 * stay true between builds. The day count itself is rendered live in the
 * browser, and a scheduled rebuild keeps the static copy fresh too.
 * ------------------------------------------------------------------------- */

const UPDATED = '2026-09-05';
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const fmt = (d) => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

/** Anonymous Gregorian computus — Easter Sunday for a given year. */
function easter(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/** The nth given weekday of a month, or the last one when n is -1. */
function nthWeekday(year, month, weekday, n) {
  if (n === -1) {
    const last = new Date(year, month + 1, 0);
    const back = (last.getDay() - weekday + 7) % 7;
    return new Date(year, month, last.getDate() - back);
  }
  const first = new Date(year, month, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  return new Date(year, month, 1 + offset + (n - 1) * 7);
}

const EVENTS = [
  { slug: 'christmas', name: 'Christmas', full: 'Christmas Day', date: (y) => new Date(y, 11, 25),
    about: 'Christmas Day falls on 25 December every year, so the date never moves — only the weekday does.' },
  { slug: 'new-year', name: 'New Year', full: "New Year's Day", date: (y) => new Date(y, 0, 1),
    about: 'New Year\'s Day is 1 January. The countdown below runs to midnight at the start of the day.' },
  { slug: 'halloween', name: 'Halloween', full: 'Halloween', date: (y) => new Date(y, 9, 31),
    about: 'Halloween is always 31 October, the evening before All Saints\' Day.' },
  { slug: 'valentines-day', name: "Valentine's Day", full: "Valentine's Day", date: (y) => new Date(y, 1, 14),
    about: "Valentine's Day is fixed at 14 February." },
  { slug: 'easter', name: 'Easter', full: 'Easter Sunday', date: easter,
    about: 'Easter moves. It falls on the first Sunday after the first full moon on or after the spring equinox, so it lands between 22 March and 25 April.' },
  { slug: 'thanksgiving', name: 'Thanksgiving', full: 'Thanksgiving (US)', date: (y) => nthWeekday(y, 10, 4, 4),
    about: 'US Thanksgiving is the fourth Thursday in November, so the date changes each year. Canadian Thanksgiving is the second Monday in October.' },
  { slug: 'black-friday', name: 'Black Friday', full: 'Black Friday', date: (y) => { const t = nthWeekday(y, 10, 4, 4); return new Date(y, 10, t.getDate() + 1); },
    about: 'Black Friday is the day after US Thanksgiving, so it is always the Friday between 23 and 29 November.' },
  { slug: 'new-years-eve', name: "New Year's Eve", full: "New Year's Eve", date: (y) => new Date(y, 11, 31),
    about: "New Year's Eve is 31 December, the last day of the year." },
  { slug: 'summer', name: 'summer', full: 'the summer solstice', date: (y) => new Date(y, 5, 21),
    about: 'The June solstice — the longest day in the northern hemisphere — falls on 20 or 21 June. This countdown uses 21 June.' },
  { slug: 'boxing-day', name: 'Boxing Day', full: 'Boxing Day', date: (y) => new Date(y, 11, 26),
    about: 'Boxing Day is 26 December, a public holiday in the UK, Ireland, Canada, Australia and New Zealand.' },
  { slug: 'st-patricks-day', name: "St Patrick's Day", full: "St Patrick's Day", date: (y) => new Date(y, 2, 17),
    about: "St Patrick's Day is 17 March." },
  { slug: 'independence-day', name: 'the 4th of July', full: 'Independence Day', date: (y) => new Date(y, 6, 4),
    about: 'US Independence Day is 4 July. When it falls at a weekend the federal holiday moves, but the date itself does not.' },
  { slug: 'mothers-day-us', name: "Mother's Day (US)", full: "Mother's Day in the US", date: (y) => nthWeekday(y, 4, 0, 2),
    about: "In the US, Mother's Day is the second Sunday in May. In the UK it is Mothering Sunday, three weeks before Easter, which is a different date entirely." },
  { slug: 'fathers-day', name: "Father's Day", full: "Father's Day", date: (y) => nthWeekday(y, 5, 0, 3),
    about: "In the US, UK and Canada, Father's Day is the third Sunday in June." },
];

export function generate() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return EVENTS.map((ev) => {
    // The next occurrence, rolling into next year once this year's has passed.
    let date = ev.date(today.getFullYear());
    if (date < today) date = ev.date(today.getFullYear() + 1);

    const days = Math.round((date - today) / 86400000);
    const weeks = Math.floor(days / 7);
    const year = date.getFullYear();

    const upcoming = [0, 1, 2, 3].map((n) => {
      const d = ev.date(year + n);
      return [d.getFullYear(), d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })];
    });

    return {
      slug: `days-until/${ev.slug}`,
      group: 'days-until',
      breadcrumb: [{ name: 'Countdowns', href: '/days-until/' }, { name: `Days until ${ev.name}`, href: `/days-until/${ev.slug}/` }],
      title: `How Many Days Until ${ev.name.charAt(0).toUpperCase() + ev.name.slice(1)}? – ${year} Countdown`,
      description: `${ev.full} ${year} is on ${fmt(date)}. Live countdown showing the days, hours and minutes remaining, plus the dates for the next few years.`,
      h1: `How many days until ${ev.name}?`,
      lede: `${ev.full} falls on <strong>${fmt(date)}</strong>. The countdown below updates every second.`,
      answerLabel: `Until ${ev.full}`,
      answerValue: `<span id="cd-days">${days.toLocaleString('en-US')}</span> days`,
      answerNote: `<span id="cd-detail">That is about ${weeks} week${weeks === 1 ? '' : 's'}, counting from today.</span>`,
      answerFact: { q: `How many days until ${ev.name}?`, a: `${ev.full} ${year} is on ${fmt(date)}.` },
      toolSlug: 'countdown-timer',
      updated: UPDATED,
      footnote: 'The counter runs in your own time zone and updates live.',
      // A live counter, so the page is right even between rebuilds.
      inlineJs: `(function(){
  var target = new Date(${year}, ${date.getMonth()}, ${date.getDate()}, 0, 0, 0);
  var days = document.getElementById('cd-days');
  var detail = document.getElementById('cd-detail');
  if (!days) return;
  function tick(){
    var now = new Date();
    var diff = target - now;
    if (diff <= 0) { days.textContent = '0'; detail.textContent = 'It is today.'; return; }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor(diff % 86400000 / 3600000);
    var m = Math.floor(diff % 3600000 / 60000);
    var s = Math.floor(diff % 60000 / 1000);
    days.textContent = d.toLocaleString('en-US');
    detail.textContent = d + ' days, ' + h + ' hours, ' + m + ' minutes and ' + s + ' seconds remaining.';
  }
  tick();
  setInterval(tick, 1000);
})();`,
      sections: [
        { h2: `When is ${ev.full}?`, html: `<p><strong>${fmt(date)}</strong>.</p><p>${ev.about}</p>` },
        {
          h2: 'The next few years',
          html: `<div class="table-scroll"><table><thead><tr><th>Year</th><th>Date</th></tr></thead><tbody>${
            upcoming.map(([y, d]) => `<tr><td>${y}</td><td>${d}</td></tr>`).join('')
          }</tbody></table></div>`,
        },
      ],
      faq: [
        { q: `When is ${ev.full} ${year}?`, a: `<p>${fmt(date)}.</p>` },
        { q: `How many weeks until ${ev.name}?`, a: `<p>About ${weeks} week${weeks === 1 ? '' : 's'} from today. The live counter above gives the exact days, hours and minutes.</p>` },
        { q: 'Does this update automatically?', a: '<p>Yes. The countdown runs in your browser and ticks every second, in your own time zone.</p>' },
        { q: 'Can I count down to a different date?', a: '<p>Yes — the <a href="/countdown-timer/">countdown timer</a> works for any date and gives you a shareable link.</p>' },
      ],
      siblingsTitle: 'Other countdowns',
      siblings: EVENTS.filter((e) => e.slug !== ev.slug).slice(0, 10)
        .map((e) => ({ slug: `days-until/${e.slug}`, label: `Days until ${e.name}` })),
    };
  });
}
