export default {
  slug: 'gpa-calculator',
  category: 'calculators',
  title: 'GPA Calculator – Weighted and Unweighted Grade Point Average',
  h1: 'GPA Calculator',
  cardText: 'Work out your GPA from letter grades and credit hours.',
  description:
    'Free GPA calculator. Enter your courses, letter grades and credit hours to get your grade point average on the 4.0 scale, weighted or unweighted.',
  keywords: ['gpa calculator', 'grade point average', 'calculate gpa', 'weighted gpa', 'college gpa'],
  updated: '2026-09-04',
  lede: 'Add your courses with their grades and credit hours. The GPA updates as you type, and you can add a previous GPA to get a cumulative figure.',

  form: `
<div class="field">
  <span class="field-label">Your courses</span>
  <div class="gpa-head">
    <span>Course</span><span>Grade</span><span>Credits</span><span></span>
  </div>
  <div id="rows" class="gpa-rows"></div>
  <button type="button" class="btn btn-ghost" id="addrow" style="margin-top:9px">+ Add a course</button>
</div>

<details style="margin-top:16px">
  <summary style="cursor:pointer;font-weight:560;font-size:.92rem;color:var(--ink-2)">Add a previous GPA for a cumulative result</summary>
  <div class="row" style="margin-top:12px">
    <div class="field">
      <label for="prevgpa">Previous GPA</label>
      <input type="number" id="prevgpa" inputmode="decimal" min="0" max="4.5" step="0.01" placeholder="3.42">
    </div>
    <div class="field">
      <label for="prevcred">Credits already earned</label>
      <input type="number" id="prevcred" inputmode="decimal" min="0" step="1" placeholder="60">
    </div>
  </div>
</details>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label" id="lbl">Semester GPA</div>
  <div class="result-value" id="gpa">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>Credits</dt><dd id="credits">—</dd></div>
    <div class="stat"><dt>Grade points</dt><dd id="points">—</dd></div>
    <div class="stat"><dt>Cumulative</dt><dd id="cum">—</dd></div>
  </dl>
</div>`,

  css: `
.gpa-head,.gpa-row{display:grid;grid-template-columns:1fr 118px 92px 38px;gap:8px;align-items:center}
.gpa-head{font-size:.76rem;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-3);
  font-weight:640;margin-bottom:7px;padding:0 2px}
.gpa-rows{display:flex;flex-direction:column;gap:8px}
.gpa-row button{width:36px;height:38px;border:1px solid var(--line-strong);background:var(--bg);
  border-radius:var(--radius-sm);color:var(--ink-3);cursor:pointer;font-size:1.1rem;line-height:1}
.gpa-row button:hover{border-color:var(--danger);color:var(--danger)}
@media (max-width:540px){
  .gpa-head{display:none}
  .gpa-row{grid-template-columns:1fr 1fr;gap:6px}
  .gpa-row input[type=text]{grid-column:1 / -1}
}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };

  // Standard US 4.0 scale with plus/minus gradations.
  var GRADES = [
    ['A',  4.0], ['A-', 3.7], ['B+', 3.3], ['B', 3.0], ['B-', 2.7],
    ['C+', 2.3], ['C',  2.0], ['C-', 1.7], ['D+', 1.3], ['D', 1.0], ['D-', 0.7], ['F', 0.0]
  ];

  function addRow(name, grade, credits){
    var div = document.createElement('div');
    div.className = 'gpa-row';
    div.innerHTML =
      '<input type="text" placeholder="Course name" value="' + (name || '') + '" aria-label="Course name">' +
      '<select aria-label="Grade">' + GRADES.map(function(g){
        return '<option value="' + g[1] + '"' + (g[0] === grade ? ' selected' : '') + '>' + g[0] + '</option>';
      }).join('') + '</select>' +
      '<input type="number" inputmode="decimal" min="0" max="12" step="0.5" value="' + (credits || 3) + '" aria-label="Credit hours">' +
      '<button type="button" aria-label="Remove this course">×</button>';
    div.querySelector('button').addEventListener('click', function(){ div.remove(); calc(); });
    div.querySelectorAll('input,select').forEach(function(el){
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', calc);
    });
    $('rows').appendChild(div);
  }

  function calc(){
    var rows = [].slice.call($('rows').children);
    var totalPoints = 0, totalCredits = 0;

    rows.forEach(function(r){
      var grade = parseFloat(r.querySelector('select').value);
      var credits = parseFloat(r.querySelectorAll('input')[1].value);
      if (!isFinite(credits) || credits <= 0) return;
      totalCredits += credits;
      totalPoints += grade * credits;
    });

    if (totalCredits === 0) { $('out').hidden = true; return; }

    var gpa = totalPoints / totalCredits;
    $('gpa').textContent = gpa.toFixed(2);
    $('credits').textContent = totalCredits % 1 === 0 ? totalCredits : totalCredits.toFixed(1);
    $('points').textContent = totalPoints.toFixed(1);

    var prevGpa = parseFloat($('prevgpa').value);
    var prevCred = parseFloat($('prevcred').value);
    if (isFinite(prevGpa) && isFinite(prevCred) && prevCred > 0) {
      var cum = (totalPoints + prevGpa * prevCred) / (totalCredits + prevCred);
      $('cum').textContent = cum.toFixed(2);
      $('note').textContent = 'Across ' + (totalCredits + prevCred) + ' total credits, your cumulative GPA is ' + cum.toFixed(2) + '.';
    } else {
      $('cum').textContent = '—';
      $('note').textContent = totalPoints.toFixed(1) + ' grade points ÷ ' + totalCredits + ' credits.';
    }
    $('out').hidden = false;
  }

  $('addrow').addEventListener('click', function(){ addRow(); calc(); });
  ['prevgpa','prevcred'].forEach(function(id){ $(id).addEventListener('input', calc); });

  addRow('', 'A', 3); addRow('', 'B+', 3); addRow('', 'B', 4); addRow('', 'A-', 3);
  calc();
})();`,

  answerHeading: 'How GPA is calculated',
  answer: `<p><strong>GPA is the credit-weighted average of your grade points, not a plain average of your grades.</strong> Multiply each course's grade point value by its credit hours, add those products together, then divide by total credit hours. This is why a B in a four-credit course pulls harder than an A in a one-credit course: an A (4.0) in 1 credit and a C (2.0) in 4 credits gives (4 + 8) ÷ 5 = 2.40, not the 3.00 a simple average would suggest.</p>`,

  steps: [
    'Enter each course, its letter grade, and how many credit hours it carries.',
    'Add or remove rows to match your schedule.',
    'To get a cumulative GPA, open the section below and enter your existing GPA and credits earned.',
  ],

  sections: [
    {
      id: 'scale',
      h2: 'The 4.0 grade point scale',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Letter</th><th>Points</th><th>Typical percentage</th></tr></thead>
<tbody>
<tr><td>A</td><td>4.0</td><td>93–100%</td></tr>
<tr><td>A−</td><td>3.7</td><td>90–92%</td></tr>
<tr><td>B+</td><td>3.3</td><td>87–89%</td></tr>
<tr><td>B</td><td>3.0</td><td>83–86%</td></tr>
<tr><td>B−</td><td>2.7</td><td>80–82%</td></tr>
<tr><td>C+</td><td>2.3</td><td>77–79%</td></tr>
<tr><td>C</td><td>2.0</td><td>73–76%</td></tr>
<tr><td>C−</td><td>1.7</td><td>70–72%</td></tr>
<tr><td>D</td><td>1.0</td><td>63–66%</td></tr>
<tr><td>F</td><td>0.0</td><td>Below 60%</td></tr>
</tbody></table></div>
<p>Percentage bands vary between institutions, and some schools award a straight 4.0 for A+ while others give 4.3. Check your registrar's published scale — this calculator uses the most common version.</p>`,
    },
    {
      id: 'weighted',
      h2: 'Weighted versus unweighted GPA',
      html: `<p>An <strong>unweighted</strong> GPA caps every course at 4.0 regardless of difficulty. A <strong>weighted</strong> GPA adds bonus points for harder courses, typically +1.0 for AP or IB and +0.5 for honours, which is how a GPA above 4.0 becomes possible.</p>
<p>To calculate a weighted GPA here, enter the boosted grade: an A in an AP class counts as 5.0, so choose the grade that reflects your school's weighting and check the resulting points.</p>
<p>Worth knowing: many universities recalculate applicants' GPAs themselves using their own scale, often stripping out non-academic courses and applying their own weighting. The number on your transcript is not always the number an admissions office uses.</p>`,
    },
  ],

  faq: [
    { q: 'What is a good GPA?', a: '<p>Context decides it. Above 3.5 is generally considered strong, 3.0 is solid, and many graduate programmes and scholarships set 3.0 as a minimum. Course difficulty and institution matter as much as the number.</p>' },
    { q: 'How do I calculate a cumulative GPA?', a: '<p>Enter this term’s courses, then open the section below and add your previous GPA and the credits it covers. The tool combines them by weighting each by its credit hours.</p>' },
    { q: 'Do pass/fail courses count?', a: '<p>Usually not toward GPA, though they do count toward credits earned. Leave them out of this calculator, or set their credit hours to zero.</p>' },
    { q: 'Can my GPA go above 4.0?', a: '<p>Only on a weighted scale, where AP, IB or honours courses receive bonus points. On an unweighted 4.0 scale, 4.0 is the maximum.</p>' },
    { q: 'How much can one bad grade hurt?', a: '<p>It depends entirely on how many credits you have already earned. Early on a single grade moves the average a lot; after 90 credits its effect is small. Enter your existing GPA and credits above to see the exact impact.</p>' },
  ],

  related: ['percentage-calculator', 'age-calculator', 'word-counter', 'countdown-timer'],
};
