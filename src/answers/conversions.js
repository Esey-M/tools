/* ---------------------------------------------------------------------------
 * Generated answer pages for specific conversion queries.
 *
 * These target searches a general converter page cannot rank for — "170 cm in
 * feet" has far more volume, and far less competition, than "unit converter".
 * Each page carries the exact answer, the arithmetic, the value in adjacent
 * units, a nearby-values table and domain context, so it stands on its own
 * rather than being one number swapped into a template.
 * ------------------------------------------------------------------------- */

const UPDATED = '2026-09-05';

/** Trim trailing zeros without losing meaningful precision. */
function num(n, dp = 2) {
  const r = Number(n.toFixed(dp));
  return r.toLocaleString('en-US', { maximumFractionDigits: dp });
}
const range = (from, to, step = 1) => {
  const out = [];
  for (let v = from; v <= to + 1e-9; v += step) out.push(Number(v.toFixed(4)));
  return out;
};

/** A window of nearby values, for the "nearby values" pills. */
function neighbours(values, value, slugOf, labelOf, span = 3) {
  const i = values.indexOf(value);
  return values
    .slice(Math.max(0, i - span), i + span + 1)
    .filter((v) => v !== value)
    .map((v) => ({ slug: slugOf(v), label: labelOf(v) }));
}

function table(rows, headers) {
  return `<div class="table-scroll"><table><thead><tr>${
    headers.map((h) => `<th>${h}</th>`).join('')
  }</tr></thead><tbody>${
    rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')
  }</tbody></table></div>`;
}

/* ------------------------------------------------------- centimetres → feet */
function cmToFeet() {
  const values = range(140, 200);
  const slugOf = (v) => `convert/${v}-cm-in-feet`;
  const labelOf = (v) => `${v} cm`;

  return values.map((cm) => {
    const totalIn = cm / 2.54;
    const ft = Math.floor(totalIn / 12);
    const inch = totalIn - ft * 12;
    const feetDecimal = totalIn / 12;

    return {
      slug: slugOf(cm),
      group: 'cm-to-feet',
      breadcrumb: [{ name: 'Conversions', href: '/convert/' }, { name: `${cm} cm in feet`, href: `/${slugOf(cm)}/` }],
      title: `${cm} cm in Feet and Inches – Exact Height Conversion`,
      description: `${cm} cm is ${ft} feet ${num(inch, 1)} inches. See the exact conversion, the arithmetic behind it, and a chart of nearby heights in feet and inches.`,
      h1: `${cm} cm in feet and inches`,
      lede: `A quick, exact answer plus the working, so you can check it or do the next one yourself.`,
      answerLabel: `${cm} centimetres is`,
      answerValue: `${ft} ft ${num(inch, 1)} in`,
      answerNote: `That is <strong>${num(feetDecimal, 3)} feet</strong> in decimal, or <strong>${num(totalIn, 2)} inches</strong> in total. Rounded to the nearest whole inch it is ${ft} ft ${Math.round(inch)} in.`,
      answerFact: { q: `How many feet is ${cm} cm?`, a: `${cm} cm is ${ft} feet ${num(inch, 1)} inches, or ${num(feetDecimal, 3)} feet in decimal.` },
      toolSlug: 'unit-converter',
      updated: UPDATED,
      footnote: 'The inch is defined as exactly 2.54 cm, so this conversion is exact rather than approximate.',
      sections: [
        {
          h2: 'How the conversion works',
          html: `<p>An inch is defined as exactly 2.54 centimetres, so the conversion is exact rather than an approximation.</p>
<p>Divide by 2.54 to get inches: <code>${cm} ÷ 2.54 = ${num(totalIn, 4)} inches</code>.</p>
<p>Then split that into feet and inches: <code>${num(totalIn, 4)} ÷ 12 = ${ft}</code> whole feet, with <code>${num(inch, 2)}</code> inches left over.</p>
<p>So <strong>${cm} cm = ${ft} ft ${num(inch, 1)} in</strong>.</p>`,
        },
        {
          h2: 'Heights either side of this',
          html: table(
            range(Math.max(140, cm - 5), Math.min(200, cm + 5)).map((v) => {
              const t = v / 2.54, f = Math.floor(t / 12), i = t - f * 12;
              const mark = v === cm ? ' style="background:var(--accent-soft);font-weight:600"' : '';
              return [`<span${mark ? ' ' : ''}>${v} cm</span>`, `${f} ft ${num(i, 1)} in`, `${num(t, 1)} in`, `${num(v / 100, 2)} m`];
            }),
            ['Centimetres', 'Feet and inches', 'Inches', 'Metres']
          ),
        },
      ],
      faq: [
        { q: `How many feet and inches is ${cm} cm?`, a: `<p>${cm} cm is <strong>${ft} feet ${num(inch, 1)} inches</strong>. Rounded to the nearest inch, that is ${ft} ft ${Math.round(inch)} in.</p>` },
        { q: `Is ${cm} cm tall?`, a: `<p>It depends entirely on where and who. Average adult male height ranges from roughly 165 cm in parts of Asia to about 183 cm in the Netherlands, and average adult female height from roughly 152 cm to 170 cm. A single number is only meaningful against a specific population.</p>` },
        { q: 'Why divide by 2.54?', a: '<p>Because since the international yard and pound agreement of 1959, one inch has been defined as exactly 2.54 centimetres. It is a definition, not a measurement, so no precision is lost.</p>' },
        { q: 'How do I convert feet and inches back to cm?', a: `<p>Multiply feet by 12, add the inches, then multiply by 2.54. For ${ft} ft ${Math.round(inch)} in: (${ft} × 12 + ${Math.round(inch)}) × 2.54 = ${num((ft * 12 + Math.round(inch)) * 2.54, 1)} cm.</p>` },
      ],
      related: neighbours(values, cm, slugOf, labelOf),
      siblingsTitle: 'Common heights',
      siblings: [150, 155, 160, 165, 170, 175, 180, 185, 190].filter((v) => v !== cm)
        .map((v) => ({ slug: slugOf(v), label: `${v} cm in feet` })),
    };
  });
}

