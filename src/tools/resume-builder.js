export default {
  slug: 'resume-builder',
  category: 'text',
  title: 'Resume Builder – Simple CV, Print or PDF, No Signup',
  h1: 'Resume Builder',
  cardText: 'Build a clean one-page CV and print or save it as PDF.',
  description:
    'Free resume and CV builder. Fill in your details, get a clean one-page layout that passes applicant tracking systems, and print or save as PDF. No signup.',
  keywords: ['resume builder', 'cv builder free', 'resume maker', 'cv template', 'free resume no signup'],
  updated: '2026-09-04',
  lede: 'A plain, single-column layout — which is deliberate, because the decorative two-column templates are the ones applicant tracking systems mangle.',

  form: `
<div class="row">
  <div class="field">
    <label for="name">Name</label>
    <input type="text" id="name" value="Alex Morgan" maxlength="60" autocomplete="off">
  </div>
  <div class="field">
    <label for="role">Role you are applying for</label>
    <input type="text" id="role" value="Operations Manager" maxlength="70" autocomplete="off">
  </div>
</div>
<div class="row">
  <div class="field">
    <label for="contact">Contact line</label>
    <input type="text" id="contact" value="alex@example.com · +44 7700 900123 · Bristol · linkedin.com/in/alexmorgan" maxlength="140" autocomplete="off">
  </div>
</div>

<div class="field">
  <label for="summary">Summary <span class="hint">(2–3 lines, optional)</span></label>
  <textarea id="summary" rows="3" maxlength="400" style="min-height:76px">Operations manager with eight years in logistics and retail supply chain. Cut fulfilment costs 22% at a 400-person site while improving on-time delivery from 91% to 98%.</textarea>
</div>

<div class="field">
  <label for="experience">Experience</label>
  <textarea id="experience" rows="10" style="min-height:220px">Operations Manager | Northgate Logistics | 2021–present
Led a team of 34 across two shifts at a 400-person distribution site.
Cut fulfilment cost per order by 22% by redesigning pick routes.
Raised on-time delivery from 91% to 98% over eighteen months.

Assistant Operations Manager | Bellway Retail | 2018–2021
Managed inbound goods for twelve stores, £14m annual throughput.
Introduced a cycle-count process that cut stock discrepancies by two thirds.</textarea>
  <span class="hint">One role per block. First line is <strong>Title | Company | Dates</strong>, then one achievement per line. Separate roles with a blank line.</span>
</div>

<div class="row">
  <div class="field">
    <label for="education">Education</label>
    <textarea id="education" rows="4" style="min-height:88px">BSc Logistics and Supply Chain Management | University of Bristol | 2018
A Levels: Maths, Economics, Geography | Redland Green School | 2014</textarea>
  </div>
  <div class="field">
    <label for="skills">Skills</label>
    <textarea id="skills" rows="4" style="min-height:88px">SAP, Power BI, Excel (advanced), Lean Six Sigma Green Belt, WMS implementation, team leadership, budget ownership</textarea>
  </div>
</div>

<div class="btn-row">
  <button type="button" class="btn" id="print">Print or save as PDF</button>
  <button type="button" class="btn btn-ghost" id="copy">Copy as plain text</button>
</div>
<p class="hint" id="meta" style="margin-top:12px"></p>

<div class="cv-page" id="cv" aria-label="Resume preview"></div>`,

  css: `
.cv-page{margin-top:22px;background:#fff;color:#16181c;border:1px solid var(--line);border-radius:var(--radius);
  padding:44px 48px;max-width:820px;font-size:14px;line-height:1.5;
  font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.cv-page .cv-name{font-size:26px;font-weight:700;margin:0;letter-spacing:-.02em;color:#16181c;line-height:1.15}
.cv-page .role{font-size:15px;color:#4a4f57;margin-top:2px;font-weight:560}
.cv-page .contact{font-size:12.5px;color:#4a4f57;margin-top:8px;padding-bottom:12px;border-bottom:1px solid #d8d4cc}
.cv-page h2{font-size:12px;text-transform:uppercase;letter-spacing:.09em;color:#16181c;
  margin:20px 0 8px;font-weight:700;border-bottom:1px solid #d8d4cc;padding-bottom:4px}
.cv-page .job{margin-bottom:14px}
.cv-page .job .jt{font-weight:660;font-size:14px}
.cv-page .job .jm{font-size:12.5px;color:#4a4f57;margin-bottom:4px}
.cv-page ul{margin:0;padding-left:17px}
.cv-page li{margin-bottom:2px}
.cv-page .summary{margin-bottom:2px}
.cv-page .skills{font-size:13.5px}
@media print{
  body>*{display:none !important}
  .cv-page{display:block !important;position:absolute;left:0;top:0;width:100%;max-width:none;
    border:none;border-radius:0;padding:0;margin:0;font-size:11pt}
  .cv-page .cv-name{font-size:20pt}
  @page{margin:16mm}
}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };

  function esc(s){ return String(s).replace(/[<>&]/g, function(c){
    return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]; }); }

  function parseJobs(text){
    return text.split(/\\n\\s*\\n/).map(function(block){
      var lines = block.split('\\n').map(function(l){ return l.trim(); }).filter(Boolean);
      if (!lines.length) return null;
      var head = lines[0].split('|').map(function(p){ return p.trim(); });
      return { title: head[0] || '', meta: head.slice(1).join(' · '), points: lines.slice(1) };
    }).filter(Boolean);
  }

  function render(){
    var jobs = parseJobs($('experience').value);
    var edu = parseJobs($('education').value);
    var skills = $('skills').value.trim();
    var summary = $('summary').value.trim();

    var html = '<div class="cv-name">' + esc($('name').value) + '</div>';
    if ($('role').value) html += '<div class="role">' + esc($('role').value) + '</div>';
    if ($('contact').value) html += '<div class="contact">' + esc($('contact').value) + '</div>';

    if (summary) html += '<h2>Summary</h2><p class="summary">' + esc(summary) + '</p>';

    if (jobs.length) {
      html += '<h2>Experience</h2>' + jobs.map(function(j){
        return '<div class="job"><div class="jt">' + esc(j.title) + '</div>' +
          (j.meta ? '<div class="jm">' + esc(j.meta) + '</div>' : '') +
          (j.points.length ? '<ul>' + j.points.map(function(p){ return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' : '') +
          '</div>';
      }).join('');
    }

    if (edu.length) {
      html += '<h2>Education</h2>' + edu.map(function(e){
        return '<div class="job"><div class="jt">' + esc(e.title) + '</div>' +
          (e.meta ? '<div class="jm">' + esc(e.meta) + '</div>' : '') +
          (e.points.length ? '<ul>' + e.points.map(function(p){ return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' : '') +
          '</div>';
      }).join('');
    }

    if (skills) html += '<h2>Skills</h2><p class="skills">' + esc(skills) + '</p>';

    $('cv').innerHTML = html;

    var words = $('cv').textContent.trim().split(/\\s+/).length;
    var bullets = jobs.reduce(function(a, j){ return a + j.points.length; }, 0);
    $('meta').textContent = words + ' words · ' + jobs.length + ' roles · ' + bullets + ' bullet points' +
      (words > 600 ? ' — likely over one page, consider trimming' : '');
  }

  function plainText(){
    var out = [$('name').value, $('role').value, $('contact').value, ''];
    if ($('summary').value.trim()) out.push('SUMMARY', $('summary').value.trim(), '');
    out.push('EXPERIENCE');
    parseJobs($('experience').value).forEach(function(j){
      out.push(j.title + (j.meta ? ' | ' + j.meta : ''));
      j.points.forEach(function(p){ out.push('- ' + p); });
      out.push('');
    });
    out.push('EDUCATION');
    parseJobs($('education').value).forEach(function(e){
      out.push(e.title + (e.meta ? ' | ' + e.meta : ''));
    });
    out.push('', 'SKILLS', $('skills').value.trim());
    return out.join('\\n');
  }

  ['name','role','contact','summary','experience','education','skills'].forEach(function(id){
    $(id).addEventListener('input', render);
  });
  $('print').addEventListener('click', function(){ window.print(); });
  $('copy').addEventListener('click', function(){
    navigator.clipboard.writeText(plainText()).then(function(){
      var b = $('copy'); b.textContent = 'Copied'; setTimeout(function(){ b.textContent = 'Copy as plain text'; }, 1400);
    });
  });

  render();
})();`,

  answerHeading: 'Why this layout is deliberately plain',
  answer: `<p><strong>Most applications are read by software before a person sees them, and decorative CVs are what that software handles worst.</strong> Applicant tracking systems parse text from the file; two-column layouts, text inside graphics, headers and footers, tables and icons all get scrambled or dropped, which can silently remove your work history. A single-column layout with standard section headings — Experience, Education, Skills — parses reliably everywhere. The result is plainer than a designed template, and considerably more likely to be read.</p>`,

  steps: [
    'Fill in your name, target role and contact line.',
    'For each job, write <strong>Title | Company | Dates</strong> on the first line, then one achievement per line.',
    'Separate roles with a blank line.',
    'Press <strong>Print or save as PDF</strong> and choose "Save as PDF" in the print dialogue.',
  ],

  sections: [
    {
      id: 'bullets',
      h2: 'Writing bullet points that land',
      html: `<p>The difference between a CV that gets a call and one that does not is usually the bullet points, and the fix is consistent: replace duties with outcomes.</p>
<div class="table-scroll"><table>
<thead><tr><th>Weak</th><th>Better</th></tr></thead>
<tbody>
<tr><td>Responsible for managing the warehouse team</td><td>Led 34 staff across two shifts at a 400-person site</td></tr>
<tr><td>Helped improve delivery performance</td><td>Raised on-time delivery from 91% to 98% in 18 months</td></tr>
<tr><td>Worked on cost reduction initiatives</td><td>Cut fulfilment cost per order by 22% by redesigning pick routes</td></tr>
<tr><td>Involved in stock management</td><td>Introduced cycle counting, cutting discrepancies by two thirds</td></tr>
</tbody></table></div>
<p>The pattern is: strong verb, what you did, what changed, by how much. Numbers do most of the work — even approximate ones. "Roughly 40 people" beats "a large team".</p>`,
    },
    {
      id: 'ats',
      h2: 'Getting through the software',
      html: `<ul>
<li><strong>Use standard headings.</strong> "Experience", not "Where I've Made My Mark".</li>
<li><strong>One column.</strong> Two-column layouts are the single most common parsing failure.</li>
<li><strong>No text in images.</strong> Anything in a graphic is invisible to the parser.</li>
<li><strong>Nothing in headers or footers</strong> — including your phone number, which is a common and costly mistake.</li>
<li><strong>Mirror the job advert's wording.</strong> If it says "stakeholder management" and you wrote "working with partners", use their phrase where it is honest to do so.</li>
<li><strong>Send PDF unless told otherwise</strong>, and name the file properly: <code>Alex-Morgan-CV.pdf</code>.</li>
<li><strong>Spell out and abbreviate.</strong> "Search engine optimisation (SEO)" matches both searches.</li>
</ul>`,
    },
    {
      id: 'length',
      h2: 'How long should it be?',
      html: `<p>One page for under about ten years of experience; two is acceptable beyond that and in academia. Nobody has ever been rejected for being concise.</p>
<p>What to cut first, in order: jobs over fifteen years old, school qualifications once you have a degree and experience, "references available on request", your full address (town and country is enough), date of birth and photograph in the UK and US, and any skill that is simply expected — listing Microsoft Word signals the wrong thing.</p>
<p>The word count above gives a rough guide: past about 600 words you are likely onto a second page.</p>`,
    },
  ],

  faq: [
    { q: 'How do I save it as a PDF?', a: '<p>Press "Print or save as PDF" and choose <em>Save as PDF</em> as the destination in your browser’s print dialogue. That produces a proper text-based PDF that applicant tracking systems can read.</p>' },
    { q: 'Is my CV data uploaded?', a: '<p>No. Everything stays in your browser. Nothing is transmitted and nothing is stored on a server.</p>' },
    { q: 'Should a CV be one page or two?', a: '<p>One page under roughly ten years of experience. Two is fine beyond that, and normal in academia and for senior roles.</p>' },
    { q: 'Why is this template so plain?', a: '<p>Deliberately. Decorative and two-column CVs are parsed badly by the software that reads most applications first. Plain and correctly parsed beats attractive and mangled.</p>' },
    { q: 'Should I include a photo?', a: '<p>Not in the UK, US, Canada, Ireland or Australia, where it invites discrimination concerns and many employers discard such CVs. In parts of continental Europe and Asia it is still expected — check local convention.</p>' },
    { q: 'Do I need a summary?', a: '<p>It helps when it is specific and quantified. A generic one — "hard-working team player seeking new challenges" — is worse than nothing, since it uses prime space to say nothing.</p>' },
  ],

  related: ['business-card-maker', 'word-counter', 'signature-maker', 'text-case-converter'],
};
