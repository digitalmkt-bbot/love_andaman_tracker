// patch.mjs — เพิ่มระบบสมัครเอง + ปรับ responsive
// ใช้: cd ~/Downloads/tracker && node patch.mjs
// ตรวจทุกขั้น ถ้าไม่ตรงคาดจะหยุดและไม่แตะไฟล์
import fs from 'node:fs';
import { execSync } from 'node:child_process';
const die = (m) => { console.error('❌ ' + m); process.exit(1); };
const read = (p) => { if (!fs.existsSync(p)) die('ไม่พบ ' + p + ' — ต้องรันจากโฟลเดอร์ tracker'); return fs.readFileSync(p, 'utf8'); };
const IDX = 'index.html', LG = 'login.js', SRV = 'auth/src/server.mjs';
let idx = read(IDX), lg = read(LG), srv = read(SRV);
const before = { idx: idx.length, lg: lg.length, srv: srv.length };
const log = [];

// ===== 1. responsive =====
const CSS = [
  '  <style id="la-responsive-v1">',
  'html,body{max-width:100%;overflow-x:hidden}',
  'body{padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right)}',
  '@media(max-width:820px){',
  'input,select,textarea{font-size:16px !important}',
  'table{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch}',
  'nav,[role="tablist"]{overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}',
  'nav::-webkit-scrollbar,[role="tablist"]::-webkit-scrollbar{display:none}}',
  '@media(max-width:560px){',
  '.grid.grid-cols-3:not([class*="md:"]):not([class*="lg:"]),',
  '.grid.grid-cols-4:not([class*="md:"]):not([class*="lg:"]){grid-template-columns:repeat(2,minmax(0,1fr)) !important}',
  '[class*="min-w-["]{min-width:0 !important}',
  'button,a[role="button"]{min-height:40px}',
  '.p-6{padding:1rem !important}.p-5{padding:.875rem !important}.gap-6{gap:1rem !important}}',
  '@media(max-width:380px){',
  '.grid.grid-cols-2:not([class*="md:"]):not([class*="lg:"]){grid-template-columns:minmax(0,1fr) !important}',
  '.grid.grid-cols-7{font-size:11px}}',
  '@media print{nav,button,[role="tablist"]{display:none !important}body{background:#fff !important}}',
  '  </style>'
  ].join('\n');

if (idx.includes('la-responsive-v1')) { log.push('- responsive: มีอยู่แล้ว ข้าม'); }
else {
  if ((idx.match(/<\/head>/g) || []).length !== 1) die('หา </head> ไม่เจอหรือเจอหลายจุด');
  idx = idx.replace('</head>', CSS + '\n</head>');
  log.push('+ responsive: CSS สำหรับ 380 / 560 / 820px และสำหรับพิมพ์');
}

const LOGIN_CSS = "+ '@media(max-width:480px){#la-login{padding:14px}#la-login .card{padding:26px 20px}#la-login h2{font-size:20px}}'\n+ '#la-login input{font-size:16px}'\n";
if (lg.includes('max-width:480px')) { log.push('- login.js responsive: มีอยู่แล้ว ข้าม'); }
else {
  const anchor = "+ '#la-login .orgwrap{display:none}'";
  if (!lg.includes(anchor)) die('โครง CSS ใน login.js ไม่ตรงกับที่คาด');
  lg = lg.replace(anchor, anchor + '\n' + LOGIN_CSS.trim());
  log.push('+ login.js: พอดีจอมือถือ ไม่โดน iOS ซูม');
}