/* ---------------------------------------------------- kilograms → pounds */
function kgToLb() {
  const values = range(40, 130);
  const slugOf = (v) => `convert/${v}-kg-in-pounds`;
  const labelOf = (v) => `${v} kg`;

  return values.map((kg) => {
    const lb = kg / 0.45359237;
    const stone = Math.floor(lb / 14);
    const stLb = lb - stone * 14;

    return {
      slug: slugOf(kg),
      group: 'kg-to-lb',
      breadcrumb: [{ name: 'Conversions', href: '/convert/' }, { name: `${kg} kg in pounds`, href: `/${slugOf(kg)}/` }],
      title: `${kg} kg in Pounds – Exact Weight Conversion`,
      description: `${kg} kg is ${num(lb, 1)} pounds, or ${stone} stone ${num(stLb, 1)} lb. See the exact conversion, the working, and a chart of nearby weights.`,
      h1: `${kg} kg in pounds`,
      lede: 'The exact figure, the arithmetic behind it, and the same weight in stone for anyone in the UK.',
      answerLabel: `${kg} kilograms is`,
      answerValue: `${num(lb, 2)} lb`,
      answerNote: `In stones and pounds that is <strong>${stone} st ${num(stLb, 1)} lb</strong>. Rounded, ${kg} kg is about ${Math.round(lb)} pounds.`,
      answerFact: { q: `How many pounds is ${kg} kg?`, a: `${kg} kg is ${num(lb, 2)} pounds, or ${stone} stone ${num(stLb, 1)} pounds.` },
      toolSlug: 'unit-converter',
      updated: UPDATED,
      footnote: 'The pound is defined as exactly 0.45359237 kg, so this conversion is exact.',
      sections: [
        {
          h2: 'How the conversion works',
          html: `<p>One pound is defined as exactly 0.45359237 kilograms, so dividing by that figure converts kilograms to pounds precisely.</p>
<p><code>${kg} ÷ 0.45359237 = ${num(lb, 4)} pounds</code></p>
<p>For mental arithmetic, doubling the kilograms and adding 10% gets you close: ${kg} × 2 = ${kg * 2}, plus 10% is ${num(kg * 2.2, 1)} — against an exact ${num(lb, 1)}.</p>
<p>Britain and Ireland usually express body weight in stones, where one stone is 14 pounds. ${num(lb, 1)} ÷ 14 gives <strong>${stone} stone ${num(stLb, 1)} pounds</strong>.</p>`,
        },
        {
          h2: 'Weights either side of this',
          html: table(
            range(Math.max(40, kg - 5), Math.min(130, kg + 5)).map((v) => {
              const p = v / 0.45359237, st = Math.floor(p / 14);
              return [`${v} kg`, `${num(p, 1)} lb`, `${st} st ${num(p - st * 14, 1)} lb`, `${num(v * 1000, 0)} g`];
            }),
            ['Kilograms', 'Pounds', 'Stone and pounds', 'Grams']
          ),
        },
      ],
      faq: [
        { q: `How many pounds is ${kg} kg?`, a: `<p>${kg} kg is <strong>${num(lb, 2)} pounds</strong>, which rounds to ${Math.round(lb)} lb.</p>` },
        { q: `What is ${kg} kg in stone?`, a: `<p>${stone} stone ${num(stLb, 1)} pounds. A stone is 14 pounds, and the unit is still commonly used for body weight in the UK and Ireland.</p>` },
        { q: 'Is the conversion exact?', a: '<p>Yes. Since 1959 the international pound has been defined as exactly 0.45359237 kilograms, so the factor is a definition rather than a measurement.</p>' },
        { q: 'What is the quick way to do this in my head?', a: `<p>Double the kilograms, then add 10%. For ${kg} kg: ${kg * 2} + ${num(kg * 0.2, 1)} = ${num(kg * 2.2, 1)} lb, which is within half a pound of the exact answer.</p>` },
      ],
      related: neighbours(values, kg, slugOf, labelOf),
      siblingsTitle: 'Common weights',
      siblings: [50, 55, 60, 65, 70, 75, 80, 85, 90, 100].filter((v) => v !== kg)
        .map((v) => ({ slug: slugOf(v), label: `${v} kg in pounds` })),
    };
  });
}

