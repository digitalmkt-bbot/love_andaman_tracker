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

})();
