// theme.mjs — ธีมม่วงอินดิโก้ + แก้ปุ่ม Logout
// ใช้: cd ~/Downloads/tracker && node theme.mjs
// ตรวจทุกขั้น ถ้าไม่ตรงคาดจะหยุดและไม่แตะไฟล์
import fs from 'node:fs';
import { execSync } from 'node:child_process';
const die = (m) => { console.error('❌ ' + m); process.exit(1); };
const IDX = 'index.html';
if (!fs.existsSync(IDX)) die('ไม่พบ index.html — ต้องรันจากโฟลเดอร์ tracker');
let h = fs.readFileSync(IDX, 'utf8');
const before = h.length;
const log = [];
const hits = {};
function sub(label, from, to) {
  const n = h.split(from).length - 1;
  hits[label] = n;
  if (n > 0) { h = h.split(from).join(to); log.push('  ' + label + ' (' + n + ' จุด)'); }
}

// ===== 1. ปุ่ม Logout =====
// เดิมลบ key ของระบบรหัสทีมที่ถอดออกไปแล้ว กดแล้วจึงไม่มีอะไรเกิดขึ้น
sub('ปุ่ม Logout ล้าง session จริง', "'la_unlocked_'", "'la_session'");
sub('ข้อความยืนยัน Logout', 'ออกจากระบบ? (ต้องกรอกรหัสผ่านทีมใหม่)', 'ออกจากระบบ?');

// ===== 2. ชุดสีหลักใน object T =====
const T_MAP = {
  "sidebarBg: '#E8ECEF'":     "sidebarBg: '#FFFFFF'",
  "sidebarHover: '#F5F7F8'":  "sidebarHover: '#EEF2FF'",
  "sidebarActive: '#F5EFC9'": "sidebarActive: '#E0E7FF'",
  "sidebarText: '#8A8A80'":   "sidebarText: '#94A3B8'",
  "sidebarTitle: '#1A1A1A'":  "sidebarTitle: '#0F1720'",
  "mainBg: '#EEF1F3'":        "mainBg: '#F2F4FA'",
  "rightPanelBg: '#F3F5F7'":  "rightPanelBg: '#FFFFFF'",
  "border: '#E4E9EE'":        "border: '#E2E8F0'",
  "text: '#1A1A1A'":          "text: '#0F1720'",
  "textMuted: '#8A8A80'":     "textMuted: '#64748B'",
  "navy: '#1A1A1A'":          "navy: '#6366F1'",
  "navyDeep: '#000000'":      "navyDeep: '#4F46E5'",
  "cyan: '#3E7BB8'":          "cyan: '#6366F1'",
  "pillBlue: '#DCE9F5'":      "pillBlue: '#E0E7FF'",
  "pillTeal: '#CFE8D4'":      "pillTeal: '#CCFBF1'",
  "pillCoral: '#EFE7D6'":     "pillCoral: '#FFE4E6'",
  "pillMint: '#CFE8D4'":      "pillMint: '#D1FAE5'"
};
for (const [a, b] of Object.entries(T_MAP)) sub('สี ' + a.split(':')[0], a, b);

// ===== 3. การ์ดสถิติ 5 ใบ (สีเขียนตายตัวใน StatsRow) =====
sub('การ์ด Total Task', "bg: '#1A1A1A', accent: '#FFFFFF'", "bg: '#4F46E5', accent: '#FFFFFF'");
sub('การ์ด Completed', "bg: '#CFE8D4', accent: '#2E7A4E'", "bg: '#D1FAE5', accent: '#047857'");
sub('การ์ด In Progress', "bg: '#F5EFD9', accent: '#8A6A2E'", "bg: '#FEF3C7', accent: '#B45309'");
sub('การ์ด Not Started', "bg: '#DCE9F5', accent: '#3E6FA0'", "bg: '#E0E7FF', accent: '#4F46E5'");
sub('การ์ด Overdue', "bg: '#F3DEDA', accent: '#B0392C'", "bg: '#FFE4E6', accent: '#BE123C'");

// ===== 4. พื้นหลังและมุมมน =====
sub('พื้นหลัง body', 'background: #F5F3EE', 'background: #F2F4FA');
const ROUND = '<style id="la-ref-theme">.rounded-3xl{border-radius:28px}.rounded-2xl{border-radius:20px}</style>';
if (!h.includes('la-ref-theme')) {
  if ((h.match(/<\/head>/g) || []).length !== 1) die('หา </head> ไม่เจอหรือเจอหลายจุด');
  h = h.replace('</head>', '  ' + ROUND + '\n</head>');
  log.push('  มุมการ์ดมนขึ้น 28px');
}

// ===== 5. ตรวจก่อนเขียนไฟล์ =====
const problems = [];
if (hits['ปุ่ม Logout ล้าง session จริง'] !== 1) problems.push('หาโค้ดปุ่ม Logout ไม่เจอหรือเจอหลายจุด');
if (hits["สี navy"] !== 1) problems.push('หาสี navy ใน T ไม่เจอ');
if (hits['การ์ด Total Task'] !== 1) problems.push('หาการ์ดสถิติไม่เจอ');
for (const k of ['function laFetch', 'src="login.js"', '</body>', '</html>', 'la-responsive-v1']) {
  if (!h.includes(k)) problems.push('หายไป: ' + k);
}
if ((h.match(/<script/g) || []).length !== (h.match(/<\/script>/g) || []).length) problems.push('<script> ไม่สมดุล');
if (h.includes('la_unlocked_')) problems.push('ยังเหลือ la_unlocked_ ในไฟล์');
if (problems.length) { console.error('❌ ตรวจไม่ผ่าน ไม่แตะไฟล์:'); problems.forEach(p => console.error('   · ' + p)); process.exit(1); }

fs.copyFileSync(IDX, IDX + '.bak');
fs.writeFileSync(IDX, h);
console.log('✅ เรียบร้อย');
log.forEach(l => console.log(l));
console.log('');
console.log('   index.html ' + before + ' -> ' + h.length + ' bytes');
console.log('   ต่อไป: git add -A && git commit -m "ref theme + fix logout" && git push origin Clone-task');