// ===== 2. ระบบสมัครเอง (ฝั่งหลังบ้าน) =====
const SIGNUP = [
  "",
  "/* /signup — ลูกค้าสมัครเอง ทดลองฟรี 14 วัน */",
  "const signups = new Map();",
  "function signupThrottled(ip) {",
  "const now = Date.now();",
  "const list = (signups.get(ip) || []).filter(t => now - t < 3600000);",
  "signups.set(ip, list);",
  "return list.length >= 3;",
  "}",
  "const RESERVED = new Set(['admin','api','auth','www','app','test','demo','root','support','help','billing','system']);",
  "",
  "app.post('/signup', async (req, res) => {",
  "const ip = req.ip;",
  "const { company, code, username, password } = req.body || {};",
  "// นับทุกครั้งที่พยายาม ไม่ใช่เฉพาะที่สำเร็จ",
  "// ไม่งั้นคนร้ายยิงข้อมูลผิดรัวๆ เพื่อไล่หารหัสบริษัทที่ว่างได้ฟรี",
  "if (signupThrottled(ip)) return res.status(429).json({ error: 'สมัครบ่อยเกินไป กรุณารออีก 1 ชั่วโมง' });",
  "signups.set(ip, [...(signups.get(ip) || []), Date.now()]);",
  "const errs = [];",
  "if (!company || String(company).trim().length < 2) errs.push('กรุณากรอกชื่อบริษัท');",
  "if (!code || !/^[a-z0-9][a-z0-9-]{2,19}$/.test(String(code).toLowerCase())) errs.push('รหัสบริษัทต้องเป็น a-z 0-9 ยาว 3-20 ตัว');",
  "if (RESERVED.has(String(code || '').toLowerCase())) errs.push('รหัสบริษัทนี้สงวนไว้');",
  "if (!username || !/^[A-Za-z0-9._-]{3,30}$/.test(String(username))) errs.push('ชื่อผู้ใช้ต้องเป็น a-z 0-9 . _ - ยาว 3-30 ตัว');",
  "if (!password || String(password).length < 8) errs.push('รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร');",
  "if (errs.length) return res.status(400).json({ error: errs[0], errors: errs });",
  "const orgCode = String(code).toLowerCase();",
  "const client = await pool.connect();",
  "try {",
  "await client.query('BEGIN');",
  "const dup = await client.query('SELECT 1 FROM orgs WHERE lower(code) = $1', [orgCode]);",
  "if (dup.rows.length) { await client.query('ROLLBACK'); return res.status(409).json({ error: 'รหัสบริษัทนี้มีคนใช้แล้ว กรุณาเลือกใหม่', field: 'code' }); }",
  "const orgId = 'org_' + crypto.randomBytes(5).toString('hex');",
  "const uid = 'u_' + crypto.randomBytes(6).toString('hex');",
  "await client.query(\"INSERT INTO orgs (id, code, name, plan, seat_limit, status, expires_at) VALUES ($1, $2, $3, 'trial', 5, 'active', now() + interval '14 days')\", [orgId, orgCode, String(company).trim()]);",
  "await client.query(\"INSERT INTO users (id, org_id, username, password_hash, role, must_change_password) VALUES ($1, $2, $3, $4, 'admin', false)\", [uid, orgId, username, await bcrypt.hash(password, 10)]);",
  "await client.query('COMMIT');",
  "// ล็อกอินให้เลย ลูกค้าเข้าใช้งานได้ทันที",
  "const token = signToken({ id: uid, org_id: orgId, username: username, role: 'admin' });",
  "res.json({ token: token, expires_in: TTL_HOURS * 3600, user: { id: uid, username: username, role: 'admin', org_id: orgId, must_change_password: false }, org: { id: orgId, code: orgCode, name: String(company).trim(), plan: 'trial', trial_days: 14 } });",
  "} catch (e) {",
  "await client.query('ROLLBACK').catch(() => {});",
  "if (e.code === '23505') return res.status(409).json({ error: 'รหัสบริษัทหรือชื่อผู้ใช้นี้มีอยู่แล้ว' });",
  "console.error('signup error:', e.message);",
  "res.status(500).json({ error: 'ระบบขัดข้อง กรุณาลองใหม่' });",
  "} finally { client.release(); }",
  "});",
  "",
  "app.get('/check-code', async (req, res) => {",
  "const code = String(req.query.code || '').toLowerCase();",
  "if (!/^[a-z0-9][a-z0-9-]{2,19}$/.test(code) || RESERVED.has(code)) return res.json({ available: false, reason: 'invalid' });",
  "try { const r = await pool.query('SELECT 1 FROM orgs WHERE lower(code) = $1', [code]); res.json({ available: r.rows.length === 0 }); }",
  "catch { res.json({ available: null }); }",
  "});",
  ""
  ].join('\n');

if (srv.includes("'/signup'")) { log.push('- /signup: มีอยู่แล้ว ข้าม'); }
else {
  const a = "app.get('/health'";
  if ((srv.split(a).length - 1) !== 1) die('หา ' + a + ' ไม่เจอหรือเจอหลายจุด');
  srv = srv.replace(a, SIGNUP + '\n' + a);
  log.push('+ server.mjs: POST /signup และ GET /check-code');
}

