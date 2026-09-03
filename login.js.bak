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
  + '#la-login .orgwrap{display:none}';

 var HTML = '<div class="card">'
  + '<h2>เข้าสู่ระบบ</h2>'
  + '<p class="sub">กรอกชื่อผู้ใช้และรหัสผ่านที่ได้รับ</p>'
  + '<div class="orgwrap"><label>รหัสบริษัท</label>'
  + '<input id="la-org" placeholder="เช่น loveandaman"></div>'
  + '<label>ชื่อผู้ใช้</label><input id="la-user" autocomplete="username">'
  + '<label>รหัสผ่าน</label><input id="la-pass" type="password" autocomplete="current-password">'
  + '<button id="la-go">เข้าสู่ระบบ</button>'
  + '<div class="err" id="la-err"></div></div>';

 function mount() {
   var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
   var box = document.createElement('div'); box.id = 'la-login'; box.innerHTML = HTML;
   document.body.appendChild(box);

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

 if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
