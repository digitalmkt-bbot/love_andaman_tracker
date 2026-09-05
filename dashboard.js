/* dashboard.js - Reference theme, logo, colors, EN/TH language
   โหลดต่อจากโค้ดหลัก แล้วเขียนทับ component ที่เป็น global
      ไม่แตะ index.html เลย ไม่ชอบก็ลบไฟล์นี้ไฟล์เดียว */
(function () {
  if (typeof React === 'undefined') return;
   function e() { return React.createElement.apply(null, arguments); 
                }  var IND = '#6366F1', DEEP = '#4F46E5', INK = '#0F1720', MUT = '#64748B';

  // ===== 1. การ์ดต้อนรับ — ไล่สีม่วง-ชมพูตาม Ref =====
  window.WelcomeCard = function (p) {
    return e('div', {
      className: 'rounded-[28px] p-7 md:p-9 relative overflow-hidden',
      style: { background: 'linear-gradient(100deg,#BFA5FC 0%,#DAB3FD 45%,#F7D5E6 100%)', minHeight: 210 }
    },
             e('div', { className: 'relative z-10 max-w-xl' },
               e('div', { className: 'text-[11px] font-extrabold uppercase tracking-[0.15em] mb-2', style: { color: '#5B21B6' } }, "Today's Focus"),
               e('h2', { className: 'text-3xl md:text-[40px] font-extrabold leading-[1.15] mb-6', style: { color: '#3B0764' } }, 'Plan. Prioritize.', e('br'), 'Achieve.'),
               e('button', {
                 onClick: p && p.onStart,
                 className: 'inline-flex items-center gap-3 pl-6 pr-2 py-2 rounded-full text-sm font-bold text-white',
                 style: { background: '#111322' }
               },
                 e('span', null, 'เพิ่มงานใหม่'),
                 e('span', { className: 'w-8 h-8 rounded-full flex items-center justify-center text-base', style: { background: '#fff', color: '#111322' } }, '\u2192')
                 )
               )
             );
  };

  // ===== 2. การ์ดตัวเลขสรุป 5 ใบ =====
  window.StatsRow = function (p) {
    var s = (p && p.stats) || {};
    var cards = [
      { label: 'Total Task', value: s.total, bg: DEEP, fg: '#FFFFFF', sub: 'rgba(255,255,255,.75)', ring: 'rgba(255,255,255,.22)' },
      { label: 'Completed', value: s.done, bg: '#D1FAE5', fg: '#047857', sub: '#047857', ring: '#FFFFFF' },
      { label: 'In Progress', value: s.inProgress, bg: '#FEF3C7', fg: '#B45309', sub: '#B45309', ring: '#FFFFFF' },
      { label: 'Not Started', value: s.notStarted, bg: '#E0E7FF', fg: '#4F46E5', sub: '#4F46E5', ring: '#FFFFFF' },
      { label: 'Overdue', value: s.overdue, bg: '#FFE4E6', fg: '#BE123C', sub: '#BE123C', ring: '#FFFFFF' }
      ];
    var pad = function (n) { n = Number(n || 0); return n < 10 ? '0' + n : String(n); };
    return e('div', { className: 'grid grid-cols-2 md:grid-cols-5 gap-4' },
             cards.map(function (c) {
               return e('div', {
                 key: c.label,
                 className: 'rounded-[22px] px-5 py-5 flex items-center gap-4',
                 style: { background: c.bg, boxShadow: '0 8px 24px rgba(30,45,60,.07)' }
               },
                        e('div', {
                          className: 'w-11 h-11 rounded-full flex items-center justify-center shrink-0',
                          style: { background: c.ring }
                        }, e('div', { className: 'w-4 h-4 rounded-full border-2', style: { borderColor: c.fg } })),
                        e('div', { className: 'min-w-0' },
                          e('div', { className: 'text-[26px] font-extrabold leading-none', style: { color: c.fg } }, pad(c.value)),
                          e('div', { className: 'text-[12px] font-semibold mt-1 truncate', style: { color: c.sub } }, c.label)
                          )
                        );
             })
             );
  };

  // ===== 3. เมนูซ้าย — ไอคอนในกรอบมน + ข้อความ =====
  window.NavItem = function (p) {
    var Icon = p.icon, active = p.active, disabled = p.disabled;
    return e('button', {
      onClick: disabled ? null : p.onClick,
      disabled: disabled,
      className: 'w-full flex items-center gap-3 pl-2 pr-3 py-2 rounded-2xl text-sm font-semibold transition',
      style: {
        background: active ? '#EEF2FF' : 'transparent',
        color: active ? DEEP : (disabled ? '#CBD5E1' : '#475569'),
          opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'default' : 'pointer'
      }
    },
             e('span', {
               className: 'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
               style: { background: active ? DEEP : '#F1F5F9', color: active ? '#FFFFFF' : '#64748B' }
             }, Icon ? e(Icon, { size: 17 }) : null),
             e('span', { className: 'flex-1 text-left truncate' }, p.label),
             p.badge != null && p.badge !== '' ? e('span', {
               className: 'text-[11px] font-bold px-2 py-0.5 rounded-full',
               style: { background: active ? DEEP : '#E2E8F0', color: active ? '#FFFFFF' : '#475569' }
             }, p.badge) : null
             );
  };

   // ===== 4. หัวการ์ดกราฟ — ตัดเครื่องหมาย // ออก =====
   window.ChartCard = function (p) {
      return e('div', { className: 'rounded-[28px] p-6', style: { background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 6px 22px rgba(30,45,60,.06)' } },
               e('div', { className: 'flex items-start justify-between mb-4' },
                 e('div', null,
                   e('h3', { className: 'text-[16px] font-extrabold', style: { color: INK } }, p.title),
                   p.subtitle ? e('p', { className: 'text-[12px] mt-0.5', style: { color: MUT } }, p.subtitle) : null),
                 p.action || null),
               p.children);
   };

   // ===== 5. โดนัทสถานะงาน — เลขกลางวง + legend ขวา สีตาม Ref =====
   var REF_COLORS = ['#6B73EB', '#2BD4B7', '#FAA942', '#4A95F6', '#A78BFA'];
   window.StatusMultiDonut = function (p) {
      var raw = (p && p.data) || [], total = (p && p.total) || 0;
      var data = raw.map(function (d, i) { return { name: d.name, value: d.value, color: REF_COLORS[i % REF_COLORS.length] }; });
      var R = 52, SW = 20, C = 2 * Math.PI * R, acc = 0;
      var segs = data.map(function (d) {
         var len = total > 0 ? (d.value / total) * C : 0;
         var off = -acc; acc += len;
         return e('circle', { key: d.name, cx: 70, cy: 70, r: R, fill: 'none', stroke: d.color, strokeWidth: SW, strokeDasharray: len + ' ' + (C - len), strokeDashoffset: off, strokeLinecap: 'butt' });
      });
      return e('div', { className: 'flex items-center gap-6 flex-wrap' },
               e('div', { className: 'relative shrink-0', style: { width: 150, height: 150 } },
                 e('svg', { viewBox: '0 0 140 140', style: { width: 150, height: 150, transform: 'rotate(-90deg)' } },
                   e('circle', { cx: 70, cy: 70, r: R, fill: 'none', stroke: '#F1F5F9', strokeWidth: SW }), segs),
                 e('div', { className: 'absolute inset-0 flex flex-col items-center justify-center' },
                   e('div', { className: 'text-[30px] font-black leading-none', style: { color: INK } }, total),
                   e('div', { className: 'text-[11px] font-medium mt-1', style: { color: MUT } }, 'Total Tasks'))),
               e('div', { className: 'flex-1 min-w-[160px] space-y-3' },
                 data.map(function (d) {
                    return e('div', { key: d.name, className: 'flex items-center justify-between' },
                             e('div', { className: 'flex items-center gap-2.5' },
                               e('span', { className: 'w-2.5 h-2.5 rounded-full', style: { background: d.color } }),
                               e('span', { className: 'text-[13px] font-medium', style: { color: '#334155' } }, d.name)),
                             e('span', { className: 'text-[13px] font-bold', style: { color: INK } }, d.value));
                 })));
   };

   // ===== 6. จับคู่สีเก่าทั้งระบบเข้ากับชุดสี Ref =====
   // แก้ที่ต้นทาง — CATEGORIES / STATUS_META / TEAM_COLOR_PALETTE เป็น global
   // จึงมีผลกับทุกหน้าพร้อมกัน
   var COLOR_MAP = {
      '#3A3A34': '#6366F1', '#8A6A2E': '#F59E0B', '#3E5AA0': '#4A95F6', '#2E6E8A': '#0EA5E9',
      '#2E7A4E': '#2BD4B7', '#3E5A7A': '#6B73EB', '#5A4A6A': '#A78BFA', '#B0392C': '#BE123C',
      '#EFEDE6': '#EEF2FF', '#EAE7DE': '#E0E7FF', '#B0AEA4': '#94A3B8', '#8A8A80': '#64748B',
      '#DCE6F1': '#E0E7FF', '#DDEAE1': '#D1FAE5', '#F5EFC9': '#E0E7FF', '#EFE7D6': '#FEF3C7',
      '#CFE8D4': '#D1FAE5', '#F5EFD9': '#FEF3C7', '#F3DEDA': '#FFE4E6', '#DCE9F5': '#E0E7FF'
   };
   function mapColor(c) { return COLOR_MAP[String(c || '').toUpperCase()] || c; }
   if (window.CATEGORIES) window.CATEGORIES.forEach(function (c) { c.color = mapColor(c.color); });
   if (window.STATUS_META) Object.keys(window.STATUS_META).forEach(function (k) {
      var s = window.STATUS_META[k];
      if (s.color) s.color = mapColor(s.color);
      if (s.bg) s.bg = mapColor(s.bg);
   });
   if (window.TEAM_COLOR_PALETTE) for (var i = 0; i < window.TEAM_COLOR_PALETTE.length; i++) {
      window.TEAM_COLOR_PALETTE[i] = mapColor(window.TEAM_COLOR_PALETTE[i]);
   }

   // ===== 7. โลโก้ดอกไม้ตาม Ref แทนชื่อทีมมุมซ้ายบน =====
   var LOGO_SVG = '<svg viewBox="0 0 100 100" style="width:38px;height:38px;display:block">'
   + '<circle cx="50" cy="30" r="18" fill="#8B5CF6" opacity=".9"/>'
   + '<circle cx="70" cy="45" r="18" fill="#EC4899" opacity=".9"/>'
   + '<circle cx="62" cy="70" r="18" fill="#3B82F6" opacity=".9"/>'
   + '<circle cx="38" cy="70" r="18" fill="#06B6D4" opacity=".9"/>'
   + '<circle cx="30" cy="45" r="18" fill="#A855F7" opacity=".9"/>'
   + '<circle cx="50" cy="50" r="12" fill="#EDE9FE"/></svg>';

   function applyLogo() {
      var hosts = document.querySelectorAll('div.flex.items-center');
      for (var i = 0; i < hosts.length; i++) {
         var d = hosts[i];
         if (d.dataset.laLogo) continue;
         var t = d.textContent || '';
         if (t.length < 40 && /Team/.test(t) && d.children.length <= 3) {
            d.dataset.laLogo = '1';
                        d.innerHTML = LOGO_SVG + '<span class="la-brand">' + laCachedBrand() + '</span>';
            return true;
         }
      }
      return false;
   }
   // React วาดใหม่แล้วโลโก้จะหาย จึงต้องเฝ้าและใส่ซ้ำ
   applyLogo();
   try {
      var mo = new MutationObserver(function () { applyLogo(); });
      mo.observe(document.body, { childList: true, subtree: true });
   } catch (err) {}

   // ===== 8. ดักที่ React — จับสีเก่าทุกที่เหลือ =====
   // บางสีเขียนตรงในโค้ด บางสีถูกบันทึกในฐานข้อมูลไปแล้ว (สีสมาชิกทีม)
   // ดักตรงนี้จึงครอบคลุมทุกทางในครั้งเดียว
   function mapHex(v) {
      if (typeof v !== 'string' || v.indexOf('#') === -1) return v;
      var out = v;
      for (var k in COLOR_MAP) {
         if (out.toUpperCase().indexOf(k) !== -1) out = out.replace(new RegExp(k, 'gi'), COLOR_MAP[k]);
      }
      return out;
   }
   if (React && !React.__laMapped) {
      var origCreate = React.createElement;
      React.createElement = function (type, props) {
         if (props && props.style && typeof props.style === 'object') {
            var changed = null;
            for (var k in props.style) {
               var nv = mapHex(props.style[k]);
               if (nv !== props.style[k]) { changed = changed || Object.assign({}, props.style); changed[k] = nv; }
            }
            if (changed) { arguments[1] = Object.assign({}, props, { style: changed }); }
         }
         var p2 = arguments[1];
         if (p2 && (type === 'circle' || type === 'path' || type === 'rect')) {
            var fa = mapHex(p2.fill), sa = mapHex(p2.stroke);
            if (fa !== p2.fill || sa !== p2.stroke) {
               arguments[1] = Object.assign({}, p2, { fill: fa, stroke: sa });
            }
         }
         return origCreate.apply(this, arguments);
      };
      React.__laMapped = true;
   }

   // ===== 9. พื้นหลัง + เต็มจอ + ชื่อข้างโลโก้ =====
   var css = document.createElement('style');
   css.id = 'la-ref-layout';
   css.textContent = [
      'div.min-h-screen.w-full.flex{background-image:none !important;',
      'background:linear-gradient(160deg,#F2F4FA 0%,#EEF1FA 55%,#F5F3FB 100%) !important}',
      'body.la-no-right [class*="xl:mr-80"]{margin-right:0 !important}',
'[data-la-logo]{gap:10px !important;justify-content:flex-start !important}',      '[data-la-logo] .la-brand{font-size:15px;font-weight:800;color:#0F1720;line-height:1.15;letter-spacing:-.01em}'
      ].join('');
   if (!document.getElementById('la-ref-layout')) document.head.appendChild(css);

   // ใส่ชื่อทีมข้างโลโก้ และขยายเนื้อหาเต็มจอเมื่อหน้านั้นไม่มีแผงขวา
   function syncLayout() {
      var hosts = document.querySelectorAll('div.flex.items-center');
      for (var i = 0; i < hosts.length; i++) {
         var d = hosts[i];
         if (d.dataset.laLogo) continue;
         var t = d.textContent || '';
                     if (t.length < 40 && /Team/.test(t) && d.children.length <= 3) {
            d.dataset.laLogo = '1';
                           d.innerHTML = LOGO_SVG + '<span class="la-brand">' + laCachedBrand() + '</span>';
            break;
         }
      }
      var right = document.querySelector('aside[class*="right-0"]');
      document.body.classList.toggle('la-no-right', !right);
   }
   syncLayout();
   setInterval(syncLayout, 500);

   // ===== 10. สองภาษา ไทย / อังกฤษ =====
   // เก็บภาษาที่เลือกไว้ในเครื่อง สลับแล้วโหลดหน้าใหม่
   var LANG = 'th';
   try { LANG = localStorage.getItem('la_lang') || 'th'; } catch (err) {}

   var PAIRS = [
      ['Dashboard', 'ภาพรวม'],
      ['Tracking', 'ติดตามงาน'],
      ['Planning Post', 'วางแผนโพสต์'],
      ['Public Relations Jobs', 'งานประชาสัมพันธ์'],
      ['Report', 'รายงาน'],
      ['Work History', 'ประวัติการทำงาน'],
      ['// Main Menu', '// เมนูหลัก'],
      ['Project', 'โปรเจกต์'],
      ['Progress', 'ความคืบหน้า'],
      ['Add New Task', 'เพิ่มงานใหม่'],
      ['Logout', 'ออกจากระบบ'],
      ['Search', 'ค้นหา'],
      ['Total Task', 'งานทั้งหมด'],
      ['Total Tasks', 'งานทั้งหมด'],
      ['Completed', 'เสร็จแล้ว'],
      ['In Progress', 'กำลังทำ'],
      ['Not Started', 'ยังไม่เริ่ม'],
      ['Overdue', 'เลยกำหนด'],
      ['Published', 'เผยแพร่แล้ว'],
      ['Planned', 'วางแผนไว้'],
      ['Cancelled', 'ยกเลิก'],
      ['Total Posts', 'โพสต์ทั้งหมด'],
      ['Upcoming', 'ใกล้ถึงกำหนด'],
      ['Task Percentage', 'สัดส่วนงาน'],
      ['Tasks by category', 'งานแบ่งตามหมวด'],
      ['Work Progress', 'งานที่กำลังดำเนินการ'],
      ['Working Status', 'สถานะการทำงาน'],
      ['Member Working', 'คนที่กำลังทำงาน'],
      ['Active', 'กำลังทำ'],
      ['Idle', 'ว่าง'],
      ['See All \u2192', 'ดูทั้งหมด \u2192'],
      ['Reload', 'โหลดใหม่'],
      ["Today's Focus", 'โฟกัสวันนี้']
      ];

   // สร้างตารางค้นสองทาง จะได้สลับกลับไปมาได้
   var T_MAP = {};
   for (var pi = 0; pi < PAIRS.length; pi++) {
      var en = PAIRS[pi][0], th = PAIRS[pi][1];
      T_MAP[en] = { en: en, th: th };
      T_MAP[th] = { en: en, th: th };
   }
   function tr(s) {
      if (typeof s !== 'string') return s;
      var hit = T_MAP[s.trim()];
      if (!hit) return s;
      return hit[LANG] || s;
   }

   // ดักข้อความที่ React วาด แล้วแปลตามภาษาที่เลือก
   if (React && !React.__laI18n) {
      var prevCreate = React.createElement;
      React.createElement = function (type, props) {
         var args = Array.prototype.slice.call(arguments);
         for (var i = 2; i < args.length; i++) {
            if (typeof args[i] === 'string') args[i] = tr(args[i]);
         }
         if (args[1] && typeof args[1] === 'object') {
            var p = args[1], changed = null;
            ['placeholder', 'title'].forEach(function (k) {
               if (typeof p[k] === 'string') {
                  var nv = tr(p[k]);
                  if (nv !== p[k]) { changed = changed || Object.assign({}, p); changed[k] = nv; }
               }
            });
            if (changed) args[1] = changed;
         }
         return prevCreate.apply(this, args);
      };
      React.__laI18n = true;
   }

   // ปุ่มสลับภาษา วางข้างช่องค้นหาด้านบน
   var langCss = document.createElement('style');
   langCss.textContent = [
      '.la-lang{display:inline-flex;align-items:center;gap:2px;background:#fff;border:1px solid #E2E8F0;',
      'border-radius:999px;padding:3px;box-shadow:0 2px 8px rgba(30,45,60,.06);flex:none}',
      '.la-lang button{border:0;background:transparent;cursor:pointer;font-size:12px;font-weight:700;',
      'padding:4px 10px;border-radius:999px;color:#64748B;line-height:1.2}',
      '.la-lang button.on{background:#4F46E5;color:#fff}'
      ].join('');
   document.head.appendChild(langCss);

   function setLang(v) {
      try { localStorage.setItem('la_lang', v); } catch (err) {}
      location.reload();
   }
   function addLangSwitch() {
      if (document.querySelector('.la-lang')) return;
      var sb = document.querySelector('input[type="text"], input:not([type])');
      var bar = sb && sb.closest('div.flex.items-center');
      if (bar) bar = bar.parentElement;
      if (!bar) return;
      var box = document.createElement('div');
      box.className = 'la-lang';
      box.innerHTML = '<button data-l="th">TH</button><button data-l="en">EN</button>';
      box.querySelectorAll('button').forEach(function (b) {
         if (b.dataset.l === LANG) b.className = 'on';
         b.addEventListener('click', function () { setLang(b.dataset.l); });
      });
      bar.appendChild(box);
   }
   addLangSwitch();
   setInterval(addLangSwitch, 700);

   // ===== 11. เติมคำแปลที่ขาด + ครอบคลุม props และวันที่ =====
   var EXTRA_PAIRS = [
      ['Planning Post Summary', 'สรุป Planning Post'],
      ['⚠️ No data — press Reload to fetch from Cloud', '⚠️ ไม่พบข้อมูล — กด Reload เพื่อโหลดจาก Cloud'],
      ['Target 8 posts', 'เป้า 8 โพสต์'],
      ['Add New Jobs', 'เพิ่มงาน PR'],
      ['Add Post', 'เพิ่ม Post'],
      ['Add first Post', 'เพิ่ม Post แรก'],
      ['All posts in this project', 'ภาพรวมโพสต์ทั้งหมดในโปรเจกต์นี้'],
      ['No data', 'ไม่มีข้อมูล'],
      ['By current status', 'แบ่งตามสถานะปัจจุบัน'],
      ['Tasks in progress', 'งานที่กำลังดำเนินการ'],
      ['Active members', 'ทีมที่ active'],
      ['Pick a date or a range', 'คลิกเลือกวัน หรือเลือกเป็นช่วงวัน'],
      ['No upcoming deadlines', 'ไม่มี deadline ใกล้ๆ'],
      ['New project', 'เพิ่มโปรเจกต์ใหม่'],
      ['Main', 'หลัก'],
      ['Manage', 'จัดการ'],
      ['All', 'ทั้งหมด'],
      ['All categories', 'ทุกหมวด'],
      ['Everyone', 'ทุกคน'],
      ['All statuses', 'ทุกสถานะ'],
      ['All channels', 'ทุก Channel'],
      ['Unassigned', 'ยังไม่ assign'],
      ['No posts yet', 'ยังไม่มี Post'],
      ['Plan your first social post', 'เริ่มวางแผน social media ครั้งแรก'],
      ['Period', 'ช่วงเวลา'],
      ['On time', 'ตรงเวลา'],
      ['Today', 'วันนี้'],
      ['Leaderboard', 'อันดับผลงาน'],
      ['Completed tasks', 'งานที่ทำเสร็จ'],
      ['Total done', 'ผลงานรวม (เสร็จ)'],
      ['On-time (team)', 'งานตรงเวลา (ทีม)'],
      ['Completion rate (team)', 'Completion rate (ทีม)'],
      ['Team KPI (vs target)', 'KPI ทีม (เทียบเป้าหมาย)'],
      ['Data sources', 'แหล่งข้อมูล'],
      ['Posts/month', 'โพสต์/เดือน'],
      ['Published posts/person/month', 'โพสต์เผยแพร่/คน/เดือน'],
      ['System', 'ระบบ'],
      ['Other', 'อื่นๆ'],
      ['Article', 'บทความ'],
      ['Photo', 'ภาพถ่าย'],
      ['Video', 'วิดีโอ'],
      ['Graphic', 'กราฟิก'],
      ['Website', 'เว็บไซต์'],
      ['Campaign', 'แคมเปญ'],
      ['Social', 'โซเชียล']
      ];
   for (var xi = 0; xi < EXTRA_PAIRS.length; xi++) {
      var xen = EXTRA_PAIRS[xi][0], xth = EXTRA_PAIRS[xi][1];
      T_MAP[xen] = { en: xen, th: xth };
      T_MAP[xth] = { en: xen, th: xth };
   }

   // เดือนไทย → อังกฤษ สำหรับวันที่ที่สร้างจากการต่อสตริง
   var TH_MONTHS = { 'มกราคม':'January','กุมภาพันธ์':'February','มีนาคม':'March','เมษายน':'April','พฤษภาคม':'May','มิถุนายน':'June','กรกฎาคม':'July','สิงหาคม':'August','กันยายน':'September','ตุลาคม':'October','พฤศจิกายน':'November','ธันวาคม':'December' };
   var TH_ABBR = { 'ม.ค.':'Jan','ก.พ.':'Feb','มี.ค.':'Mar','เม.ย.':'Apr','พ.ค.':'May','มิ.ย.':'Jun','ก.ค.':'Jul','ส.ค.':'Aug','ก.ย.':'Sep','ต.ค.':'Oct','พ.ย.':'Nov','ธ.ค.':'Dec' };
   var PREFIX_RULES = [ [/^เป้า\s*/, 'Target '] ];

   // แทน tr เดิม — ตัวดัก React เรียก tr ตอนทำงาน จึงได้ตัวใหม่โดยอัตโนมัติ
   var baseTr = tr;
   tr = function (s) {
      if (typeof s !== 'string') return s;
      var out = baseTr(s);
      if (out !== s) return out;
      var t = s.trim();
      if (LANG === 'en') {
         for (var ri = 0; ri < PREFIX_RULES.length; ri++) {
            if (PREFIX_RULES[ri][0].test(t)) return t.replace(PREFIX_RULES[ri][0], PREFIX_RULES[ri][1]);
         }
         var d = t;
         for (var mk in TH_MONTHS) if (d.indexOf(mk) !== -1) d = d.split(mk).join(TH_MONTHS[mk]);
         for (var ak in TH_ABBR) if (d.indexOf(ak) !== -1) d = d.split(ak).join(TH_ABBR[ak]);
         d = d.replace(/\sน\.$/, '');
         if (d !== t) return d;
      }
      return s;
   };

   // แปลข้อความที่ส่งผ่าน props ด้วย (title / subtitle / label / placeholder)
   if (React && !React.__laI18nProps) {
      var prevCreate2 = React.createElement;
      var TR_PROPS = ['title', 'subtitle', 'label', 'placeholder'];
      React.createElement = function (type, props) {
         var args = Array.prototype.slice.call(arguments);
         if (args[1] && typeof args[1] === 'object') {
            var changed = null;
            for (var pi2 = 0; pi2 < TR_PROPS.length; pi2++) {
               var key = TR_PROPS[pi2], nv = tr(args[1][key]);
               if (nv !== args[1][key]) { changed = changed || Object.assign({}, args[1]); changed[key] = nv; }
            }
            if (changed) args[1] = changed;
         }
         return prevCreate2.apply(this, args);
      };
      React.__laI18nProps = true;
   }

   // ชื่อสถานะและหมวดเก็บในตัวแปร ต้องแปลที่ต้นทาง
   if (window.STATUS_META) Object.keys(window.STATUS_META).forEach(function (k) {
      var s = window.STATUS_META[k];
      if (s && s.label) s.label = tr(s.label);
   });
   if (window.CATEGORIES) window.CATEGORIES.forEach(function (c) { if (c && c.name) c.name = tr(c.name); });

   // หน่วยเวลาไทย "น." — ถูกส่งมาแยกจากตัวเลขเวลา ต้องจัดการแยก
   var prevTr2 = tr;
      tr = function (s) { if (LANG === 'en' && typeof s === 'string' && s.trim() === '\u0E19.') return ''; return prevTr2(s); };

   // ===== 12. ปุ่ม Back / Forward ของเบราว์เซอร์ =====
   // แอปเดิมสลับหน้าโดย URL ไม่เปลี่ยน กด Back จึงหลุดออกจากเว็บ
   // ที่นี่เพิ่ม #ชื่อหน้า ทำให้ Back / Forward / รีเฟรช / ส่งลิงก์ ใช้งานได้
   var VIEW_SLUGS = [
      ['dashboard', ['Dashboard', 'ภาพรวม']],
      ['tracking', ['Tracking', 'ติดตามงาน']],
      ['planning', ['Planning Post', 'วางแผนโพสต์']],
      ['pr', ['Public Relations Jobs', 'งานประชาสัมพันธ์']],
      ['report', ['Report', 'รายงาน']],
      ['history', ['Work History', 'ประวัติการทำงาน']]
      ];
   function slugOfLabel(label) {
      var t = String(label || '').trim();
      for (var si = 0; si < VIEW_SLUGS.length; si++) {
         if (VIEW_SLUGS[si][1].indexOf(t) !== -1) return VIEW_SLUGS[si][0];
      }
      return null;
   }
   function navElBySlug(slug) {
      var names = null;
      for (var si = 0; si < VIEW_SLUGS.length; si++) if (VIEW_SLUGS[si][0] === slug) names = VIEW_SLUGS[si][1];
      if (!names) return null;
      var all = document.querySelectorAll('*');
      for (var i = 0; i < all.length; i++) {
         if (all[i].children.length === 0 && names.indexOf((all[i].textContent || '').trim()) !== -1) return all[i];
      }
      return null;
   }

   var navSuppress = false;
   var prevNavItem = window.NavItem;
   window.NavItem = function (p) {
      var slug = slugOfLabel(p.label);
      var q = Object.assign({}, p);
      if (slug && p.onClick) {
         q.onClick = function () {
            if (!navSuppress && location.hash !== '#' + slug) history.pushState({ v: slug }, '', '#' + slug);
            return p.onClick.apply(this, arguments);
         };
      }
      return prevNavItem(q);
   };

   function gotoHash() {
      var slug = (location.hash || '#dashboard').slice(1);
      var el = navElBySlug(slug);
      if (!el) return;
      navSuppress = true;
      el.click();
      setTimeout(function () { navSuppress = false; }, 300);
   }
   window.addEventListener('popstate', gotoHash);
   // เปิดลิงก์ตรงหน้า หรือรีเฟรชแล้วให้อยู่หน้าเดิม
   if (location.hash && location.hash !== '#dashboard') setTimeout(gotoHash, 600);

   // ===== 13. หน้าล็อกอิน — ตัวการ์ตูนตามองตามเมาส์ =====
   // วาดเองทั้งหมดเป็น SVG ไม่ดึงรูปจากที่อื่น จึงไม่มีปัญหาลิขสิทธิ์
   var faceCss = document.createElement('style');
   faceCss.id = 'la-face-css';
   faceCss.textContent = [
      '#la-login{background:linear-gradient(160deg,#EEF2FF 0%,#F5F3FB 45%,#FCE7F3 100%) !important}',
      '#la-login .card{background:rgba(255,255,255,.78) !important;backdrop-filter:blur(14px);',
      'border:1px solid rgba(255,255,255,.9) !important;border-radius:22px !important;',
      'box-shadow:0 18px 50px rgba(79,70,229,.13) !important}',
      '#la-login input:focus{border-color:#6366F1 !important;box-shadow:0 0 0 3px rgba(99,102,241,.16) !important}',
      '#la-login button{background:#6366F1 !important;border-radius:12px !important}',
      '#la-login button:hover{background:#4F46E5 !important}',
      '#la-login .swap a{color:#4F46E5 !important}',
      '#la-face-wrap{position:relative;width:200px;height:135px;margin:0 auto 16px}',
      '#la-face-wrap .eye{position:absolute;overflow:hidden;display:flex;align-items:flex-end;',
      'justify-content:center;transition:all .15s ease}',
      '#la-face-wrap .pupil{background:#1E1B4B;border-radius:50%;width:15px;height:15px;',
      'margin-bottom:4px;transition:transform .08s linear}'
      ].join('');
   if (!document.getElementById('la-face-css')) document.head.appendChild(faceCss);

      var FACE_HTML = '<div id="la-face-wrap">'
   + '<svg viewBox="0 0 200 135" style="width:200px;height:135px;display:block">'
   + '<defs><linearGradient id="laFaceG" x1="0" y1="0" x2="0.4" y2="1">'
   + '<stop offset="0%" stop-color="#C7BDFB"/><stop offset="45%" stop-color="#8B5CF6"/>'
   + '<stop offset="100%" stop-color="#7C3AED"/></linearGradient></defs>'
   + '<g fill="url(#laFaceG)">'
   + '<circle cx="66" cy="66" r="33"/>'
   + '<circle cx="103" cy="48" r="39"/>'
   + '<circle cx="141" cy="66" r="31"/>'
   + '<circle cx="52" cy="86" r="25"/>'
   + '<circle cx="154" cy="88" r="23"/>'
   + '<rect x="27" y="72" width="148" height="36" rx="18"/>'
   + '</g></svg>'
   + '<div class="eye" data-eye="l"></div><div class="eye" data-eye="r"></div></div>';

   function setEye(el, closed) {
            el.style.position = 'absolute';
      el.style.top = '44px';
      el.style.left = (el.dataset.eye === 'l' ? 72 : 112) + 'px';
      el.style.width = '30px';
      el.style.height = closed ? '5px' : '52px';
      el.style.borderRadius = closed ? '3px' : '50% / 45%';
      el.style.background = closed ? '#1E1B4B' : '#fff';
   }

   function mountFace() {
      var card = document.querySelector('#la-login .card');
      if (!card || card.querySelector('#la-face-wrap')) return;
      card.insertAdjacentHTML('afterbegin', FACE_HTML);
      var eyes = card.querySelectorAll('.eye');
      for (var i = 0; i < eyes.length; i++) { eyes[i].innerHTML = '<div class="pupil"></div>'; setEye(eyes[i], false); }
      var typing = false, blinking = false;
      function paint() { for (var j = 0; j < eyes.length; j++) setEye(eyes[j], typing || blinking); }
      document.addEventListener('mousemove', function (ev) {
         var dx = ((ev.clientX / window.innerWidth) - 0.5) * 16;
         var ps = card.querySelectorAll('.pupil');
         for (var k = 0; k < ps.length; k++) ps[k].style.transform = 'translateX(' + dx.toFixed(1) + 'px)';
      });
      setInterval(function () { blinking = true; paint(); setTimeout(function () { blinking = false; paint(); }, 170); }, 3200);
      var pw = card.querySelectorAll('input[type=password]');
      for (var m = 0; m < pw.length; m++) {
         pw[m].addEventListener('focus', function () { typing = true; paint(); });
         pw[m].addEventListener('blur', function () { typing = false; paint(); });
      }
   }
   mountFace();
   setInterval(mountFace, 600);

   // ===== 14. ใช้ชื่อบริษัทจริงแทนคำว่า Marketing Team =====
   // แอปเดิมเขียนชื่อนี้ตายตัว ลูกค้าทุกรายจึงเห็นชื่อเดียวกันหมด
   var BRAND_NAME = '';
   var brandLoading = false;
   function loadBrand() {
      if (BRAND_NAME || brandLoading) return;
      if (!window.laToken || !window.LA_CONFIG) return;
      var t;
      try { t = window.laToken(); } catch (err) { return; }
      if (!t) return;
      brandLoading = true;
      fetch(window.LA_CONFIG.api + '/orgs?select=name', { headers: { Authorization: 'Bearer ' + t } })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d && d[0] && d[0].name) BRAND_NAME = d[0].name; brandLoading = false; })
      .catch(function () { brandLoading = false; });
   }
   setInterval(function () {
      loadBrand();
      if (!BRAND_NAME) return;
      var els = document.querySelectorAll('[data-la-logo] .la-brand');
      for (var bi = 0; bi < els.length; bi++) {
         if (els[bi].textContent !== BRAND_NAME) els[bi].textContent = BRAND_NAME;
      }
      // การ์ดทีมด้านล่างก็เขียนชื่อนี้ตายตัวเช่นกัน
      var all = document.querySelectorAll('div.text-xs.font-semibold');
      for (var ai = 0; ai < all.length; ai++) {
         if ((all[ai].textContent || '').trim() === 'Marketing Team') all[ai].textContent = BRAND_NAME;
      }
   }, 800);

   // ===== 15. ย้ายเมนูจากแถบซ้ายขึ้นมาด้านบน =====
   // ทำด้วย CSS ล้วน ไม่แก้โครง JSX จึงไม่กระทบการทำงาน
   // มีผลเฉพาะจอกว้าง 1024px ขึ้นไป — มือถือยังเป็นเมนูสไลด์เหมือนเดิม
   var topCss = document.createElement('style');
   topCss.id = 'la-topnav';
   topCss.textContent = [
            '@media (min-width:1024px){',
      'aside.fixed.left-0{top:12px !important;left:12px !important;right:12px !important;bottom:auto !important;',
      'width:auto !important;height:76px !important;flex-direction:row !important;align-items:center !important;',
      'gap:12px;border-radius:20px !important;padding:0 18px !important;overflow:visible !important}',
      'aside.fixed.left-0 > div:nth-child(1){padding:0 !important;flex:0 0 auto !important;max-width:210px}',
      'aside.fixed.left-0 > div:nth-child(1) .la-brand{font-size:14px !important;line-height:1.2 !important}',
      'aside.fixed.left-0 > div:nth-child(2){padding:0 !important;margin:0 !important;flex:0 0 auto !important;width:170px !important}',
      'aside.fixed.left-0 > div:nth-child(2) > div:first-child{display:none !important}',
      'aside.fixed.left-0 > div:nth-child(2) button{height:40px !important}',
      'aside.fixed.left-0 > nav{flex:1 1 auto !important;min-width:0 !important;display:flex !important;',
      'flex-direction:row !important;align-items:center;gap:2px;padding:0 !important;margin:0 !important;',
      'overflow-x:auto !important;overflow-y:visible !important}',
      'aside.fixed.left-0 > nav > *{margin:0 !important}',
      'aside.fixed.left-0 > nav button{width:auto !important;white-space:nowrap;padding:8px 10px !important;font-size:13px !important}',
      'aside.fixed.left-0 > nav button > span:first-child{width:30px !important;height:30px !important}',
      'aside.fixed.left-0 > nav > div{display:none !important}',
      'aside.fixed.left-0 > div:nth-child(4){padding:0 !important;flex:0 0 auto !important}',
      'aside.fixed.left-0 > div:nth-child(4) button{flex-direction:row !important;gap:8px;height:40px !important;',
      'padding:0 14px !important;border-radius:14px !important;align-items:center;justify-content:center;font-size:12px !important}',
      'aside.fixed.left-0 > div:nth-child(4) button > *:first-child{width:22px !important;height:22px !important;margin:0 !important}',
      'aside.fixed.left-0 > div:nth-child(5){padding:0 !important;flex:0 0 auto !important;width:auto !important}',
      'aside.fixed.left-0 > div:nth-child(5) > *{background:transparent !important;border:0 !important;box-shadow:none !important;padding:0 !important;height:auto !important}',
      'aside.fixed.left-0 > div:nth-child(5) .min-w-0{display:none !important}',
      'aside.fixed.left-0 > div:nth-child(5) svg{display:none !important}',
      'aside.fixed.left-0 > div:nth-child(6){padding:0 !important;flex:0 0 auto !important}',
      'aside.fixed.left-0 > div:nth-child(6) button{padding:9px 12px !important;font-size:13px !important}',
      '[class*="lg:ml-[16.25rem]"]{margin-left:0 !important;padding-top:100px !important}',
      'aside.fixed.right-0{top:104px !important}',
      'aside.fixed.left-0{gap:8px !important;padding:0 14px !important}',
      'aside.fixed.left-0 > div:nth-child(1){max-width:170px !important}',
      'aside.fixed.left-0 > div:nth-child(1) .la-brand{font-size:13px !important}',
            'aside.fixed.left-0 > div:nth-child(2){width:230px !important}',
      'aside.fixed.left-0 > div:nth-child(2) > button{font-size:13px !important}',
      'aside.fixed.left-0 > div:nth-child(2) > button span{overflow:visible !important;text-overflow:clip !important}',
      'aside.fixed.left-0 > div:nth-child(2) > div.absolute{left:0 !important;right:auto !important;min-width:250px !important;width:max-content !important}',
      'aside.fixed.left-0 > div:nth-child(2) > div.absolute button{white-space:nowrap !important}',
      'aside.fixed.left-0 > div:nth-child(2) > div.absolute button span{overflow:visible !important;text-overflow:clip !important}',
      'aside.fixed.left-0 > nav button{padding:8px 8px !important;font-size:12.5px !important}',
      'aside.fixed.left-0 > nav button > span:first-child{width:26px !important;height:26px !important}',
      'aside.fixed.left-0 > div:nth-child(4) button{padding:0 12px !important;font-size:11.5px !important}',
      'aside.fixed.left-0 > div:nth-child(6) button span{display:none !important}',
      '}'
      ].join('');
   if (!document.getElementById('la-topnav')) document.head.appendChild(topCss);

   // ===== 16. จานสีสมาชิกทีม — 16 สีไม่ซ้ำ =====
   // ก่อนหน้านี้การจับคู่สีเก่าทำให้หลายสีกลายเป็นสีเดียวกัน เหลือจริงแค่ 7 สี
   var TEAM_COLORS_16 = [
      '#6366F1', '#8B5CF6', '#A78BFA', '#EC4899',
      '#F472B6', '#F59E0B', '#FB923C', '#FACC15',
      '#2BD4B7', '#10B981', '#34D399', '#0EA5E9',
      '#38BDF8', '#4A95F6', '#6B73EB', '#64748B'
      ];
   if (window.TEAM_COLOR_PALETTE) {
      for (var ci = 0; ci < window.TEAM_COLOR_PALETTE.length && ci < TEAM_COLORS_16.length; ci++) {
         window.TEAM_COLOR_PALETTE[ci] = TEAM_COLORS_16[ci];
      }
   }

   // ===== 17. รูปโปรไฟล์สมาชิกทีม + ระยะเมนูหายใจ =====
   var spaceCss = document.createElement('style');
   spaceCss.id = 'la-nav-space';
   spaceCss.textContent = [
      '@media (min-width:1024px){',
      'aside.fixed.left-0 > nav{gap:10px !important}',
      'aside.fixed.left-0 > nav button{padding:8px 14px !important;font-size:13px !important}',
      'aside.fixed.left-0 > nav button > span:first-child{width:28px !important;height:28px !important;margin-right:2px}',
      '}',
      '.la-photo-wrap{position:relative;display:inline-flex}',
      '.la-photo-btn{position:absolute;right:-4px;bottom:-4px;width:20px;height:20px;border-radius:50%;',
      'background:#4F46E5;color:#fff;font-size:11px;line-height:20px;text-align:center;cursor:pointer;',
      'border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.2);z-index:5}'
      ].join('');
   if (!document.getElementById('la-nav-space')) document.head.appendChild(spaceCss);

   window.__laAvatars = {};
   function loadAvatars() {
      if (!window.laToken || !window.LA_CONFIG) return;
      var t;
      try { t = window.laToken(); } catch (err) { return; }
      if (!t) return;
      fetch(window.LA_CONFIG.api + '/team_members?select=id,name,avatar', { headers: { Authorization: 'Bearer ' + t } })
      .then(function (r) { return r.json(); })
      .then(function (d) {
         var m = {};
         (d || []).forEach(function (x) { if (x.avatar) m[x.name] = x.avatar; m['#id:' + x.name] = x.id; });
         window.__laAvatars = m;
      })
      .catch(function () {});
   }
   loadAvatars();
   setInterval(loadAvatars, 20000);

   // แสดงรูปแทนวงกลมสีเมื่อสมาชิกมีรูป
   var prevAvatar = window.Avatar;
   window.Avatar = function (p) {
      var src = p && p.name ? window.__laAvatars[p.name] : null;
      if (!src) return prevAvatar(p);
      var size = (p && p.size) || 28;
      return e('div', {
         title: p.name,
         style: {
            width: size, height: size, borderRadius: '50%', overflow: 'hidden', flex: 'none',
            backgroundImage: 'url(' + src + ')', backgroundSize: 'cover', backgroundPosition: 'center',
            boxShadow: p && p.ring ? '0 0 0 2px ' + p.ring : 'none'
         }
      });
   };

   // เลือกไฟล์ ย่อเป็น 128px แล้วบันทึก
   window.__laPickAvatar = function (name) {
      var id = window.__laAvatars['#id:' + name];
      if (!id) { alert('ยังไม่พบสมาชิกนี้ กดบันทึกก่อน'); return; }
      var inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'image/*';
      inp.onchange = function () {
         var f = inp.files && inp.files[0];
         if (!f) return;
         var img = new Image();
         img.onload = function () {
            var c = document.createElement('canvas');
            c.width = 128; c.height = 128;
            var g = c.getContext('2d');
            var s = Math.min(img.width, img.height);
            g.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 128, 128);
            var url = c.toDataURL('image/jpeg', 0.82);
            if (url.length > 60000) { alert('รูปใหญ่เกินไป ลองรูปอื่น'); return; }
            fetch(window.LA_CONFIG.api + '/team_members?id=eq.' + id, {
               method: 'PATCH',
               headers: { Authorization: 'Bearer ' + window.laToken(), 'Content-Type': 'application/json' },
               body: JSON.stringify({ avatar: url })
            }).then(function (r) {
               if (r.ok) { window.__laAvatars[name] = url; alert('บันทึกรูปแล้ว'); }
               else alert('บันทึกไม่สำเร็จ (' + r.status + ')');
            });
         };
         img.src = URL.createObjectURL(f);
      };
      inp.click();
   };

   // ใส่ปุ่ม + ที่วงกลมสีในหน้าจัดการทีม (กดวงกลมเดิมยังเปลี่ยนสีได้)
   function addPhotoButtons() {
      var rows = document.querySelectorAll('div.flex.items-center');
      for (var ri = 0; ri < rows.length; ri++) {
         var row = rows[ri];
         if (row.dataset.laPhoto) continue;
         var det = row.querySelector('details');
         var inp2 = row.querySelector('input');
         if (!det || !inp2) continue;
         var nm = (inp2.value || '').trim();
         if (!nm || !window.__laAvatars['#id:' + nm]) continue;
         row.dataset.laPhoto = '1';
         var wrap = document.createElement('span');
         wrap.className = 'la-photo-wrap';
         det.parentNode.insertBefore(wrap, det);
         wrap.appendChild(det);
         var b = document.createElement('span');
         b.className = 'la-photo-btn';
         b.textContent = '+';
         b.title = 'เปลี่ยนรูปโปรไฟล์';
         (function (n) {
            b.onclick = function (ev) { ev.preventDefault(); ev.stopPropagation(); window.__laPickAvatar(n); };
         })(nm);
         wrap.appendChild(b);
      }
   }
      // ===== 18. บังคับวาดหน้าใหม่ตอนเปิดครั้งแรก =====
      // ไฟล์นี้โหลดหลังแอปวาดเสร็จ การเขียนทับ component จึงยังไม่มีผลจนกว่าจะวาดรอบถัดไป
      // ที่นี่สลับเมนูไปกลับหนึ่งครั้งเพื่อให้วาดใหม่ด้วยธีมที่ถูกต้อง
      function forceRepaint() {
         var labels = ['Dashboard', 'ภาพรวม'];
         var other = ['Tracking', 'ติดตามงาน'];
         function byText(list) {
            var all = document.querySelectorAll('*');
            for (var i = 0; i < all.length; i++) {
               if (all[i].children.length === 0 && list.indexOf((all[i].textContent || '').trim()) !== -1) return all[i];
            }
            return null;
         }
         var a = byText(other), b2 = byText(labels);
         if (!a || !b2) return false;
         navSuppress = true;
         a.click();
         setTimeout(function () {
            b2.click();
            setTimeout(function () { navSuppress = false; }, 300);
         }, 60);
         return true;
      }
      var repaintTries = 0;
      var repaintTimer = setInterval(function () {
         repaintTries++;
         if (repaintTries > 20) { clearInterval(repaintTimer); return; }
         if (document.querySelector('#la-login')) return;
         if (forceRepaint()) clearInterval(repaintTimer);
      }, 400);
   // เลิกใช้ addPhotoButtons — การย้าย DOM ที่ React เป็นเจ้าของทำให้ปุ่มซ้ำจนค้าง

      // ===== 19. ปุ่มเปลี่ยนรูป — สร้างผ่าน React ไม่แตะ DOM =====
      // วิธีเดิมแทรกปุ่มด้วย DOM ทุกครั้งที่ React วาดใหม่ ปุ่มจึงซ้ำสะสมจนหน้าค้าง
      if (React && !React.__laPhotoHook) {
         var prevCE3 = React.createElement;
         React.createElement = function (type, props) {
            var args = Array.prototype.slice.call(arguments);
            if (type === 'div' && props && typeof props.className === 'string'
                && props.className.indexOf('p-2.5 rounded-lg border') !== -1) {
               var nm2 = null;
               for (var qi = 2; qi < args.length; qi++) {
                  var ch = args[qi];
                  if (ch && ch.type === 'input' && ch.props && typeof ch.props.value === 'string') nm2 = ch.props.value.trim();
               }
               if (nm2 && window.__laAvatars['#id:' + nm2]) {
                  args.push(prevCE3('button', {
                     key: 'la-photo',
                     type: 'button',
                     title: 'เปลี่ยนรูปโปรไฟล์',
                     onClick: (function (n) {
                        return function (ev) { ev.preventDefault(); window.__laPickAvatar(n); };
                     })(nm2),
                     style: {
                        flex: 'none', padding: '6px 10px', borderRadius: '10px', fontSize: '12px',
                        background: '#EEF2FF', color: '#4F46E5', fontWeight: 600, whiteSpace: 'nowrap'
                     }
                  }, 'รูป'));
               }
            }
            return prevCE3.apply(this, args);
         };
         React.__laPhotoHook = true;
      }


   // ===== 20. ตัวเลือกรูปรุ่นแก้ — บอกสาเหตุทุกกรณีที่ล้มเหลว =====
   // ตัวเดิมไม่มี onerror ถ้าเบราว์เซอร์อ่านไฟล์ไม่ได้ (เช่น HEIC จาก iPhone) จะเงียบสนิท
   window.__laPickAvatar = function (name) {
      var id = window.__laAvatars['#id:' + name];
      if (!id) { alert('ยังไม่พบสมาชิกนี้ กดบันทึกก่อน'); return; }
      var inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'image/jpeg,image/png,image/webp';
      inp.onchange = function () {
         var f = inp.files && inp.files[0];
         if (!f) return;
         var nameLower = (f.name || '').toLowerCase();
         if (/\.(heic|heif)$/.test(nameLower)) {
            alert('ไฟล์ HEIC จาก iPhone เปิดในเบราว์เซอร์ไม่ได้\n\nวิธีแก้ — เปิดรูปในแอป Photos กดแชร์ → Save to Files หรือตั้งกล้องเป็น Most Compatible');
            return;
         }
         var url0 = URL.createObjectURL(f);
         var img = new Image();
         img.onerror = function () {
            URL.revokeObjectURL(url0);
            alert('เปิดไฟล์นี้ไม่ได้ (' + (f.type || 'ไม่ทราบชนิด') + ')\n\nรองรับ JPG PNG และ WEBP เท่านั้น');
         };
         img.onload = function () {
            try {
               var c = document.createElement('canvas');
               c.width = 128; c.height = 128;
               var g = c.getContext('2d');
               var s = Math.min(img.width, img.height);
               g.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 128, 128);
               var url = c.toDataURL('image/jpeg', 0.82);
               URL.revokeObjectURL(url0);
               if (url.length > 60000) { alert('รูปใหญ่เกินไป ลองรูปอื่น'); return; }
               saveAvatar(name, id, url);
            } catch (err) {
               alert('ย่อรูปไม่สำเร็จ: ' + err.message);
            }
         };
         img.src = url0;
      };
      inp.click();
   };

   function saveAvatar(name, id, url) {
      fetch(window.LA_CONFIG.api + '/team_members?id=eq.' + id, {
         method: 'PATCH',
         headers: { Authorization: 'Bearer ' + window.laToken(), 'Content-Type': 'application/json' },
         body: JSON.stringify({ avatar: url })
      })
      .then(function (r) {
         if (!r.ok) { return r.text().then(function (t) { throw new Error(r.status + ' ' + t.slice(0, 120)); }); }
         window.__laAvatars[name] = url;
         forceRepaint();
         alert('บันทึกรูปของ ' + name + ' แล้ว');
      })
      .catch(function (err) {
         alert('บันทึกไม่สำเร็จ\n\n' + err.message);
      });
   }
   
      // (วงเล็บปิดถูกย้ายขึ้นไปปิด addPhotoButtons ด้านบนแล้ว)
      // ปิดตัวเดิมทิ้ง — ใช้ส่วนที่ 19 ที่สร้างปุ่มผ่าน React แทน

   // ===== 21. ตัวเลือกรูปรุ่นสุดท้าย — อ่านไฟล์เป็น data: แทน blob: =====
   // สาเหตุที่รูป JPEG ปกติเปิดไม่ได้ — หน้านี้ตั้ง img-src ไว้เป็น 'self' data: https:
   // ไม่มี blob: ลิงก์จาก URL.createObjectURL จึงถูกบล็อกทุกครั้ง
   window.__laPickAvatar = function (name) {
      var id = window.__laAvatars['#id:' + name];
      if (!id) { alert('ยังไม่พบสมาชิกนี้ กดบันทึกก่อน'); return; }
      var inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'image/jpeg,image/png,image/webp';
      inp.onchange = function () {
         var f = inp.files && inp.files[0];
         if (!f) return;
         var low = (f.name || '').toLowerCase();
         if (/\.(heic|heif)$/.test(low)) {
            alert('ไฟล์ HEIC จาก iPhone เปิดในเบราว์เซอร์ไม่ได้\n\nเปิดรูปในแอป Photos กดแชร์ → Save to Files ก่อน');
            return;
         }
         var fr = new FileReader();
         fr.onerror = function () { alert('อ่านไฟล์ไม่สำเร็จ ลองเลือกไฟล์อื่น'); };
         fr.onload = function () {
            var img = new Image();
            img.onerror = function () {
               alert('เปิดไฟล์นี้ไม่ได้ (' + (f.type || 'ไม่ทราบชนิด') + ')\n\nรองรับ JPG PNG WEBP');
            };
            img.onload = function () {
               try {
                  var c = document.createElement('canvas');
                  c.width = 128; c.height = 128;
                  var g = c.getContext('2d');
                  var s = Math.min(img.width, img.height);
                  g.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 128, 128);
                  var out = c.toDataURL('image/jpeg', 0.82);
                  if (out.length > 60000) { alert('รูปใหญ่เกินไป ลองรูปอื่น'); return; }
                  saveAvatar(name, id, out);
               } catch (err) { alert('ย่อรูปไม่สำเร็จ: ' + err.message); }
            };
            img.src = fr.result;
         };
         fr.readAsDataURL(f);
      };
      inp.click();
   };

   // ===== 22. วงกลมในหน้าจัดการทีมให้แสดงรูปด้วย =====
   // เดิมรูปขึ้นเฉพาะที่อื่น แต่ในหน้านี้เป็น summary ของตัวเลือกสี จึงต้องใส่รูปแยก
   if (React && !React.__laSummaryPhoto) {
      var prevCE4 = React.createElement;
      React.createElement = function (type, props) {
         var args = Array.prototype.slice.call(arguments);
         if (type === 'div' && props && typeof props.className === 'string'
             && props.className.indexOf('p-2.5 rounded-lg border') !== -1) {
            var nm3 = null;
            for (var si = 2; si < args.length; si++) {
               var cc2 = args[si];
               if (cc2 && cc2.type === 'input' && cc2.props && typeof cc2.props.value === 'string') nm3 = cc2.props.value.trim();
            }
            var src2 = nm3 && window.__laAvatars[nm3];
            if (src2) {
               for (var di = 2; di < args.length; di++) {
                  var dd = args[di];
                  if (dd && dd.type === 'details') {
                     var kids2 = React.Children.toArray(dd.props.children).map(function (k) {
                        if (k && k.type === 'summary') {
                           return prevCE4('summary', Object.assign({}, k.props, {
                              style: Object.assign({}, k.props.style, {
                                 backgroundImage: 'url(' + src2 + ')',
                                 backgroundSize: 'cover',
                                 backgroundPosition: 'center',
                                 color: 'transparent'
                              })
                           }), null);
                        }
                        return k;
                     });
                     args[di] = prevCE4('details', dd.props, kids2);
                  }
               }
            }
         }
         return prevCE4.apply(this, args);
      };
      React.__laSummaryPhoto = true;
   }

   // ===== 23. Favicon — โลโก้ดอกไม้ชุดเดียวกับในระบบ =====
   // เดิมไม่มีเลย แท็บจึงเป็นไอคอนเปล่าของเบราว์เซอร์ ใช้ SVG ฝังในโค้ดจึงไม่ต้องเพิ่มไฟล์
   var faviconSvg = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">',
      '<circle cx="50" cy="28" r="19" fill="#8B5CF6"/>',
      '<circle cx="71" cy="43" r="19" fill="#EC4899"/>',
      '<circle cx="63" cy="69" r="19" fill="#F472B6"/>',
      '<circle cx="37" cy="69" r="19" fill="#38BDF8"/>',
      '<circle cx="29" cy="43" r="19" fill="#A78BFA"/>',
      '<circle cx="50" cy="50" r="13" fill="#F5F3FF"/>',
      '</svg>'
      ].join('');
   function setFavicon() {
      if (document.getElementById('la-favicon')) return;
      var old = document.querySelectorAll("link[rel*='icon']");
      for (var fi = 0; fi < old.length; fi++) old[fi].parentNode.removeChild(old[fi]);
      var lk = document.createElement('link');
      lk.id = 'la-favicon';
      lk.rel = 'icon';
      lk.type = 'image/svg+xml';
      lk.href = 'data:image/svg+xml,' + encodeURIComponent(faviconSvg);
      document.head.appendChild(lk);
   }
   setFavicon();
   setInterval(setFavicon, 3000);

   // ===== 24. Dark Mode =====
   // สีเกือบทั้งหมดมาจาก inline style ไม่ใช่คลาส จึงเขียนทับด้วย CSS ไม่ได้
   // ต้องแปลงสีตอน React วาด — เก็บสีเน้นไว้ ทำเฉพาะพื้นสว่างกับตัวหนังสือเข้ม
   function laHsl(c) {
      var m = String(c).match(/#([0-9a-f]{3,8})/i), r, g, b;
      if (m) {
         var h0 = m[1];
         if (h0.length === 3) h0 = h0.split('').map(function (x) { return x + x; }).join('');
         r = parseInt(h0.slice(0, 2), 16); g = parseInt(h0.slice(2, 4), 16); b = parseInt(h0.slice(4, 6), 16);
      } else {
         m = String(c).match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
         if (!m) return null;
         r = +m[1]; g = +m[2]; b = +m[3];
      }
      r /= 255; g /= 255; b /= 255;
      var mx = Math.max(r, g, b), mn = Math.min(r, g, b), h = 0, s = 0, l = (mx + mn) / 2;
      if (mx !== mn) {
         var d = mx - mn;
         s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
         h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
         h /= 6;
      }
      return { h: h * 360, s: s, l: l };
   }
   function laHS(h, s, l) { return 'hsl(' + h.toFixed(0) + ',' + (s * 100).toFixed(0) + '%,' + (l * 100).toFixed(0) + '%)'; }
   function laDarkBg(c) {
      var x = laHsl(c);
      if (!x) return c;
      if (x.s > 0.45 && x.l > 0.30 && x.l < 0.72) return c;
      if (x.l > 0.82) return laHS(x.h, Math.min(x.s, 0.22), 0.13 + (1 - x.l) * 0.5);
      if (x.l > 0.60) return laHS(x.h, Math.min(x.s, 0.32), 0.22);
      return c;
   }
   function laDarkText(c) {
      var x = laHsl(c);
      if (!x) return c;
      if (x.l < 0.35) return laHS(x.h, Math.min(x.s, 0.22), 0.88);
      if (x.l < 0.62) return laHS(x.h, Math.min(x.s, 0.45), 0.72);
      return c;
   }
   function laDarkBorder(c) {
      var x = laHsl(c);
      if (!x) return c;
      return x.l > 0.70 ? laHS(x.h, Math.min(x.s, 0.22), 0.24) : c;
   }
   function laMapBg(v) {
      var s = String(v);
      if (/gradient/i.test(s)) {
         var cols = s.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g) || [];
         if (!cols.length) return s;
         var L = 0, S = 0, n = 0;
         cols.forEach(function (c) { var x = laHsl(c); if (x) { L += x.l; S += x.s; n++; } });
         if (!n) return s;
         if ((L / n) > 0.82 && (S / n) < 0.5) return s.replace(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g, laDarkBg);
         return s;
      }
      return laDarkBg(s);
   }

   var DARK_ON = false;
   try { DARK_ON = localStorage.getItem('la_dark') === '1'; } catch (err) {}
   window.__laDark = DARK_ON;

   if (React && !React.__laDarkHook) {
      var prevCE5 = React.createElement;
      React.createElement = function (type, props) {
         var a = Array.prototype.slice.call(arguments);
         if (window.__laDark && a[1] && a[1].style && typeof a[1].style === 'object') {
            var s = a[1].style, ns = Object.assign({}, s), ch = false, v;
            if (s.background) { v = laMapBg(s.background); if (v !== s.background) { ns.background = v; ch = true; } }
            if (s.backgroundColor) { v = laMapBg(s.backgroundColor); if (v !== s.backgroundColor) { ns.backgroundColor = v; ch = true; } }
            if (s.color) { v = laDarkText(s.color); if (v !== s.color) { ns.color = v; ch = true; } }
            if (s.borderColor) { v = laDarkBorder(s.borderColor); if (v !== s.borderColor) { ns.borderColor = v; ch = true; } }
            var bgv = ns.background || ns.backgroundColor;
            if (bgv && ns.color && !/gradient/i.test(String(bgv))) {
               var xb = laHsl(bgv), xc = laHsl(ns.color);
               if (xb && xc && Math.abs(xb.l - xc.l) < 0.34) {
                  ns.color = laHS(xc.h, Math.min(xc.s, 0.5), xb.l > 0.5 ? 0.14 : 0.88);
                  ch = true;
               }
            }
            if (ch) { var p = Object.assign({}, a[1]); p.style = ns; a[1] = p; }
         }
         return prevCE5.apply(this, a);
      };
      React.__laDarkHook = true;
   }

   var darkCss = document.createElement('style');
   darkCss.id = 'la-dark-css';
   darkCss.textContent = [
      'body.la-dark{background:#0B1020 !important;color:#E2E8F0}',
      'body.la-dark .bg-white{background:#151B2E !important}',
      'body.la-dark aside.fixed.left-0{background:#151B2E !important}',
      'body.la-dark aside.fixed.left-0 nav button{color:#CBD5E1 !important}',
      'body.la-dark aside.fixed.left-0 nav button *{color:inherit !important}',
      'body.la-dark .la-brand{color:#F1F5F9 !important}',
      'body.la-dark aside.fixed.left-0 > div:nth-child(2) button{color:#E2E8F0 !important}',
      'body.la-dark input,body.la-dark textarea,body.la-dark select{background:#1B2338 !important;color:#E2E8F0 !important;border-color:#2B3448 !important}',
      'body.la-dark input::placeholder{color:#64748B !important}',
      'body.la-dark h1,body.la-dark h2,body.la-dark h3{color:#F1F5F9 !important;-webkit-text-fill-color:#F1F5F9 !important;background-image:none !important}',
      'body.la-dark .text-gray-900,body.la-dark .text-gray-800,body.la-dark .text-gray-700{color:#E2E8F0 !important}',
      'body.la-dark .text-gray-500,body.la-dark .text-gray-400{color:#94A3B8 !important}',
      'body.la-dark .border-t,body.la-dark .border-b,body.la-dark hr{border-color:#2B3448 !important}',
      'body.la-dark .rounded-[28px] div{color:#5B21B6 !important}',
      'body.la-dark .rounded-[28px] h2{color:#3B0764 !important;-webkit-text-fill-color:#3B0764 !important}',
      'body.la-dark .rounded-[28px] button{color:#fff !important}',
      '.la-theme{display:inline-flex;align-items:center;margin-left:6px;background:transparent;border:0;cursor:pointer;font-size:15px;line-height:1;padding:4px 6px;border-radius:8px}'
      ].join('');
   if (!document.getElementById('la-dark-css')) document.head.appendChild(darkCss);
   if (DARK_ON) document.body.classList.add('la-dark');

   // ปุ่มสลับโหมด — วางต่อจากปุ่ม TH / EN
   function addThemeToggle() {
      var box = document.querySelector('.la-lang');
            if (!box || document.querySelector('.la-theme')) return;
      var b = document.createElement('button');
      b.className = 'la-theme';
      b.type = 'button';
      b.title = DARK_ON ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด';
      b.textContent = DARK_ON ? '\u2600\uFE0F' : '\uD83C\uDF19';
      b.onclick = function () {
         try { localStorage.setItem('la_dark', DARK_ON ? '0' : '1'); } catch (err) {}
         location.reload();
      };
      box.parentNode.insertBefore(b, box.nextSibling);
   }
   addThemeToggle();
   setInterval(addThemeToggle, 900);

   // ===== 25. Dark Mode ชุดสีจาก Reference =====
   // ชุดเดิมใช้สูตรคำนวณสี ผลออกมาหม่นเป็นสีน้ำตาลเขียว
   // ชุดนี้อ่านค่าสีจากภาพ Reference ที่ลูกค้าส่งมา แล้วจับคู่ทีละสี
   var RP = { PAGE:'#161C2D', CARD:'#1C2338', BAR:'#131826', INPUT:'#232B42', BORDER:'#2A3350' };
   var RBG = {
      '#FFFFFF':RP.CARD, '#F2F4FA':RP.PAGE, '#F8FAFC':RP.PAGE, '#F1F5F9':RP.INPUT, '#E2E8F0':RP.BORDER,
            '#EEF2FF':'#2B1550', '#F5F3FF':'#2B1550', '#FAF5FF':'#2B1550',
      '#F0FDF4':'#14282B', '#FFF7ED':'#311F1B',
      '#FEF2F2':'#33161F', '#FCE7F3':'#33161F',
      '#D1FAE5':RP.CARD, '#FEF3C7':RP.CARD, '#E0E7FF':RP.CARD, '#FFE4E6':RP.CARD,
      '#DBEAFE':'#152538', '#E0F2FE':'#152538'
   };
   var RFG = {
      '#0F1720':'#FFFFFF', '#111827':'#FFFFFF', '#1A1A1A':'#FFFFFF', '#000000':'#FFFFFF',
      '#334155':'#C3CAD9', '#475569':'#A9B2C4', '#64748B':'#8A93A8', '#94A3B8':'#7E8799',
      '#6366F1':'#9B7BFF', '#4F46E5':'#9B7BFF', '#6B73EB':'#9B7BFF',
      '#047857':'#34D399', '#B45309':'#F5A524', '#BE123C':'#F45B69', '#0369A1':'#4A90E2'
   };
   function rUp(c) {
      var m = String(c).match(/#([0-9a-fA-F]{6})/);
      if (m) return ('#' + m[1]).toUpperCase();
      var r = String(c).match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/);
      if (!r) return null;
      return '#' + [r[1], r[2], r[3]].map(function (x) { return (+x).toString(16).padStart(2, '0'); }).join('').toUpperCase();
   }
   function rLum(h) {
      var n = parseInt(h.slice(1), 16);
      return 0.2126 * ((n >> 16 & 255) / 255) + 0.7152 * ((n >> 8 & 255) / 255) + 0.0722 * ((n & 255) / 255);
   }
   function rBG(c) { var k = rUp(c); if (!k) return c; if (RBG[k]) return RBG[k]; return rLum(k) > 0.90 ? RP.CARD : c; }
   function rFG(c) { var k = rUp(c); if (!k) return c; if (RFG[k]) return RFG[k]; return rLum(k) < 0.22 ? '#FFFFFF' : c; }
   function rBD(c) { var k = rUp(c); if (!k) return c; return rLum(k) > 0.85 ? RP.BORDER : c; }
   function rMBG(v) {
      var s = String(v);
      if (/gradient/i.test(s)) {
         var cols = s.match(/#[0-9a-fA-F]{6}|rgba?\([^)]+\)/g) || [];
         var li = 0;
         cols.forEach(function (c) { var k = rUp(c); if (k && rLum(k) > 0.88) li++; });
         if (cols.length && li === cols.length) return s.replace(/#[0-9a-fA-F]{6}|rgba?\([^)]+\)/g, rBG);
         return s;
      }
      return rBG(s);
   }

   // ตัวดักนี้ทำงานทีหลัง จึงเขียนทับผลของชุดเก่า
   if (React && !React.__laRefDark) {
      var prevCE6 = React.createElement;
      React.createElement = function (type, props) {
         var a = Array.prototype.slice.call(arguments);
         if (window.__laDark && a[1] && a[1].style && typeof a[1].style === 'object') {
            var s = a[1].style, ns = Object.assign({}, s), ch = false, v;
            if (s.background) { v = rMBG(s.background); if (v !== s.background) { ns.background = v; ch = true; } }
            if (s.backgroundColor) { v = rMBG(s.backgroundColor); if (v !== s.backgroundColor) { ns.backgroundColor = v; ch = true; } }
            if (s.color) { v = rFG(s.color); if (v !== s.color) { ns.color = v; ch = true; } }
            if (s.borderColor) { v = rBD(s.borderColor); if (v !== s.borderColor) { ns.borderColor = v; ch = true; } }
            if (ch) { var p = Object.assign({}, a[1]); p.style = ns; a[1] = p; }
         }
         return prevCE6.apply(this, a);
      };
      React.__laRefDark = true;
   }

   var refCss = document.createElement('style');
   refCss.id = 'la-dark-ref';
   refCss.textContent = [
      'body.la-dark{background:' + RP.PAGE + ' !important;color:#E9ECF5}',
      'body.la-dark .bg-white{background:' + RP.CARD + ' !important}',
      'body.la-dark aside.fixed.left-0{background:' + RP.BAR + ' !important;border:1px solid ' + RP.BORDER + '}',
      'body.la-dark aside.fixed.left-0 nav button{color:#8A93A8 !important}',
      'body.la-dark aside.fixed.left-0 nav button *{color:inherit !important}',
      'body.la-dark .la-brand{color:#FFFFFF !important}',
      'body.la-dark aside.fixed.left-0 > div:nth-child(2) button{color:#C3CAD9 !important}',
      'body.la-dark input,body.la-dark textarea,body.la-dark select{background:' + RP.INPUT + ' !important;color:#E9ECF5 !important;border-color:' + RP.BORDER + ' !important}',
      'body.la-dark input::placeholder{color:#6B7488 !important}',
      'body.la-dark h1,body.la-dark h2,body.la-dark h3,body.la-dark h1 *,body.la-dark h2 *,body.la-dark h3 *{color:#FFFFFF !important;-webkit-text-fill-color:#FFFFFF !important;background-image:none !important}',
            'body.la-dark .rounded-\\[28px\\].p-7{background:linear-gradient(115deg,#2C0E53 0%,#4C1D95 55%,#6D28D9 100%) !important}',
      'body.la-dark .rounded-\\[28px\\].p-7 div{color:#C4B5FD !important}',
      'body.la-dark .rounded-\\[28px\\].p-7 button{background:#FFFFFF !important;color:#2C0E53 !important}',
      'body.la-dark .rounded-\\[28px\\].p-7 button span:last-child{background:#2C0E53 !important;color:#FFFFFF !important}',
      'body.la-dark .rounded-\\[28px\\].p-6{background:' + RP.CARD + ' !important}',
      'body.la-dark #la-login{background:' + RP.PAGE + ' !important}',
      'body.la-dark #la-login .card{background:' + RP.CARD + ' !important;border-color:' + RP.BORDER + ' !important}',
      'body.la-dark #la-login label,body.la-dark #la-login h1,body.la-dark #la-login p{color:#E9ECF5 !important}',
      'body.la-dark #la-login .swap a{color:#9B7BFF !important}'
      ].join('');
   if (!document.getElementById('la-dark-ref')) document.head.appendChild(refCss);

   // ===== 26. หัวข้อด้านบนตามหน้า + เอาขีดสองขีดออก =====
   // เดิม h1 เขียนว่า Dashboard ตายตัว จึงค้างทุกหน้า
   // อ่านชื่อหน้าจาก URL เพราะแน่นอนกว่าการไล่หาจาก DOM
   function laPageName() {
      var s = (location.hash || '#dashboard').slice(1);
      var pair = null;
      for (var vi = 0; vi < VIEW_SLUGS.length; vi++) if (VIEW_SLUGS[vi][0] === s) pair = VIEW_SLUGS[vi][1];
      if (!pair) pair = VIEW_SLUGS[0][1];
      var lang = 'th';
      try { lang = localStorage.getItem('la_lang') || 'th'; } catch (err) {}
      return lang === 'en' ? pair[0] : pair[1];
   }
   if (React && !React.__laTitleHook) {
      var prevCE7 = React.createElement;
      React.createElement = function (type, props) {
         var a = Array.prototype.slice.call(arguments);
         var cls = (a[1] && typeof a[1].className === 'string') ? a[1].className : '';
         if ((type === 'h1' || type === 'h2') && cls.indexOf('text-2xl') !== -1) {
            if (type === 'h1') return prevCE7(type, a[1], laPageName());
            for (var ti = 2; ti < a.length; ti++) {
               if (typeof a[ti] === 'string') a[ti] = a[ti].replace(/^\/\/\s*/, '');
            }
         }
         return prevCE7.apply(this, a);
      };
      React.__laTitleHook = true;
   }

   // ===== 27. พื้นหลังโหมดมืด 4 ระดับตาม Reference =====
   // เดิมตั้งสีให้แค่ body — html กับ main จึงเป็นดำสนิท กลายเป็นบล็อกดำทึบ
   // Ref แยก 4 ระดับ: กรอบนอก → แถบเมนู → พื้นเนื้อหา → การ์ด
   var bgCss = document.createElement('style');
   bgCss.id = 'la-dark-bg';
   bgCss.textContent = [
      'html.la-dark-root{background:#101421 !important}',
      'body.la-dark{background:' + RP.PAGE + ' !important}',
      'body.la-dark main{background:' + RP.PAGE + ' !important}',
      'body.la-dark [class*="lg:ml-"]{background:' + RP.PAGE + ' !important}',
      'body.la-dark main > div{background:transparent !important}'
      ].join('');
   if (!document.getElementById('la-dark-bg')) document.head.appendChild(bgCss);
   function syncDarkRoot() {
      if (window.__laDark) document.documentElement.classList.add('la-dark-root');
      else document.documentElement.classList.remove('la-dark-root');
   }
   syncDarkRoot();
   setInterval(syncDarkRoot, 1500);

   // ===== 28. ซ่อนหัวข้อด้านบน เหลือแค่หัวข้อในหน้า =====
   // ชื่อหน้าขึ้นซ้ำสองที่ — เอาอันบนออก เหลืออันล่างที่มีคำอธิบายใต้
   // หน้า Dashboard ไม่มีหัวข้อล่าง แต่การ์ดต้อนรับทำหน้าที่แทนอยู่แล้ว
   var h1Css = document.createElement('style');
   h1Css.id = 'la-hide-h1';
   h1Css.textContent = 'h1.text-2xl{display:none !important}';
   if (!document.getElementById('la-hide-h1')) document.head.appendChild(h1Css);

   // ===== 29. แปลข้อความระบบที่เป็นไทยตกค้างในโหมดอังกฤษ =====
   // ข้อความเหล่านี้มีตัวเลขปน จึงไม่อยู่ในตารางคำแปลเดิม
   // กฎผูกหัวท้ายแน่น เพื่อไม่ให้ไปโดนชื่องานหรือข้อความโพสต์จริง
   var PAT_RULES = [
      [/^(\d+)\/(\d+)\s*เสร็จ$/, function (m) { return m[1] + '/' + m[2] + ' done'; }],
      [/^(\d+)\s*รายการ$/, function (m) { return m[1] + ' items'; }],
      [/^(\d+)\s*ผลลัพธ์$/, function (m) { return m[1] + ' results'; }],
      [/^(\d+)\s*งานที่ต้องเร่งทำ$/, function (m) { return m[1] + ' tasks need attention'; }],
      [/^อีก\s*(\d+)\s*วัน$/, function (m) { return m[1] + ' days left'; }],
      [/^งานใกล้\s*Due Date\s*(\d+)\s*วัน$/, function (m) { return 'Due within ' + m[1] + ' days'; }],
      [/^ทั้งหมดในโปรเจกต์:\s*(\d+)\s*รายการ$/, function (m) { return 'All in project: ' + m[1] + ' items'; }]
      ];
   var PAT_FRAG = {
      'พรุ่งนี้': 'Tomorrow',
      'วันนี้': 'Today',
      'เมื่อวาน': 'Yesterday',
      'ความคืบหน้า': 'Progress',
      ' งานที่ต้องเร่งทำ': ' tasks need attention',
      ' รายการ': ' items',
      ' ผลลัพธ์': ' results',
      ' รายการในโปรเจกต์นี้': ' items in this project',
      ' เสร็จ': ' done',
      'ทั้งหมดในโปรเจกต์: ': 'All in project: ',
      'ตารางวางแผน Social Media — ': 'Social media plan — ',
      'ติดตาม Tasks + Planning Posts ทั้งหมด · ': 'All Tasks + Planning Posts · ',
      'ประวัติการทำงานทั้งหมด — โปรเจกต์ ': 'All work history — project ',
      'KPI & ผลงานแต่ละคน · ': 'KPI & individual results · ',
      ' รายการ (ทั้งหมด)': ' items (all)',
      ' งาน · ': ' tasks · ',
      '% ของทีม': '% of team',
      ' members · จัดการ': ' members · Manage',
      'จัดการ': 'Manage',
      'วัดจากงานที่ทำเสร็จ (โพสต์ Published + Task/Job เสร็จ)': 'Based on completed work (Published posts + finished Tasks/Jobs)'
   };
   function laPatTr(s) {
      if (typeof s !== 'string') return null;
      var t = s.trim();
      for (var pi = 0; pi < PAT_RULES.length; pi++) {
         var m = t.match(PAT_RULES[pi][0]);
         if (m) return PAT_RULES[pi][1](m);
      }
      if (PAT_FRAG[s]) return PAT_FRAG[s];
      if (PAT_FRAG[t]) return PAT_FRAG[t];
      return null;
   }

   if (React && !React.__laPatHook) {
      var prevCE8 = React.createElement;
      React.createElement = function (type, props) {
         var a = Array.prototype.slice.call(arguments);
         var lang = 'th';
         try { lang = localStorage.getItem('la_lang') || 'th'; } catch (err) {}
         if (lang === 'en') {
            for (var pj = 2; pj < a.length; pj++) {
               if (typeof a[pj] === 'string') {
                  var nv = laPatTr(a[pj]);
                  if (nv) a[pj] = nv;
               }
            }
         }
         return prevCE8.apply(this, a);
      };
      React.__laPatHook = true;
   }

   // ===== 30. โลโก้ช่องทาง + เพิ่ม Website =====
   // วาดโลโก้เองเป็น SVG ไม่ดึงไฟล์จากภายนอก จึงไม่ติดเรื่องลิขสิทธิ์
   // หมายเหตุ: ต้องเพิ่ม Website ใน CHECK constraint ของตาราง posts ด้วย (ทำแล้ว)
   if (window.CHANNELS && !window.CHANNELS.some(function (c) { return c && c.name === 'Website'; })) {
      window.CHANNELS.push({ name: 'Website', color: '#0F766E', bg: '#CCFBF1' });
   }
   var CH_LOGO = {
      'Facebook': '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="#1877F2" d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.7-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0022 12z"/></svg>',
      'Instagram': '<svg viewBox="0 0 24 24" width="14" height="14"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="#E1306C" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="#E1306C" stroke-width="2"/><circle cx="17.2" cy="6.8" r="1.2" fill="#E1306C"/></svg>',
      'TikTok': '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="#111" d="M16.5 3c.4 1.9 1.6 3.3 3.5 3.6v2.6c-1.3.1-2.5-.3-3.6-1v6.2c0 4-3.4 6.6-7 5.4-2.3-.8-3.6-3-3.4-5.4.2-2.4 2.3-4.3 4.8-4.3.3 0 .5 0 .8.1v2.7c-.3-.1-.6-.1-.9-.1-1.2 0-2.2 1-2.2 2.2s1 2.2 2.2 2.2c1.3 0 2.3-1 2.3-2.4V3h3.5z"/></svg>',
      'Lemon 8': '<svg viewBox="0 0 24 24" width="14" height="14"><circle cx="12" cy="12" r="9" fill="#FFC800"/><path fill="#fff" d="M12 6.5c1.6 0 2.8 1 2.8 2.4 0 .9-.5 1.6-1.3 2 .9.4 1.5 1.2 1.5 2.2 0 1.6-1.3 2.7-3 2.7s-3-1.1-3-2.7c0-1 .6-1.8 1.5-2.2-.8-.4-1.3-1.1-1.3-2 0-1.4 1.2-2.4 2.8-2.4z"/></svg>',
      'YouTube': '<svg viewBox="0 0 24 24" width="14" height="14"><rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="#FF0000"/><path fill="#fff" d="M10 9.2l5 2.8-5 2.8z"/></svg>',
      'Website': '<svg viewBox="0 0 24 24" width="14" height="14"><circle cx="12" cy="12" r="9" fill="none" stroke="#0F766E" stroke-width="2"/><ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="#0F766E" stroke-width="2"/><path stroke="#0F766E" stroke-width="2" d="M3.2 9.5h17.6M3.2 14.5h17.6"/></svg>'
   };
   function addChannelLogos() {
      var bs = document.querySelectorAll('button');
      for (var bi = 0; bi < bs.length; bi++) {
         var b = bs[bi];
         var t = (b.textContent || '').trim();
         if (!CH_LOGO[t] || b.dataset.laChLogo) continue;
         b.dataset.laChLogo = '1';
         b.style.display = 'inline-flex';
         b.style.alignItems = 'center';
         b.style.gap = '5px';
         b.insertAdjacentHTML('afterbegin', CH_LOGO[t]);
      }
   }
   addChannelLogos();
   setInterval(addChannelLogos, 700);

   // ===== 31. ตัวอ่านสีรองรับชื่อสีและรหัส 3 หลัก =====
   // ตัวเดิมอ่านได้แค่ #RRGGBB กับ rgb() — พอเจอ background:'white' จึงอ่านไม่ออก
   // ผลคือพื้นยังขาวแต่ตัวหนังสือถูกทำให้สว่าง — ขาวบนขาว อ่านไม่ออก
   var NAMED_COLORS = {
      white: '#FFFFFF', black: '#000000', red: '#FF0000', gray: '#808080',
      grey: '#808080', silver: '#C0C0C0', whitesmoke: '#F5F5F5', ivory: '#FFFFF0',
      snow: '#FFFAFA', linen: '#FAF0E6'
   };
   function laColorKey(c) {
      if (typeof c !== 'string') return null;
      var s = c.trim().toLowerCase();
      if (s === 'transparent' || s === 'inherit' || s === 'currentcolor') return null;
      if (NAMED_COLORS[s]) return NAMED_COLORS[s];
      var m = s.match(/#([0-9a-f]{6})/);
      if (m) return ('#' + m[1]).toUpperCase();
      m = s.match(/#([0-9a-f]{3})(?![0-9a-f])/);
      if (m) {
         var h = m[1];
         return ('#' + h[0] + h[0] + h[1] + h[1] + h[2] + h[2]).toUpperCase();
      }
      m = s.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/);
      if (m) return '#' + [m[1], m[2], m[3]].map(function (x) { return (+x).toString(16).padStart(2, '0'); }).join('').toUpperCase();
      return null;
   }
   rUp = laColorKey;

   // ===== 32. กล่องหุ้มทั้งหน้าในโหมดมืด =====
   // ส่วนที่ 9 ตั้งไล่สีขาวไว้ด้วย !important กับตัวเลือก 3 คลาส
   // จึงชนะทุกกฎของโหมดมืด — จอกว้างจึงเห็นขอบสว่างโผล่มา
   var rootBgCss = document.createElement('style');
   rootBgCss.id = 'la-dark-rootbg';
   rootBgCss.textContent = [
      'body.la-dark div.min-h-screen.w-full.flex{background:' + RP.PAGE + ' !important}',
      'body.la-dark #la-login{background:' + RP.PAGE + ' !important}'
      ].join('');
   if (!document.getElementById('la-dark-rootbg')) document.head.appendChild(rootBgCss);

   // ===== 33. ปุ่ม Add New Task ในการ์ดต้อนรับ — เปิดกล่องเพิ่ม Task ทันที =====
   // เดิมกดแล้วไม่มีอะไรเกิดขึ้นเลย — สั่งให้ไปกดปุ่ม ADD NEW TASK บนแถบแทน
   // ใช้วิธีนี้เพราะไม่ต้องไปแก้ state ของแอป จึงไม่เสี่ยงทำของเดิมพัง
   function laHeroAddBtn() {
      var bs = document.querySelectorAll('button');
      for (var hi = 0; hi < bs.length; hi++) {
         var t = (bs[hi].textContent || '').trim();
         if (/Add New Task|เพิ่มงานใหม่/i.test(t) && String(bs[hi].className).indexOf('pl-6') !== -1) return bs[hi];
      }
      return null;
   }
   function laOpenAddTask() {
      var bs = document.querySelectorAll('aside.fixed.left-0 button');
      for (var oi = 0; oi < bs.length; oi++) {
         if (/ADD NEW TASK|เพิ่ม Task/i.test(bs[oi].textContent || '')) { bs[oi].click(); return true; }
      }
      return false;
   }
   function laWireHero() {
      var h = laHeroAddBtn();
      if (!h || h.dataset.laWired) return;
      h.dataset.laWired = '1';
      h.addEventListener('click', function (ev) {
         ev.preventDefault();
         ev.stopImmediatePropagation();
         laOpenAddTask();
      }, true);
   }
   laWireHero();
   setInterval(laWireHero, 700);

   // ===== 34. แปลข้อความในกล่องเพิ่ม Task / Job / Post =====
   // กล่องเหล่านี้เขียนไทยตายตัว จึงไม่เปลี่ยนตามภาษา
   // ชื่อสมาชิกและชื่อหมวดที่ลูกค้าตั้งเองเป็นข้อมูล ไม่แปล
   var MODAL_TR = {
      'เพิ่ม Task ใหม่': 'Add New Task',
      'เพิ่ม Planning Post': 'Add Planning Post',
      'ผู้รับผิดชอบ — กดเลือกได้หลายคน': 'Assignees — select multiple',
      'หมวดหมู่': 'Category',
      'หมวดหมู่ Jobs': 'Job category',
      'ชื่อ Job': 'Job name',
      'ชื่อ Task': 'Task name',
      'กำหนดส่ง': 'Due date',
      'หมายเหตุ / comment': 'Notes / comment',
      'เพิ่ม Job': 'Add Job',
      'เพิ่ม Task': 'Add Task',
      'เพิ่ม Post': 'Add Post',
      'เช่น แถลงข่าวเปิดตัวทัวร์ใหม่ที่ภูเก็ต': 'e.g. Press launch for a new Phuket tour',
      'รายละเอียด, สื่อมวลชนที่เชิญ, สถานที่, ลิงก์อ้างอิง…': 'Details, invited media, venue, reference links…',
      'เช่น โพสต์ IG สำหรับโปรทัวร์เกาะสิมิลัน': 'e.g. IG post for the Similan tour promo',
      'รายละเอียดเพิ่มเติม, lock requirement, ลิงก์อ้างอิง…': 'More details, lock requirement, reference links…',
      'เช่น หมู่เกาะสุรินทร์, อ่าวมาหยา, baboon run…': 'e.g. Surin Islands, Maya Bay, baboon run…'
   };
   if (React && !React.__laModalTr) {
      var prevCE9 = React.createElement;
      React.createElement = function (type, props) {
         var a = Array.prototype.slice.call(arguments);
         var lang = 'th';
         try { lang = localStorage.getItem('la_lang') || 'th'; } catch (err) {}
         if (lang === 'en') {
            for (var mi = 2; mi < a.length; mi++) {
               if (typeof a[mi] === 'string') {
                  var tt = a[mi].trim();
                  if (MODAL_TR[tt]) a[mi] = a[mi].replace(tt, MODAL_TR[tt]);
               }
            }
            if (a[1] && typeof a[1].placeholder === 'string') {
               var pp = a[1].placeholder.trim();
               if (MODAL_TR[pp]) { var q = Object.assign({}, a[1]); q.placeholder = MODAL_TR[pp]; a[1] = q; }
            }
         }
         return prevCE9.apply(this, a);
      };
      React.__laModalTr = true;
   }

   // ===== 35. หมวดหมู่ Jobs และ Post Topic — ดึงจากฐานข้อมูล =====
   // เดิมเขียนตายตัวในโค้ด ลูกค้าแก้เองไม่ได้
   // ตอนนี้เก็บในตาราง options แยกตามบริษัท (RLS)
   // ลบหมวดได้ทันที — งานเก่าที่ใช้หมวดนั้นเก็บชื่อเดิมไว้ ไม่หาย
   var OPT_PALETTE = ['#5A4A6A', '#8A6A2E', '#3E5AA0', '#3A3A34', '#2F6F5B', '#8A3E52', '#3E6F8A', '#6A5A2E'];
   function laOptApi(path, opt) {
      var t = window.laToken && window.laToken();
      var o = opt || {};
      o.headers = Object.assign({ Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' }, o.headers || {});
      return fetch(window.LA_CONFIG.api + path, o);
   }
   function laLoadOptions() {
      var t = window.laToken && window.laToken();
      if (!t) return Promise.resolve(null);
      return laOptApi('/options?select=id,kind,name,sort&order=sort,id').then(function (r) {
         if (!r.ok) return null;
         return r.json();
      }).then(function (rows) {
         if (!rows) return null;
         var jobs = rows.filter(function (x) { return x.kind === 'job_category'; });
         var tops = rows.filter(function (x) { return x.kind === 'post_topic'; });
         if (jobs.length && window.JOB_CATEGORIES) {
            var old = {};
            window.JOB_CATEGORIES.forEach(function (c) { old[c.name] = c.color; });
            var next = jobs.map(function (x, i) {
               return { name: x.name, color: old[x.name] || OPT_PALETTE[i % OPT_PALETTE.length] };
            });
            window.JOB_CATEGORIES.length = 0;
            next.forEach(function (c) { window.JOB_CATEGORIES.push(c); });
         }
         if (tops.length && window.POST_TOPICS) {
            window.POST_TOPICS.length = 0;
            tops.forEach(function (x) { window.POST_TOPICS.push(x.name); });
         }
         return { jobs: jobs.length, topics: tops.length };
      }).catch(function () { return null; });
   }
   laLoadOptions();
   setTimeout(laLoadOptions, 2500);

   // ===== 36. หน้าจัดการหมวดหมู่ =====
   function laOptionsUI(kind, title) {
      laOptApi('/options?kind=eq.' + kind + '&select=id,name,sort&order=sort,id').then(function (r) { return r.json(); }).then(function (rows) {
         var dark = document.body.classList.contains('la-dark');
         var bg = dark ? '#1C2338' : '#ffffff';
         var fg = dark ? '#E9ECF5' : '#0F1720';
         var bd = dark ? '#2A3350' : '#E2E8F0';
         var fieldBg = dark ? '#232B42' : '#ffffff';
         var ov = document.createElement('div');
         ov.style.cssText = 'position:fixed;inset:0;background:rgba(15,20,35,.55);display:flex;align-items:center;justify-content:center;z-index:9999';
         var card = document.createElement('div');
         card.style.cssText = 'background:' + bg + ';color:' + fg + ';border-radius:18px;width:min(460px,92vw);max-height:80vh;overflow:auto;padding:20px;box-shadow:0 18px 60px rgba(0,0,0,.25)';
         function rowHtml(r) {
            return '<div data-id="' + r.id + '" style="display:flex;gap:8px;align-items:center;margin-bottom:8px">' +
               '<input value="' + String(r.name).replace(/"/g, '&quot;') + '" style="flex:1;padding:8px 10px;border-radius:10px;border:1px solid ' + bd + ';background:' + fieldBg + ';color:inherit">' +
               '<button data-act="del" style="padding:6px 10px;border-radius:8px;background:#FEE2E2;color:#B91C1C;font-size:12px">ลบ</button></div>';
         }
         card.innerHTML = '<div style="font-weight:700;font-size:17px;margin-bottom:12px">' + title + '</div>' +
            '<div id="la-opt-list">' + rows.map(rowHtml).join('') + '</div>' +
            '<div style="display:flex;gap:8px;margin-top:10px"><input id="la-opt-new" placeholder="พิมพ์ชื่อหมวดใหม่…" style="flex:1;padding:8px 10px;border-radius:10px;border:1px dashed ' + bd + ';background:transparent;color:inherit">' +
            '<button id="la-opt-add" style="padding:8px 14px;border-radius:10px;background:#6366F1;color:#fff;font-weight:600">+ เพิ่ม</button></div>' +
            '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px">' +
            '<button id="la-opt-close" style="padding:8px 14px">ปิด</button>' +
            '<button id="la-opt-save" style="padding:8px 16px;border-radius:10px;background:#6366F1;color:#fff;font-weight:700">บันทึก</button></div>';
         ov.appendChild(card);
         document.body.appendChild(ov);
         card.querySelector('#la-opt-close').onclick = function () { ov.remove(); };
         card.querySelector('#la-opt-add').onclick = function () {
            var inp = card.querySelector('#la-opt-new');
            var n = (inp.value || '').trim();
            if (!n) return;
            laOptApi('/options', { method: 'POST', headers: { Prefer: 'return=representation' },
                                  body: JSON.stringify({ kind: kind, name: n, sort: card.querySelectorAll('#la-opt-list [data-id]').length + 1 }) })
            .then(function (r) { return r.ok ? r.json() : r.text().then(function (t) { throw new Error(t.slice(0, 120)); }); })
            .then(function (d) { card.querySelector('#la-opt-list').insertAdjacentHTML('beforeend', rowHtml(d[0])); inp.value = ''; })
            .catch(function (e) { alert('เพิ่มไม่สำเร็จ\n' + e.message); });
         };
         card.querySelector('#la-opt-list').onclick = function (ev) {
            var b = ev.target.closest('[data-act="del"]');
            if (!b) return;
            var d = b.closest('[data-id]');
            laOptApi('/options?id=eq.' + d.dataset.id, { method: 'DELETE' }).then(function (r) {
               if (r.ok) d.remove(); else alert('ลบไม่สำเร็จ');
            });
         };
         card.querySelector('#la-opt-save').onclick = function () {
            var items = [].slice.call(card.querySelectorAll('#la-opt-list [data-id]'));
            var chain = Promise.resolve();
            items.forEach(function (it, i) {
               chain = chain.then(function () {
                  return laOptApi('/options?id=eq.' + it.dataset.id, { method: 'PATCH',
                                                                      body: JSON.stringify({ name: it.querySelector('input').value.trim(), sort: i + 1 }) });
               });
            });
            chain.then(function () { ov.remove(); location.reload(); });
         };
      });
   }
   window.__laOptionsUI = laOptionsUI;

   // ปุ่มจัดการ — วางข้างปุ่ม Add ของแต่ละหน้า
   function laAddOptButtons() {
      var spec = [
         { near: /^(Add New Jobs|เพิ่มงาน PR)$/i, id: 'la-optbtn-job', kind: 'job_category', label: '⚙︎ หมวดหมู่', title: 'จัดการหมวดหมู่ Jobs' },
         { near: /^(Add Post|เพิ่ม Post)$/i, id: 'la-optbtn-topic', kind: 'post_topic', label: '⚙︎ Post Topic', title: 'จัดการ Post Topic / Type' }
         ];
      spec.forEach(function (s) {
         if (document.getElementById(s.id)) return;
         var bs = document.querySelectorAll('main button');
         for (var i = 0; i < bs.length; i++) {
            var t = (bs[i].textContent || '').trim();
            if (!s.near.test(t) || t.length > 20) continue;
            var b = document.createElement('button');
            b.id = s.id;
            b.textContent = s.label;
            b.style.cssText = 'margin-right:8px;padding:8px 12px;border-radius:12px;border:1px solid #C7D2FE;background:#EEF2FF;color:#4F46E5;font-size:13px;font-weight:600';
            b.onclick = function (ev) { ev.preventDefault(); laOptionsUI(s.kind, s.title); };
            bs[i].parentNode.insertBefore(b, bs[i]);
            break;
         }
      });
   }
   setInterval(laAddOptButtons, 800);

   // ===== 37. เปิดหน้าเดิมตาม URL =====
   // แอปเริ่มที่หน้าภาพรวมเสมอ ไม่สนใจ hash ใน URL
   // ตอนสลับภาษา/โหมดมืด ระบบรีโหลด จึงเด้งกลับหน้าแรกทุกครั้ง
   var VIEW_INDEX = { dashboard: 0, tracking: 1, planning: 2, pr: 3, report: 4, history: 5 };
   var restoreTries = 0;
   function laRestoreView() {
            // ไม่นับครั้งตอนแอปยังโหลดไม่เสร็จ — หน้าหนักอย่างติดตามงานใช้เวลานานกว่า 12 วินาที
      var s = (location.hash || '').slice(1);
      if (!(s in VIEW_INDEX) || s === 'dashboard') return true;
      var nav = document.querySelectorAll('aside.fixed.left-0 nav button');
      if (nav.length < 6) return false;
      restoreTries++;
      if (restoreTries > 60) return true;
      var btn = nav[VIEW_INDEX[s]];
      if (!btn) return false;
                  var h2s = document.querySelectorAll('h2');
                  var want = (btn.textContent || '').replace(/[0-9]+/g, '').trim();
      for (var hh = 0; hh < h2s.length; hh++) {
         if (String(h2s[hh].className).indexOf('text-2xl') === -1) continue;
         if ((h2s[hh].textContent || '').trim() === want) return true;
         break;
      }
      navSuppress = true;
      btn.click();
      setTimeout(function () { navSuppress = false; }, 400);
            return false;
   }
   var restoreTimer = setInterval(function () {
      if (document.querySelector('#la-login')) { clearInterval(restoreTimer); return; }
      if (laRestoreView()) clearInterval(restoreTimer);
   }, 400);

   // ===== 38. หมวดหมู่ Task + ปรับหน้าตาปุ่มจัดการให้เห็นชัดขึ้น =====
   // เดิมแก้ได้แค่ Jobs กับ Post Topic — หมวดในกล่องเพิ่ม Task ยังเขียนตายตัว
   // ปุ่มเดิมจืดจนมองไม่เห็นในโหมดมืด จึงเปลี่ยนเป็นปุ่มขอบม่วง ข้อความยาวขึ้น
   function laLoadTaskCats() {
      var t = window.laToken && window.laToken();
      if (!t || !window.CATEGORIES) return;
      laOptApi('/options?kind=eq.task_category&select=name,sort&order=sort,id').then(function (r) {
         return r.ok ? r.json() : null;
      }).then(function (rows) {
         if (!rows || !rows.length) return;
         var old = {};
         window.CATEGORIES.forEach(function (c) { old[c.name] = c.color; });
         var next = rows.map(function (x, i) {
            return { name: x.name, color: old[x.name] || OPT_PALETTE[i % OPT_PALETTE.length] };
         });
         window.CATEGORIES.length = 0;
         next.forEach(function (c) { window.CATEGORIES.push(c); });
      }).catch(function () {});
   }
   laLoadTaskCats();
   setTimeout(laLoadTaskCats, 2500);

   // ปุ่มจัดการหมวด Task — หน้าติดตามงาน
   function laAddTaskCatButton() {
      if (document.getElementById('la-optbtn-task')) return;
      var bs = document.querySelectorAll('main button');
      for (var i = 0; i < bs.length; i++) {
         var t = (bs[i].textContent || '').trim();
         if (!/^(Export Tracking)$/i.test(t)) continue;
         var b = document.createElement('button');
         b.id = 'la-optbtn-task';
         b.onclick = function (ev) { ev.preventDefault(); laOptionsUI('task_category', 'จัดการหมวดหมู่ Task'); };
         bs[i].parentNode.insertBefore(b, bs[i].nextSibling);
         break;
      }
   }
   function laStyleOptButtons() {
      var dark = document.body.classList.contains('la-dark');
      var border = dark ? '#7450E5' : '#A5B4FC';
      var color = dark ? '#B9A9FF' : '#4F46E5';
      var spec = [
         ['la-optbtn-job', '⚙ จัดการหมวดหมู่'],
         ['la-optbtn-topic', '⚙ จัดการ Post Topic'],
         ['la-optbtn-task', '⚙ จัดการหมวดหมู่']
         ];
      spec.forEach(function (p) {
         var b = document.getElementById(p[0]);
         if (!b) return;
         b.textContent = p[1];
         b.style.cssText = 'margin-right:8px;padding:9px 16px;border-radius:12px;border:1px solid ' + border +
            ';background:transparent;color:' + color + ';font-size:13px;font-weight:600;white-space:nowrap';
      });
   }
   setInterval(function () { laAddTaskCatButton(); laStyleOptButtons(); }, 700);

   // ===== 39. กู้หน้าตาม URL — รอจนแอปพร้อมจริง =====
   // ส่วนที่ 37 กดเมนูตั้งแต่แอปยังไม่พร้อม คลิกจึงไม่ติด แล้วยอมแพ้ก่อน
   // หน้าหนักอย่างติดตามงานใช้เวลาเกิน 25 วินาที — ตัวนี้จึงตรวจทุกวินาทีจนกว่า 2 นาที
   var rvTicks = 0;
   var rvDone = false;
   function laRestoreView2() {
      if (rvDone) return;
      rvTicks++;
      if (rvTicks > 120) { rvDone = true; return; }
            if (document.querySelector('#la-login')) return;
      var s = (location.hash || '').slice(1);
      if (!(s in VIEW_INDEX) || s === 'dashboard') { rvDone = true; return; }
      var nav = document.querySelectorAll('aside.fixed.left-0 nav button');
      if (nav.length < 6) return;
      var btn = nav[VIEW_INDEX[s]];
      if (!btn) return;
      var want = (btn.textContent || '').replace(/[0-9]+/g, '').trim();
      var h2s = document.querySelectorAll('h2');
      for (var i = 0; i < h2s.length; i++) {
         if (String(h2s[i].className).indexOf('text-2xl') === -1) continue;
         if ((h2s[i].textContent || '').trim() === want) { rvDone = true; return; }
         break;
      }
      navSuppress = true;
      btn.click();
      setTimeout(function () { navSuppress = false; }, 300);
   }
   setInterval(laRestoreView2, 1000);

   // ===== 40. กู้หน้าตาม URL — เรียกฟังก์ชันเปลี่ยนหน้าของแอปตรง =====
   // การกดปุ่มด้วยโค้ดติดบ้างไม่ติดบ้าง (race กับจังหวะที่ React ผูก handler)
   // จึงดักเก็บ onClick ของแต่ละเมนูไว้ตอนวาด แล้วเรียกตรงๆ แทน
   window.__laNavGo = {};
   var prevNavItem2 = window.NavItem;
   window.NavItem = function (p) {
      try {
         var sl = slugOfLabel(p.label);
         if (sl && p.onClick) window.__laNavGo[sl] = p.onClick;
      } catch (err) {}
      return prevNavItem2(p);
   };
   var goTicks = 0;
   var goDone = false;
   function laGoHashDirect() {
      if (goDone) return;
      goTicks++;
      if (goTicks > 90) { goDone = true; return; }
      if (document.querySelector('#la-login')) return;
      var s = (location.hash || '').slice(1);
            if (!(s in VIEW_INDEX) || s === 'dashboard') return;
      var want = null;
      for (var vi = 0; vi < VIEW_SLUGS.length; vi++) {
         if (VIEW_SLUGS[vi][0] === s) want = VIEW_SLUGS[vi][1];
      }
      var lang = 'th';
      try { lang = localStorage.getItem('la_lang') || 'th'; } catch (err) {}
      var wantTitle = want ? (lang === 'en' ? want[0] : want[1]) : null;
      var h2s = document.querySelectorAll('h2');
      for (var i = 0; i < h2s.length; i++) {
         if (String(h2s[i].className).indexOf('text-2xl') === -1) continue;
         if (wantTitle && (h2s[i].textContent || '').trim() === wantTitle) { goDone = true; return; }
         break;
      }
      var fn = window.__laNavGo[s];
      if (typeof fn !== 'function') return;
      navSuppress = true;
      try { fn(); } catch (err) {}
      setTimeout(function () { navSuppress = false; }, 300);
   }
   setInterval(laGoHashDirect, 700);

   // ===== 41. คอยยืนยันหน้าซ้ำ 30 วินาที =====
   // สาเหตุจริง: หน้าเปลี่ยนสำเร็จแล้ว แต่แอปสลับกลับมาหน้าภาพรวมทีหลัง
   // ตัวก่อนเห็นว่าสำเร็จแล้วจึงหยุด — ตัวนี้ตรวจซ้ำเรื่อยๆ ไม่หยุดกลางคัน
   var keepTicks = 0;
   function laKeepView() {
      keepTicks++;
      if (keepTicks > 40) return;
      if (document.querySelector('#la-login')) return;
      var s = (location.hash || '').slice(1);
      if (!(s in VIEW_INDEX) || s === 'dashboard') return;
      var want = null;
      for (var vi = 0; vi < VIEW_SLUGS.length; vi++) {
         if (VIEW_SLUGS[vi][0] === s) want = VIEW_SLUGS[vi][1];
      }
      if (!want) return;
      var lang = 'th';
      try { lang = localStorage.getItem('la_lang') || 'th'; } catch (err) {}
      var wantTitle = lang === 'en' ? want[0] : want[1];
      var cur = null;
      var h2s = document.querySelectorAll('h2');
      for (var i = 0; i < h2s.length; i++) {
         if (String(h2s[i].className).indexOf('text-2xl') === -1) continue;
         cur = (h2s[i].textContent || '').trim();
         break;
      }
      if (cur === wantTitle) return;
      var fn = window.__laNavGo[s];
      if (typeof fn !== 'function') return;
      navSuppress = true;
      try { fn(); } catch (err) {}
      setTimeout(function () { navSuppress = false; }, 300);
   }
   setInterval(laKeepView, 750);

   // ===== 42. เก็บกวาด — ปิดตัวกู้หน้าซ้ำซ้อน =====
   // ตอนไล่หาสาเหตุผมเขียนตัวกู้หน้าไว้ 4 ชุด (ส่วน 12, 37, 39, 40)
   // ตัวที่ใช้ได้จริงคือส่วนที่ 41 — ที่เหลือทำงานซ้อนกันเปล่าๆ จึงปิดทิ้ง
   // ส่วนที่ 40 ยังต้องเก็บไว้ เพราะเป็นตัวดักเก็บฟังก์ชันเปลี่ยนหน้าที่ส่วน 41 ใช้
   try { if (typeof restoreTimer !== 'undefined') clearInterval(restoreTimer); } catch (err) {}
   rvDone = true;
   goDone = true;
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   

})();


// ===== 43. กันชื่อ "Marketing Team" เด้งตอนโหลด =====
// โค้ดเขียนชื่อชั่วคราวลงก่อน แล้วค่อยดึงชื่อจริงจาก API มาทับ
// จึงเห็นชื่อผิดแวบหนึ่ง — แก้โดยจำชื่อไว้ในเครื่อง ใช้ได้ทันทีตั้งแต่วาดครั้งแรก
function laCachedBrand() {
   try {
      var c = localStorage.getItem('la_brand');
      if (c) return c;
   } catch (err) {}
   return 'Marketing Team';
}
function laSaveBrand() {
      var el = document.querySelector('[data-la-logo] .la-brand');
      if (!el) return;
      var n = (el.textContent || '').trim();
      if (!n || n === 'Marketing Team') return;
      try {
               if (localStorage.getItem('la_brand') !== n) localStorage.setItem('la_brand', n);
      } catch (err) {}
}
setInterval(laSaveBrand, 2000);