// ===== 3. หน้าจอสมัคร =====
if (lg.includes('su-code')) { log.push('- หน้าสมัคร: มีอยู่แล้ว ข้าม'); }
else {
  const m = lg.match(/var HTML = '<div class="card">'[\s\S]*?id="la-err"><\/div><\/div>';/);
  if (!m) die('หาบล็อก HTML ใน login.js ไม่เจอ');
  const UI = [
    "var MODE = 'login';",
    "var HTML_LOGIN = '<div class=\"card\">' + '<h2>เข้าสู่ระบบ</h2>' + '<p class=\"sub\">กรอกชื่อผู้ใช้และรหัสผ่านที่ได้รับ</p>' + '<div class=\"orgwrap\"><label>รหัสบริษัท</label><input id=\"la-org\"></div>' + '<label>ชื่อผู้ใช้</label><input id=\"la-user\" autocomplete=\"username\">' + '<label>รหัสผ่าน</label><input id=\"la-pass\" type=\"password\" autocomplete=\"current-password\">' + '<button id=\"la-go\">เข้าสู่ระบบ</button>' + '<div class=\"err\" id=\"la-err\"></div>' + '<div class=\"swap\">ยังไม่มีบัญชี? <a id=\"la-toggle\">สมัครใช้งานฟรี 14 วัน</a></div>' + '</div>';",
    "var HTML_SIGNUP = '<div class=\"card\">' + '<h2>สมัครใช้งาน</h2>' + '<p class=\"sub\">ทดลองใช้ฟรี 14 วัน ไม่ต้องใส่บัตรเครดิต</p>' + '<label>ชื่อบริษัท</label><input id=\"su-company\">' + '<label>รหัสบริษัท <span class=\"hint\">(a-z 0-9 ใช้ตอนล็อกอิน)</span></label><input id=\"su-code\" autocapitalize=\"off\">' + '<div class=\"codemsg\" id=\"su-codemsg\"></div>' + '<label>ชื่อผู้ใช้ผู้ดูแล</label><input id=\"su-user\">' + '<label>รหัสผ่าน <span class=\"hint\">(อย่างน้อย 8 ตัว)</span></label><input id=\"su-pass\" type=\"password\">' + '<button id=\"su-go\">เริ่มทดลองใช้ฟรี</button>' + '<div class=\"err\" id=\"su-err\"></div>' + '<div class=\"swap\">มีบัญชีแล้ว? <a id=\"la-toggle\">เข้าสู่ระบบ</a></div>' + '</div>';",
    "var HTML = HTML_LOGIN;"
    ].join('\n');
  lg = lg.replace(m[0], UI);
  log.push('+ login.js: หน้าสมัคร สลับไปมากับหน้าล็อกอินได้');
}

// CSS ของหน้าสมัคร
if (!lg.includes('la-login .swap')) {
  const a2 = "+ '#la-login .orgwrap{display:none}'";
  const add = [
    "+ '#la-login .swap{margin-top:18px;text-align:center;font-size:13.5px;color:#64748B}'",
    "+ '#la-login .swap a{color:#0F766E;font-weight:600;cursor:pointer;text-decoration:underline}'",
    "+ '#la-login .hint{font-weight:400;color:#94A3B8;font-size:12px}'",
    "+ '#la-login .codemsg{margin-top:6px;font-size:12.5px;min-height:16px}'",
    "+ '#la-login .codemsg.ok{color:#047857}'",
    "+ '#la-login .codemsg.no{color:#B91C1C}'"
    ].join('\n');
  lg = lg.replace(a2, a2 + '\n' + add);
}

// ตัวควบคุมหน้าจอ — สลับโหมดและสมัคร
if (!lg.includes('function wireSignup')) {
  const WIRE = [
    "function wireSignup(box) {",
    "var btn = box.querySelector('#su-go'), err = box.querySelector('#su-err');",
    "var codeEl = box.querySelector('#su-code'), msg = box.querySelector('#su-codemsg'), timer = null;",
    "codeEl.addEventListener('input', function () {",
    "var v = (codeEl.value || '').toLowerCase().replace(/[^a-z0-9-]/g, '');",
    "codeEl.value = v; msg.className = 'codemsg'; msg.textContent = ''; clearTimeout(timer);",
    "if (v.length < 3) return;",
    "timer = setTimeout(function () {",
    "fetch(AUTH + '/check-code?code=' + encodeURIComponent(v)).then(function (r) { return r.json(); })",
    ".then(function (d) { if (d.available === true) { msg.className = 'codemsg ok'; msg.textContent = '✓ ใช้รหัสนี้ได้'; } else if (d.available === false) { msg.className = 'codemsg no'; msg.textContent = '✕ รหัสนี้ถูกใช้แล้ว'; } }).catch(function () {});",
    "}, 400);",
    "});",
    "function go() {",
    "var body = { company: (box.querySelector('#su-company').value || '').trim(), code: (codeEl.value || '').trim().toLowerCase(), username: (box.querySelector('#su-user').value || '').trim(), password: box.querySelector('#su-pass').value || '' };",
    "btn.disabled = true; err.textContent = '';",
    "fetch(AUTH + '/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })",
    ".then(function (r) { return r.json().then(function (b) { return { ok: r.ok, b: b }; }); })",
    ".then(function (res) { btn.disabled = false; if (!res.ok) { err.textContent = (res.b && res.b.error) || 'สมัครไม่สำเร็จ'; return; } localStorage.setItem(KEY, JSON.stringify({ token: res.b.token, user: res.b.user })); location.reload(); })",
    ".catch(function () { btn.disabled = false; err.textContent = 'ติดต่อเซิร์ฟเวอร์ไม่ได้'; });",
    "}",
    "btn.addEventListener('click', go);",
    "box.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });",
    "}"
    ].join('\n');
  const mm = lg.match(/^[ \t]*function mount\(\) \{/m);
  if (!mm) die('หา function mount ใน login.js ไม่เจอ');
  lg = lg.slice(0, mm.index) + WIRE + '\n' + lg.slice(mm.index);
}

// ห่อโค้ดล็อกอินเดิมเป็น wireLogin แล้วทำตัวสลับโหมด
if (!lg.includes('function wireLogin')) {
  const b1 = lg.match(/^([ \t]*)var btn = box\.querySelector\('#la-go'\);/m);
  if (!b1) die('หา var btn ใน login.js ไม่เจอ');
  lg = lg.slice(0, b1.index) + b1[1] + 'function wireLogin(box) {\n' + lg.slice(b1.index);
  const b2 = lg.match(/^([ \t]*)box\.addEventListener\('keydown'[^\n]*\n([ \t]*)\}/m);
  if (!b2) die('หาท้ายฟังก์ชันล็อกอินไม่เจอ');
  const endAt = b2.index + b2[0].length;
  lg = lg.slice(0, endAt) + '\n' + b2[2] + '}' + lg.slice(endAt);
  const old = lg.match(/var box = document\.createElement\('div'\);\s*box\.id = 'la-login';\s*box\.innerHTML = HTML;/);
  if (!old) die('หาโค้ดสร้างกล่องไม่เจอ');
  const NEW = [
    "var box = document.createElement('div'); box.id = 'la-login';",
    "function render() {",
    "box.innerHTML = MODE === 'signup' ? HTML_SIGNUP : HTML_LOGIN;",
    "box.querySelector('#la-toggle').addEventListener('click', function () { MODE = MODE === 'signup' ? 'login' : 'signup'; render(); });",
    "if (MODE === 'signup') { wireSignup(box); box.querySelector('#su-company').focus(); }",
    "else { wireLogin(box); box.querySelector('#la-user').focus(); }",
    "}",
    "render();"
    ].join('\n');
  lg = lg.replace(old[0], NEW);
}

// ===== 4. ตรวจก่อนเขียนไฟล์ =====
const problems = [];
const need = [[idx, 'index.html', ['function laFetch', 'src="login.js"', '</body>', '</html>', 'la-responsive-v1']], [lg, 'login.js', ['HTML_LOGIN', 'HTML_SIGNUP', 'wireLogin', 'wireSignup', 'su-code']], [srv, 'server.mjs', ["'/signup'", "'/check-code'", "'/login'", "'/health'"]]];
for (const [txt, name, keys] of need) for (const k of keys) if (!txt.includes(k)) problems.push(name + ': หายไป ' + k);
if ((idx.match(/<script/g) || []).length !== (idx.match(/<\/script>/g) || []).length) problems.push('index.html: <script> ไม่สมดุล');
fs.writeFileSync('.chk_login.js', lg); fs.writeFileSync('.chk_server.mjs', srv);
for (const f of ['.chk_login.js', '.chk_server.mjs']) {
  try { execSync('node --check ' + f, { stdio: 'pipe' }); }
  catch (e) { problems.push(f + ' syntax พัง: ' + String(e.stderr).split('\n').filter(Boolean).slice(-2)[0]); }
}
fs.unlinkSync('.chk_login.js'); fs.unlinkSync('.chk_server.mjs');
if (problems.length) { console.error('❌ ตรวจไม่ผ่าน ไม่แตะไฟล์:'); problems.forEach(p => console.error('   · ' + p)); process.exit(1); }

for (const [p, t] of [[IDX, idx], [LG, lg], [SRV, srv]]) { fs.copyFileSync(p, p + '.bak'); fs.writeFileSync(p, t); }
console.log('✅ เรียบร้อย');
log.forEach(l => console.log('   ' + l));
console.log('');
console.log('   index.html ' + before.idx + ' -> ' + idx.length);
console.log('   login.js   ' + before.lg + ' -> ' + lg.length);
console.log('   server.mjs ' + before.srv + ' -> ' + srv.length);
console.log('');
console.log('   ต่อไป: git add -A && git commit -m "signup + responsive" && git push origin Clone-task');
