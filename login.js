/* login.js — ระบบล็อกอินของ Tracker
   โหลดก่อนโค้ดหลัก ทำสามอย่าง
     1. ตั้ง window.LA_CONFIG ให้ index.html อ่าน
     2. ให้ฟังก์ชัน laToken() laUser() laLogout()
     3. ไม่มี token ที่ใช้ได้ → ขึ้นหน้าจอล็อกอินเต็มจอ
   token มาจากการล็อกอินเท่านั้น ไม่มี token ฝังในโค้ด */
(function () {
  var API  = 'https://api-clone-task.up.railway.app';
  var AUTH = 'https://auth-clone-clone-task.up.railway.app';
  var KEY  = 'la_session';
  window.LA_CONFIG = { api: API, auth: AUTH };

 function sess() {
   try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
 }
  window.laToken  = function () { var s = sess(); return s && s.token ? s.token : ''; };
  window.laUser   = function () { var s = sess(); return s && s.user  ? s.user  : null; };
  window.laLogout = function () { localStorage.removeItem(KEY); location.reload(); };

 function alive() {
   var t = window.laToken();
   if (!t) return false;
   try {
     var p = JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
     return !p.exp || (p.exp * 1000 - Date.now() > 60000);
   } catch (e) { return false; }
 }
  if (alive()) return;
  localStorage.removeItem(KEY);

 document.documentElement.style.overflow = 'hidden';

 var CSS = '#la-login{position:fixed;inset:0;z-index:2147483647;background:#0F1720;display:flex;'
  + 'align-items:center;justify-content:center;font-family:system-ui,sans-serif;padding:20px}'
  + '#la-login .card{background:#fff;border-radius:18px;padding:36px 32px;width:100%;max-width:380px;'
  + 'box-shadow:0 24px 60px rgba(0,0,0,.35)}'
  + '#la-login h2{margin:0 0 6px;font-size:22px;color:#0F1720;font-weight:800}'
  + '#la-login p.sub{margin:0 0 20px;font-size:14px;color:#64748B}'
  + '#la-login label{display:block;font-size:13px;font-weight:600;color:#334155;margin:14px 0 6px}'
  + '#la-login input{width:100%;box-sizing:border-box;padding:11px 13px;font-size:15px;'
  + 'border:1px solid #CBD5E1;border-radius:10px;outline:none}'
  + '#la-login input:focus{border-color:#0F766E;box-shadow:0 0 0 3px rgba(15,118,110,.12)}'
  + '#la-login button{width:100%;margin-top:22px;padding:12px;font-size:16px;font-weight:700;'
  + 'color:#fff;background:#0F766E;border:0;border-radius:10px;cursor:pointer}'
  + '#la-login button:disabled{opacity:.55;cursor:default}'
  + '#la-login .err{margin-top:14px;font-size:13.5px;color:#B91C1C;min-height:18px}'
  + '#la-login .orgwrap{display:none}'
+ '#la-login .swap{margin-top:18px;text-align:center;font-size:13.5px;color:#64748B}'
+ '#la-login .swap a{color:#0F766E;font-weight:600;cursor:pointer;text-decoration:underline}'
+ '#la-login .hint{font-weight:400;color:#94A3B8;font-size:12px}'
+ '#la-login .codemsg{margin-top:6px;font-size:12.5px;min-height:16px}'
+ '#la-login .codemsg.ok{color:#047857}'
+ '#la-login .codemsg.no{color:#B91C1C}'
+ '@media(max-width:480px){#la-login{padding:14px}#la-login .card{padding:26px 20px}#la-login h2{font-size:20px}}'
+ '#la-login input{font-size:16px}';

 var MODE = 'login';
var HTML_LOGIN = '<div class="card">' + '<h2>เข้าสู่ระบบ</h2>' + '<p class="sub">กรอกชื่อผู้ใช้และรหัสผ่านที่ได้รับ</p>' + '<div class="orgwrap"><label>รหัสบริษัท</label><input id="la-org"></div>' + '<label>ชื่อผู้ใช้</label><input id="la-user" autocomplete="username">' + '<label>รหัสผ่าน</label><input id="la-pass" type="password" autocomplete="current-password">' + '<button id="la-go">เข้าสู่ระบบ</button>' + '<div class="err" id="la-err"></div>' + '<div class="swap">ยังไม่มีบัญชี? <a id="la-toggle">สมัครใช้งานฟรี 14 วัน</a></div>' + '</div>';
var HTML_SIGNUP = '<div class="card">' + '<h2>สมัครใช้งาน</h2>' + '<p class="sub">ทดลองใช้ฟรี 14 วัน ไม่ต้องใส่บัตรเครดิต</p>' + '<label>ชื่อบริษัท</label><input id="su-company">' + '<label>รหัสบริษัท <span class="hint">(a-z 0-9 ใช้ตอนล็อกอิน)</span></label><input id="su-code" autocapitalize="off">' + '<div class="codemsg" id="su-codemsg"></div>' + '<label>ชื่อผู้ใช้ผู้ดูแล</label><input id="su-user">' + '<label>รหัสผ่าน <span class="hint">(อย่างน้อย 8 ตัว)</span></label><input id="su-pass" type="password">' + '<button id="su-go">เริ่มทดลองใช้ฟรี</button>' + '<div class="err" id="su-err"></div>' + '<div class="swap">มีบัญชีแล้ว? <a id="la-toggle">เข้าสู่ระบบ</a></div>' + '</div>';
var HTML = HTML_LOGIN;

function wireSignup(box) {
var btn = box.querySelector('#su-go'), err = box.querySelector('#su-err');
var codeEl = box.querySelector('#su-code'), msg = box.querySelector('#su-codemsg'), timer = null;
codeEl.addEventListener('input', function () {
var v = (codeEl.value || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
codeEl.value = v; msg.className = 'codemsg'; msg.textContent = ''; clearTimeout(timer);
if (v.length < 3) return;
timer = setTimeout(function () {
fetch(AUTH + '/check-code?code=' + encodeURIComponent(v)).then(function (r) { return r.json(); })
.then(function (d) { if (d.available === true) { msg.className = 'codemsg ok'; msg.textContent = '✓ ใช้รหัสนี้ได้'; } else if (d.available === false) { msg.className = 'codemsg no'; msg.textContent = '✕ รหัสนี้ถูกใช้แล้ว'; } }).catch(function () {});
}, 400);
});
function go() {
var body = { company: (box.querySelector('#su-company').value || '').trim(), code: (codeEl.value || '').trim().toLowerCase(), username: (box.querySelector('#su-user').value || '').trim(), password: box.querySelector('#su-pass').value || '' };
btn.disabled = true; err.textContent = '';
fetch(AUTH + '/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
.then(function (r) { return r.json().then(function (b) { return { ok: r.ok, b: b }; }); })
.then(function (res) { btn.disabled = false; if (!res.ok) { err.textContent = (res.b && res.b.error) || 'สมัครไม่สำเร็จ'; return; } localStorage.setItem(KEY, JSON.stringify({ token: res.b.token, user: res.b.user })); location.reload(); })
.catch(function () { btn.disabled = false; err.textContent = 'ติดต่อเซิร์ฟเวอร์ไม่ได้'; });
}
btn.addEventListener('click', go);
box.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
}
 function mount() {
   var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
   var box = document.createElement('div'); box.id = 'la-login';
function render() {
box.innerHTML = MODE === 'signup' ? HTML_SIGNUP : HTML_LOGIN;
box.querySelector('#la-toggle').addEventListener('click', function () { MODE = MODE === 'signup' ? 'login' : 'signup'; render(); });
if (MODE === 'signup') { wireSignup(box); box.querySelector('#su-company').focus(); }
else { wireLogin(box); box.querySelector('#la-user').focus(); }
}
render();
   document.body.appendChild(box);

  function wireLogin(box) {
  var btn = box.querySelector('#la-go');
   var err = box.querySelector('#la-err');
   var orgWrap = box.querySelector('.orgwrap');
   box.querySelector('#la-user').focus();

  function go() {
    var org  = (box.querySelector('#la-org').value  || '').trim();
    var user = (box.querySelector('#la-user').value || '').trim();
    var pass = box.querySelector('#la-pass').value || '';
    if (!user || !pass) { err.textContent = 'กรอกชื่อผู้ใช้และรหัสผ่าน'; return; }
    btn.disabled = true; err.textContent = '';
    fetch(AUTH + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ org: org || null, username: user, password: pass })
    })
    .then(function (r) { return r.json().then(function (b) { return { ok: r.ok, b: b }; }); })
    .then(function (res) {
      btn.disabled = false;
      if (!res.ok) {
        if (res.b && res.b.need_org) { orgWrap.style.display = 'block'; box.querySelector('#la-org').focus(); }
        err.textContent = (res.b && res.b.error) || 'เข้าสู่ระบบไม่สำเร็จ';
        return;
      }
      localStorage.setItem(KEY, JSON.stringify({ token: res.b.token, user: res.b.user }));
      location.reload();
    })
    .catch(function () { btn.disabled = false; err.textContent = 'ติดต่อเซิร์ฟเวอร์ไม่ได้'; });
  }
   btn.addEventListener('click', go);
   box.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
 }
 }

 if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
