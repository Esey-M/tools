export default {
  slug: 'password-strength-checker',
  category: 'generators',
  title: 'Password Strength Checker – How Long to Crack Yours',
  h1: 'Password Strength Checker',
  cardText: 'Test a password’s real strength and see how long it would take to crack.',
  description:
    'Free password strength checker. See how strong a password really is, how long it would take to crack, and which specific weaknesses make it guessable.',
  keywords: ['password strength checker', 'how strong is my password', 'password test', 'crack time', 'is my password secure'],
  updated: '2026-09-04',
  lede: 'Type a password to see its real strength. Nothing is transmitted — the analysis runs entirely in your browser, and you can disconnect from the internet to prove it.',

  form: `
<div class="field">
  <label for="pw">Password to test</label>
  <div class="input-group">
    <input type="password" id="pw" autocomplete="new-password" spellcheck="false" placeholder="Type or paste a password">
    <button type="button" class="addon" id="toggle" style="cursor:pointer;border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none" aria-label="Show or hide the password">Show</button>
  </div>
  <span class="hint">Never type a real password into a site you do not trust. This one runs offline — but that is exactly what a malicious site would also claim.</span>
</div>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label">Strength</div>
  <div class="result-value" id="verdict" style="font-size:2.2rem">—</div>
  <div class="pw-meter"><span id="bar"></span></div>
  <div class="result-note" id="crack"></div>
  <dl class="result-grid">
    <div class="stat"><dt>Length</dt><dd id="len">—</dd></div>
    <div class="stat"><dt>Character types</dt><dd id="types">—</dd></div>
    <div class="stat"><dt>Entropy</dt><dd id="entropy">—</dd></div>
  </dl>
  <div id="issues" class="issue-list"></div>
</div>`,

  css: `
.pw-meter{height:9px;background:var(--bg-raised);border-radius:999px;overflow:hidden;margin:10px 0 12px;border:1px solid var(--line)}
.pw-meter span{display:block;height:100%;width:0;border-radius:999px;transition:width .3s,background .3s}
.issue-list{margin-top:14px;display:flex;flex-direction:column;gap:7px}
.issue{display:flex;gap:10px;align-items:flex-start;font-size:.9rem;padding:9px 12px;border-radius:var(--radius-sm);
  background:var(--bg-raised);border:1px solid var(--line)}
.issue.warn{border-color:color-mix(in srgb,var(--danger) 40%,transparent)}
.issue.good{border-color:color-mix(in srgb,var(--accent) 40%,transparent)}
.issue b{flex:none}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };

  // The passwords that appear at the top of every breach corpus.
  var COMMON = ('123456 password 123456789 12345678 12345 qwerty abc123 111111 1234567 monkey ' +
    'dragon letmein trustno1 sunshine master welcome shadow ashley football jesus michael ninja ' +
    'mustang password1 123123 654321 superman qazwsx iloveyou admin login princess starwars ' +
    'passw0rd zaq12wsx 1q2w3e4r qwertyuiop').split(' ');

  var KEYBOARD = ['qwerty','asdfgh','zxcvbn','qwertz','azerty','1234567890','qazwsx','1qaz2wsx'];

  function analyse(pw){
    var lower = pw.toLowerCase();
    var issues = [];
    var pool = 0;
    var types = 0;

    if (/[a-z]/.test(pw)) { pool += 26; types++; }
    if (/[A-Z]/.test(pw)) { pool += 26; types++; }
    if (/[0-9]/.test(pw)) { pool += 10; types++; }
    if (/[^a-zA-Z0-9]/.test(pw)) { pool += 33; types++; }

    var entropy = pw.length * Math.log2(pool || 1);
    var penalty = 0;

    // Exact match against a common password destroys the entropy estimate.
    if (COMMON.indexOf(lower) > -1) {
      issues.push(['warn', 'On every breach list', 'This exact password appears in the most common passwords used by attackers. It would be guessed immediately.']);
      penalty += 60;
    } else if (COMMON.some(function(c){ return lower.indexOf(c) > -1 && c.length >= 5; })) {
      issues.push(['warn', 'Contains a common password', 'A well-known password appears inside this one. Attackers try these with prefixes and suffixes automatically.']);
      penalty += 22;
    }

    if (KEYBOARD.some(function(k){ return lower.indexOf(k.slice(0, 5)) > -1; })) {
      issues.push(['warn', 'Keyboard pattern', 'Sequences like qwerty or 1qaz2wsx are in every cracking dictionary.']);
      penalty += 18;
    }

    if (/(.)\\1{2,}/.test(pw)) {
      issues.push(['warn', 'Repeated characters', 'Three or more of the same character in a row adds far less than it appears to.']);
      penalty += 8;
    }

    if (/(0?1?2345|abcde|98765)/.test(lower)) {
      issues.push(['warn', 'Sequential characters', 'Runs like 12345 or abcde are tried early by every cracking tool.']);
      penalty += 12;
    }

    // A year, especially a recent one, is a very small search space.
    if (/(19|20)\\d\\d/.test(pw)) {
      issues.push(['warn', 'Contains a year', 'Years are among the first things appended in a dictionary attack. There are only about 125 plausible ones.']);
      penalty += 10;
    }

    // Leetspeak substitutions are reversed automatically by cracking tools.
    var deleet = lower.replace(/0/g, 'o').replace(/1/g, 'l').replace(/3/g, 'e')
                      .replace(/4/g, 'a').replace(/5/g, 's').replace(/7/g, 't').replace(/@/g, 'a').replace(/\\$/g, 's');
    if (deleet !== lower && /^[a-z]+$/.test(deleet) && deleet.length >= 4) {
      issues.push(['warn', 'Predictable substitutions', 'Swapping a for @ or o for 0 adds almost nothing — cracking tools reverse these first.']);
      penalty += 12;
    }

    if (pw.length < 8) {
      issues.push(['warn', 'Too short', 'Under 8 characters falls to a brute-force attack in hours regardless of what the characters are.']);
      penalty += 25;
    } else if (pw.length < 12) {
      issues.push(['warn', 'Shorter than recommended', 'Aim for at least 12 characters, and 16 for anything important. Length matters far more than complexity.']);
      penalty += 10;
    }

    if (pw.length >= 16) issues.push(['good', 'Good length', 'Sixteen characters or more is the single most effective thing a password can do.']);
    if (types >= 3 && pw.length >= 12) issues.push(['good', 'Good variety', 'A mix of character types across a decent length gives a large search space.']);

    var effective = Math.max(0, entropy - penalty);
    return { entropy: entropy, effective: effective, types: types, issues: issues, pool: pool };
  }

  function crackTime(bits){
    // Offline attack against a fast hash, assumed 10^11 guesses per second.
    var seconds = Math.pow(2, Math.max(0, bits - 1)) / 1e11;
    if (seconds < 1) return 'instantly';
    var units = [['second', 60], ['minute', 60], ['hour', 24], ['day', 365]];
    var v = seconds, name = 'seconds';
    for (var i = 0; i < units.length; i++) {
      if (v < units[i][1]) { name = units[i][0]; break; }
      v /= units[i][1];
      name = i + 1 < units.length ? units[i + 1][0] : 'year';
    }
    if (name === 'year' && v > 1e9) return 'longer than the universe has existed';
    if (name === 'year' && v > 1e6) return Math.round(v / 1e6).toLocaleString('en-US') + ' million years';
    return 'about ' + v.toLocaleString('en-US', { maximumFractionDigits: v < 10 ? 1 : 0 }) + ' ' + name + (v >= 2 ? 's' : '');
  }

  function rate(bits){
    if (bits < 28) return ['Very weak', '#d9534f', 12];
    if (bits < 40) return ['Weak', '#e07a4a', 30];
    if (bits < 60) return ['Fair', '#e8a33d', 52];
    if (bits < 80) return ['Strong', '#4caf7d', 76];
    return ['Very strong', '#2f7f5b', 100];
  }

  function run(){
    var pw = $('pw').value;
    if (!pw) { $('out').hidden = true; return; }
    var a = analyse(pw);
    var r = rate(a.effective);

    $('verdict').textContent = r[0];
    $('verdict').style.color = r[1];
    $('bar').style.width = r[2] + '%';
    $('bar').style.background = r[1];
    $('len').textContent = pw.length + ' chars';
    $('types').textContent = a.types + ' of 4';
    $('entropy').textContent = Math.round(a.effective) + ' bits';
    $('crack').textContent = 'An offline attacker at 100 billion guesses a second would need ' + crackTime(a.effective) + '.';
    $('issues').innerHTML = a.issues.map(function(i){
      return '<div class="issue ' + i[0] + '"><b>' + (i[0] === 'good' ? '✓' : '!') + '</b><span><strong>' +
        i[1] + '</strong> — ' + i[2] + '</span></div>';
    }).join('');
    $('out').hidden = false;
  }

  $('pw').addEventListener('input', run);
  $('toggle').addEventListener('click', function(){
    var showing = $('pw').type === 'text';
    $('pw').type = showing ? 'password' : 'text';
    this.textContent = showing ? 'Show' : 'Hide';
  });
})();`,

  answerHeading: 'What actually makes a password weak',
  answer: `<p><strong>Attackers do not guess passwords character by character — they guess the patterns people use.</strong> A password like <code>P@ssw0rd1!</code> looks complex, hits all four character types, and falls in under a second, because cracking tools try dictionary words with exactly those substitutions and suffixes first. Meanwhile <code>correct horse battery staple</code> has no capitals or symbols at all and would take longer than the universe has existed. Length and unpredictability beat complexity theatre every time.</p>`,

  steps: [
    'Type or paste a password into the box.',
    'Read the strength verdict and the specific weaknesses listed underneath.',
    'Fix what it flags — usually the answer is simply "make it longer".',
  ],

  sections: [
    {
      id: 'patterns',
      h2: 'The patterns attackers try first',
      html: `<p>A modern cracking rig does not start at <code>aaaaaaaa</code>. It starts with everything humans reliably do.</p>
<ul>
<li><strong>Leaked passwords.</strong> Billions of real passwords from past breaches are tried before anything else.</li>
<li><strong>Dictionary words</strong> with capitalised first letters, in every language.</li>
<li><strong>Leetspeak substitutions</strong> — a→@, o→0, e→3, s→$. These are reversed automatically and add essentially nothing.</li>
<li><strong>Appended numbers and symbols</strong>, especially <code>1</code>, <code>123</code>, <code>!</code> and years from 1950 to 2030.</li>
<li><strong>Keyboard walks</strong> like qwerty, 1qaz2wsx and zxcvbnm.</li>
<li><strong>Names and dates</strong> — pets, children, birthdays, sports teams.</li>
</ul>
<p>This is why "must contain a number and a symbol" rules produce such predictable passwords: almost everyone satisfies them the same way, by capitalising the first letter and adding <code>1!</code> at the end.</p>`,
    },
    {
      id: 'reuse',
      h2: 'Reuse is worse than weakness',
      html: `<p>A strong password used on twenty sites is more dangerous than twenty weak but unique ones. When any one of those sites is breached, attackers immediately try the same email and password combination everywhere else — an attack called credential stuffing, and it is automated and cheap.</p>
<p>Practically, this means one strong passphrase you can remember for your password manager, and unique random passwords generated for everything else. That single change does more for your security than any amount of complexity in an individual password.</p>
<p>Check whether your addresses appear in known breaches at <a href="https://haveibeenpwned.com" rel="noopener" target="_blank">Have I Been Pwned</a>.</p>`,
    },
    {
      id: 'privacy',
      h2: 'Should you type a real password here?',
      html: `<p>An honest answer: as a rule, no — not into this site or any other.</p>
<p>This page does everything locally. The analysis is plain JavaScript, no request is made, and you can verify that in your browser's network tab or by turning off your connection and watching it still work. But a malicious site would tell you exactly the same thing, and you have no way to distinguish the two from the outside.</p>
<p>The safe habit is to test a password of the <em>same shape</em> as yours rather than the real one — same length, same pattern, different words and digits. You will get the same verdict without ever typing the real thing.</p>`,
    },
  ],

  faq: [
    { q: 'Is my password sent anywhere?', a: '<p>No. All analysis runs in your browser and the page makes no network requests. You can disconnect from the internet and it still works. That said, the safest habit is to test a similar password rather than your real one on any site.</p>' },
    { q: 'Why is my complex password rated weak?', a: '<p>Almost certainly because it is built on a dictionary word with predictable substitutions or a year appended. Cracking tools try those combinations first, so the apparent complexity does not translate into real search space.</p>' },
    { q: 'How long should a password be?', a: '<p>At least 12 characters, and 16 or more for anything important. Each additional character multiplies the search space, which is why length beats complexity.</p>' },
    { q: 'What does entropy mean here?', a: '<p>Bits of unpredictability. Each bit doubles the guesses needed. Under 40 bits is weak, 60–80 is decent, and above 80 is strong against offline attack. This tool reduces the raw figure where it detects a predictable pattern.</p>' },
    { q: 'Are password managers safe?', a: '<p>Far safer than the alternative. They generate unique random passwords, will not autofill on a look-alike phishing domain, and mean you only have to remember one strong passphrase. The concentration of risk is real but well managed by reputable ones.</p>' },
  ],

  related: ['password-generator', 'wifi-qr-code-generator', 'qr-code-generator', 'random-number-generator'],
};