/* ------------------------------------------------------ Celsius → Fahrenheit */
function celsiusToFahrenheit() {
  const weather = range(-10, 45);
  const oven = [100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250];
  const values = [...new Set([...weather, ...oven])].sort((a, b) => a - b);
  const slugOf = (v) => `convert/${String(v).replace('-', 'minus-')}-c-to-f`;
  const labelOf = (v) => `${v} °C`;

  const GAS = { 135: '1', 150: '2', 160: '3', 180: '4', 190: '5', 200: '6', 220: '7', 230: '8', 240: '9' };

  return values.map((c) => {
    const f = c * 9 / 5 + 32;
    const isOven = c >= 100;
    const gas = GAS[c];

    return {
      slug: slugOf(c),
      group: 'c-to-f',
      breadcrumb: [{ name: 'Conversions', href: '/convert/' }, { name: `${c}°C to °F`, href: `/${slugOf(c)}/` }],
      title: `${c}°C to Fahrenheit – ${num(f, 1)}°F`,
      description: `${c} degrees Celsius is ${num(f, 1)} degrees Fahrenheit. See the formula, the working${isOven ? ', the gas mark and fan oven setting' : ''}, and a conversion chart.`,
      h1: `${c}°C in Fahrenheit`,
      lede: isOven
        ? 'The exact conversion plus the fan oven and gas mark equivalents, since almost every recipe assumes a conventional oven.'
        : 'The exact conversion, the formula, and a mental shortcut that is close enough for weather.',
      answerLabel: `${c} degrees Celsius is`,
      answerValue: `${num(f, 1)} °F`,
      answerNote: isOven
        ? `In a fan or convection oven use <strong>${c - 20} °C</strong>${gas ? `, which is <strong>gas mark ${gas}</strong>` : ''}.`
        : `Rounded, that is about ${Math.round(f)} °F. In Kelvin it is ${num(c + 273.15, 2)} K.`,
      answerFact: { q: `What is ${c} degrees Celsius in Fahrenheit?`, a: `${c}°C is ${num(f, 1)}°F.` },
      toolSlug: isOven ? 'oven-temperature-converter' : 'temperature-converter',
      updated: UPDATED,
      sections: [
        {
          h2: 'The formula',
          html: `<p>Multiply by 9/5 and add 32.</p>
<p><code>(${c} × 9 ÷ 5) + 32 = ${num(c * 9 / 5, 1)} + 32 = ${num(f, 1)} °F</code></p>
${isOven ? '' : `<p>For weather, a shortcut that needs no calculator is to <strong>double the Celsius and add 30</strong>: ${c} × 2 + 30 = ${c * 2 + 30}, against an exact ${num(f, 1)}. It drifts by about 2 °F per 10 °C, which is fine for deciding what to wear and useless for cooking.</p>`}`,
        },
        isOven
          ? {
              h2: 'Oven settings at this temperature',
              html: table([
                ['Conventional oven', `${c} °C`],
                ['Fan / convection oven', `${c - 20} °C`],
                ['Fahrenheit', `${num(f, 0)} °F`],
                ['Gas mark', gas || 'Between marks'],
              ], ['Setting', 'Value']) +
              '<p>Fan ovens circulate air, which transfers heat faster, so recipes written for a conventional oven need about 20 °C less. Doing both that <em>and</em> shortening the time will undercook the dish.</p>',
            }
          : {
              h2: 'What this temperature feels like',
              html: `<p>${
                c <= -5 ? 'Severely cold — well below freezing, with a real risk of ice underfoot and frozen pipes.'
                : c < 0 ? 'Below freezing. Water turns to ice at 0 °C, which is 32 °F.'
                : c < 10 ? 'Cold. A proper coat, and most people will want gloves at the lower end.'
                : c < 18 ? 'Cool. Jacket weather rather than coat weather.'
                : c < 24 ? 'Comfortable room temperature. Most thermostats sit in this band.'
                : c < 30 ? 'Warm. Comfortable in light clothing, warm in direct sun.'
                : c < 38 ? 'Hot. Above body temperature at the top of this range, so shade and water matter.'
                : 'Dangerously hot. Sustained exposure at this level is a genuine health risk.'
              }</p>`,
            },
        {
          h2: 'Nearby temperatures',
          html: table(
            values.filter((v) => Math.abs(v - c) <= (isOven ? 30 : 5) && v !== c).slice(0, 10)
              .map((v) => [`${v} °C`, `${num(v * 9 / 5 + 32, 1)} °F`, `${num(v + 273.15, 2)} K`]),
            ['Celsius', 'Fahrenheit', 'Kelvin']
          ),
        },
      ],
      faq: [
        { q: `What is ${c}°C in Fahrenheit?`, a: `<p><strong>${num(f, 1)}°F</strong>. Multiply the Celsius figure by 9/5 and add 32.</p>` },
        ...(isOven && gas ? [{ q: `What gas mark is ${c}°C?`, a: `<p>Gas mark ${gas}. In a fan oven, use ${c - 20} °C.</p>` }] : []),
        { q: 'What is the formula?', a: '<p>°F = (°C × 9/5) + 32. To go the other way, °C = (°F − 32) × 5/9.</p>' },
        { q: 'At what temperature are the two scales equal?', a: '<p>−40. That is the single point where Celsius and Fahrenheit give the same number, which makes it a handy check on any conversion you do by hand.</p>' },
      ],
      related: neighbours(values, c, slugOf, labelOf, 2),
      siblingsTitle: isOven ? 'Common oven temperatures' : 'Common temperatures',
      siblings: (isOven ? [150, 160, 180, 190, 200, 220, 230] : [0, 10, 15, 20, 25, 30, 35, 37])
        .filter((v) => v !== c).map((v) => ({ slug: slugOf(v), label: `${v}°C to °F` })),
    };
  });
}

export function generate() {
  return [...cmToFeet(), ...kgToLb(), ...celsiusToFahrenheit()];
}
