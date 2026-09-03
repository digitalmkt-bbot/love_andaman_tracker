/* dashboard.js — ปรับหน้าตาตาม Reference
   โหลดต่อจากโค้ดหลัก แล้วเขียนทับ component ที่เป็น global
      ไม่แตะ index.html เลย ไม่ชอบก็ลบไฟล์นี้ไฟล์เดียว */
(function () {
  if (typeof React === 'undefined') return;
  var e = React.createElement;
  var IND = '#6366F1', DEEP = '#4F46E5', INK = '#0F1720', MUT = '#64748B';

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
            d.innerHTML = LOGO_SVG;
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
   
   
   

})();
