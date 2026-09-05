/**
 * auth service — ออก JWT ให้ PostgREST
 * ────────────────────────────────────────────────────────────
 * PostgREST ไม่มีระบบล็อกอินในตัว มันแค่ตรวจ JWT ที่ส่งมา
 * แล้วสวมบทบาท role ตามที่ระบุใน claim service นี้ทำหน้าที่
 * ตรวจ user/pass แล้วออก token ที่ PostgREST ยอมรับ
 *
 * ตัวแปรที่ต้องตั้ง
 *   DATABASE_URL      ฐานข้อมูลเดียวกับ PostgREST
 *   PGRST_JWT_SECRET  ต้องเป็นค่าเดียวกับที่ตั้งใน service api เป๊ะๆ
 *   TOKEN_TTL_HOURS   อายุ token (ค่าเริ่มต้น 12)
 *   CORS_ORIGIN       โดเมนหน้าเว็บ เช่น https://xxx.github.io
 *
 *   PROMPTPAY_ID      เบอร์พร้อมเพย์ 10 หลัก หรือเลขบัตรประชาชน 13 หลัก
 *                     ไม่ตั้ง = ปิดการขายในตัว (สร้างออเดอร์ไม่ได้)
 *   ADMIN_KEY         กุญแจหน้าอนุมัติออเดอร์ อย่างน้อย 24 ตัวอักษร
 *                     สร้างด้วย: openssl rand -base64 32
 * ────────────────────────────────────────────────────────────
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import pg from 'pg';

const { Pool } = pg;

const JWT_SECRET = process.env.PGRST_JWT_SECRET;
const TTL_HOURS  = Number(process.env.TOKEN_TTL_HOURS || 12);
const PORT       = Number(process.env.PORT || 3001);
const ORIGINS    = (process.env.CORS_ORIGIN || '*').split(',').map(s => s.trim());
const PROMPTPAY  = (process.env.PROMPTPAY_ID || '').replace(/\D/g, '');
const ADMIN_KEY  = process.env.ADMIN_KEY || '';

/* แพ็กเกจที่ขายได้ — ราคาและเพดานยึดจากที่นี่ที่เดียว ห้ามให้ฝั่งเบราว์เซอร์ส่งมา */
const PLANS = {
  starter:  { price:  990, seats: 10, items: 1000, label: 'เริ่มต้น' },
  business: { price: 2590, seats: 20, items: 2000, label: 'ธุรกิจ'  },
};

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('❌ PGRST_JWT_SECRET ต้องยาวอย่างน้อย 32 ตัวอักษร');
  console.error('   สร้างด้วย: openssl rand -base64 48');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  ssl: /railway|supabase|amazonaws/.test(process.env.DATABASE_URL || '')
    ? { rejectUnauthorized: false } : undefined,
});

/* ── รัน migration ตอนบูต ────────────────────────────────────
   Postgres ของ Railway ไม่เปิดให้ต่อจากข้างนอก (ไม่มี TCP proxy) จะรันด้วยมือ
   ต้องเปิดฐานข้อมูลออกอินเทอร์เน็ตก่อน ซึ่งไม่คุ้มความเสี่ยง
   service นี้อยู่ในเครือข่ายเดียวกับฐานข้อมูลอยู่แล้ว จึงให้รันแทน

   ทุกไฟล์เขียนให้รันซ้ำได้ และจดไว้ว่ารันอะไรไปแล้วใน schema_migrations
   ตั้ง RUN_MIGRATIONS=0 เพื่อปิด */
async function migrate() {
  if (process.env.RUN_MIGRATIONS === '0') return console.log('⏭  ข้าม migration (RUN_MIGRATIONS=0)');
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
  let files;
  try { files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort(); }
  catch { return console.log(`⏭  ไม่พบโฟลเดอร์ migrations ที่ ${dir}`); }
  console.log(`🗂  migrations ${files.length} ไฟล์ ที่ ${dir}`);

  const client = await pool.connect();
  try {
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
    // กันสองอินสแตนซ์รันชนกันตอน deploy พร้อมกัน
    await client.query('SELECT pg_advisory_lock(727001)');
    const { rows } = await client.query('SELECT name FROM schema_migrations');
    const done = new Set(rows.map(r => r.name));
    for (const f of files) {
      if (done.has(f)) { console.log(`✓  ${f} — รันไปแล้ว`); continue; }
      try {
        await client.query(fs.readFileSync(path.join(dir, f), 'utf8'));
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1) ON CONFLICT DO NOTHING', [f]);
        console.log(`✅ ${f} — รันสำเร็จ`);
      } catch (e) {
        // ไม่ล้มทั้ง service เพราะการล็อกอินของลูกค้าต้องใช้ได้ต่อ
        console.error(`❌ ${f} — ล้มเหลว: ${e.message}`);
      }
    }
  } catch (e) {
    console.error('❌ migration เริ่มไม่ได้:', e.message);
  } finally {
    await client.query('SELECT pg_advisory_unlock(727001)').catch(() => {});
    client.release();
  }
}

const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '64kb' }));
/* รูปสลิปใหญ่กว่า body ปกติ จึงเปิดเพดานเฉพาะเส้นทางนี้ */
const slipBody = express.json({ limit: '1mb' });

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ORIGINS.includes('*')) res.set('Access-Control-Allow-Origin', '*');
  else if (origin && ORIGINS.includes(origin)) res.set('Access-Control-Allow-Origin', origin);
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Key');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

// ── กันเดารหัสผ่าน ───────────────────────────────────────────
// นับต่อ IP + ชื่อผู้ใช้ เกิน 8 ครั้งใน 15 นาที = พักไว้ก่อน
const attempts = new Map();
const WINDOW = 15 * 60_000, LIMIT = 8;

function throttled(key) {
  const now = Date.now();
  const list = (attempts.get(key) || []).filter(t => now - t < WINDOW);
  attempts.set(key, list);
  return list.length >= LIMIT;
}
function noteAttempt(key) {
  const list = attempts.get(key) || [];
  list.push(Date.now());
  attempts.set(key, list);
}
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of attempts) {
    const keep = v.filter(t => now - t < WINDOW);
    keep.length ? attempts.set(k, keep) : attempts.delete(k);
  }
}, 5 * 60_000).unref();

// bcrypt hash ของสตริงสุ่ม — ใช้ให้เวลาตอบเท่ากันไม่ว่าจะมี user จริงหรือไม่
// ไม่งั้นคนร้ายจับเวลาตอบกลับแล้วรู้ได้ว่าชื่อผู้ใช้ไหนมีอยู่จริง
const DUMMY = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

function signToken(u) {
  return jwt.sign({
      role:      'webuser',       // ← ต้องตรงกับ role ใน Postgres
    org_id:    u.org_id,        // ← RLS ใช้ค่านี้กรองข้อมูล
    user_id:   u.id,
    username:  u.username,
    user_role: u.role,
  }, JWT_SECRET, { expiresIn: `${TTL_HOURS}h` });
}

async function log(orgCode, username, ip, ok) {
  try {
    await pool.query(
      'INSERT INTO login_attempts (org_code, username, ip, ok) VALUES ($1,$2,$3,$4)',
      [orgCode ?? null, username ?? null, ip ?? null, ok]);
  } catch { /* log ล้มเหลวไม่ควรทำให้ล็อกอินพัง */ }
}

// ────────────────────────────────────────────────────────────
// POST /login   { org, username, password }
// ────────────────────────────────────────────────────────────
app.post('/login', async (req, res) => {
  const { org, username, password } = req.body || {};
  const ip = req.ip;

  if (!username || !password) {
    return res.status(400).json({ error: 'ต้องกรอกชื่อผู้ใช้และรหัสผ่าน' });
  }

  const key = `${ip}|${String(username).toLowerCase()}`;
  if (throttled(key)) {
    await log(org, username, ip, false);
    return res.status(429).json({ error: 'พยายามล็อกอินบ่อยเกินไป รออีก 15 นาที' });
  }

  try {
    // ระบุรหัสบริษัทมา = ตรงตัว
    // ไม่ระบุ = ยอมเฉพาะกรณีชื่อนี้มีคนเดียวทั้งระบบ
    //          (ถ้าซ้ำข้ามบริษัทต้องบังคับกรอก ไม่งั้นบริษัทที่สองล็อกอินไม่ได้)
    const sql = org
      ? `SELECT u.*, o.status AS org_status, o.expires_at
           FROM users u JOIN orgs o ON o.id = u.org_id
          WHERE lower(u.username) = lower($1) AND lower(o.code) = lower($2)`
      : `SELECT u.*, o.status AS org_status, o.expires_at
           FROM users u JOIN orgs o ON o.id = u.org_id
          WHERE lower(u.username) = lower($1)`;

    const { rows } = await pool.query(sql, org ? [username, org] : [username]);

    if (rows.length !== 1) {
      await bcrypt.compare(password, DUMMY).catch(() => {});
      noteAttempt(key);
      await log(org, username, ip, false);
      return res.status(401).json(rows.length > 1
        ? { error: 'ชื่อผู้ใช้นี้มีในหลายบริษัท กรุณากรอกรหัสบริษัทด้วย', need_org: true }
        : { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const u = rows[0];

    if (!(await bcrypt.compare(password, u.password_hash))) {
      noteAttempt(key);
      await log(org, username, ip, false);
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    if (!u.active)                    return res.status(403).json({ error: 'บัญชีนี้ถูกปิดการใช้งาน' });
    if (u.org_status !== 'active')    return res.status(403).json({ error: 'บริษัทนี้ถูกระงับการใช้งาน' });
    if (u.expires_at && new Date(u.expires_at) < new Date())
      return res.status(403).json({ error: 'แพ็กเกจหมดอายุแล้ว กรุณาต่ออายุ' });

    await pool.query('UPDATE users SET last_login_at = now() WHERE id = $1', [u.id]);
    await log(org, username, ip, true);
    attempts.delete(key);

    res.json({
      token: signToken(u),
      expires_in: TTL_HOURS * 3600,
      user: {
        id: u.id, username: u.username, display_name: u.display_name,
        role: u.role, org_id: u.org_id,
        must_change_password: u.must_change_password,
      },
    });
  } catch (e) {
    console.error('login error:', e.message);
    res.status(500).json({ error: 'ระบบขัดข้อง' });
  }
});

// ── ตรวจ token สำหรับ endpoint ที่ต้องล็อกอิน ────────────────
function auth(req, res, next) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return res.status(401).json({ error: 'ต้องล็อกอินก่อน' });
  try {
    req.claims = jwt.verify(h.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'token หมดอายุหรือไม่ถูกต้อง' });
  }
}

app.get('/me', auth, (req, res) => res.json({
  user_id: req.claims.user_id, username: req.claims.username,
  org_id:  req.claims.org_id,  role: req.claims.user_role,
  expires_at: new Date(req.claims.exp * 1000).toISOString(),
}));

// ────────────────────────────────────────────────────────────
// POST /change-password   { current_password, new_password }
// ────────────────────────────────────────────────────────────
app.post('/change-password', auth, async (req, res) => {
  const { current_password, new_password } = req.body || {};
  if (!new_password || new_password.length < 8)
    return res.status(400).json({ error: 'รหัสผ่านใหม่ต้องยาวอย่างน้อย 8 ตัวอักษร' });

  try {
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1',
                                      [req.claims.user_id]);
    if (!rows.length) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    if (!(await bcrypt.compare(current_password || '', rows[0].password_hash)))
      return res.status(401).json({ error: 'รหัสผ่านเดิมไม่ถูกต้อง' });

    await pool.query(
      'UPDATE users SET password_hash = $1, must_change_password = false WHERE id = $2',
      [await bcrypt.hash(new_password, 10), req.claims.user_id]);
    res.json({ ok: true });
  } catch (e) {
    console.error('change-password error:', e.message);
    res.status(500).json({ error: 'ระบบขัดข้อง' });
  }
});

// ────────────────────────────────────────────────────────────
// POST /users — แอดมินของบริษัทเพิ่มผู้ใช้ใหม่ (จำกัดตามที่นั่ง)
// ────────────────────────────────────────────────────────────
app.post('/users', auth, async (req, res) => {
  if (req.claims.user_role !== 'admin')
    return res.status(403).json({ error: 'เฉพาะแอดมินเท่านั้น' });

  const { username, display_name, role = 'staff' } = req.body || {};
  if (!username) return res.status(400).json({ error: 'ต้องระบุชื่อผู้ใช้' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [org] } = await client.query(
      'SELECT seat_limit FROM orgs WHERE id = $1 FOR UPDATE', [req.claims.org_id]);
    const { rows: [{ n }] } = await client.query(
      'SELECT count(*)::int AS n FROM users WHERE org_id = $1', [req.claims.org_id]);

    if (n >= org.seat_limit) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: `ที่นั่งเต็มแล้ว (${org.seat_limit} คน) กรุณาอัปเกรดแพ็กเกจ` });
    }

    const pw = crypto.randomBytes(9).toString('base64url');
    const id = 'u_' + crypto.randomBytes(6).toString('hex');
    await client.query(
      `INSERT INTO users (id, org_id, username, password_hash, display_name, role, must_change_password)
       VALUES ($1,$2,$3,$4,$5,$6,true)`,
      [id, req.claims.org_id, username, await bcrypt.hash(pw, 10), display_name ?? null, role]);
    await client.query('COMMIT');

    // คืนรหัสผ่านครั้งเดียวเท่านั้น ระบบไม่เก็บไว้ให้ดูอีก
    res.json({ id, username, temp_password: pw, seats_used: n + 1, seat_limit: org.seat_limit });
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    if (e.code === '23505') return res.status(409).json({ error: 'ชื่อผู้ใช้นี้มีอยู่แล้วในบริษัท' });
    console.error('create user error:', e.message);
    res.status(500).json({ error: 'ระบบขัดข้อง' });
  } finally {
    client.release();
  }
});


/* /signup — ลูกค้าสมัครเอง ใช้ฟรีแบบ Demo ไม่มีวันหมดอายุ (5 ที่นั่ง) */
const signups = new Map();
function signupThrottled(ip) {
const now = Date.now();
const list = (signups.get(ip) || []).filter(t => now - t < 3600000);
signups.set(ip, list);
return list.length >= 3;
}
const RESERVED = new Set(['admin','api','auth','www','app','test','demo','root','support','help','billing','system']);

app.post('/signup', async (req, res) => {
const ip = req.ip;
const { company, code, username, password } = req.body || {};
// นับทุกครั้งที่พยายาม ไม่ใช่เฉพาะที่สำเร็จ
// ไม่งั้นคนร้ายยิงข้อมูลผิดรัวๆ เพื่อไล่หารหัสบริษัทที่ว่างได้ฟรี
if (signupThrottled(ip)) return res.status(429).json({ error: 'สมัครบ่อยเกินไป กรุณารออีก 1 ชั่วโมง' });
signups.set(ip, [...(signups.get(ip) || []), Date.now()]);
const errs = [];
if (!company || String(company).trim().length < 2) errs.push('กรุณากรอกชื่อบริษัท');
if (!code || !/^[a-z0-9][a-z0-9-]{2,19}$/.test(String(code).toLowerCase())) errs.push('รหัสบริษัทต้องเป็น a-z 0-9 ยาว 3-20 ตัว');
if (RESERVED.has(String(code || '').toLowerCase())) errs.push('รหัสบริษัทนี้สงวนไว้');
if (!username || !/^[A-Za-z0-9._-]{3,30}$/.test(String(username))) errs.push('ชื่อผู้ใช้ต้องเป็น a-z 0-9 . _ - ยาว 3-30 ตัว');
if (!password || String(password).length < 8) errs.push('รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร');
if (errs.length) return res.status(400).json({ error: errs[0], errors: errs });
const orgCode = String(code).toLowerCase();
const client = await pool.connect();
try {
await client.query('BEGIN');
const dup = await client.query('SELECT 1 FROM orgs WHERE lower(code) = $1', [orgCode]);
if (dup.rows.length) { await client.query('ROLLBACK'); return res.status(409).json({ error: 'รหัสบริษัทนี้มีคนใช้แล้ว กรุณาเลือกใหม่', field: 'code' }); }
const orgId = 'org_' + crypto.randomBytes(5).toString('hex');
const uid = 'u_' + crypto.randomBytes(6).toString('hex');
await client.query("INSERT INTO orgs (id, code, name, plan, seat_limit, status, expires_at) VALUES ($1, $2, $3, 'demo', 5, 'active', NULL)", [orgId, orgCode, String(company).trim()]);
await client.query("INSERT INTO users (id, org_id, username, password_hash, role, must_change_password) VALUES ($1, $2, $3, $4, 'admin', false)", [uid, orgId, username, await bcrypt.hash(password, 10)]);
await client.query('COMMIT');
// ล็อกอินให้เลย ลูกค้าเข้าใช้งานได้ทันที
const token = signToken({ id: uid, org_id: orgId, username: username, role: 'admin' });
res.json({ token: token, expires_in: TTL_HOURS * 3600, user: { id: uid, username: username, role: 'admin', org_id: orgId, must_change_password: false }, org: { id: orgId, code: orgCode, name: String(company).trim(), plan: 'demo', seat_limit: 5 } });
} catch (e) {
await client.query('ROLLBACK').catch(() => {});
if (e.code === '23505') return res.status(409).json({ error: 'รหัสบริษัทหรือชื่อผู้ใช้นี้มีอยู่แล้ว' });
console.error('signup error:', e.message);
res.status(500).json({ error: 'ระบบขัดข้อง กรุณาลองใหม่' });
} finally { client.release(); }
});

app.get('/check-code', async (req, res) => {
const code = String(req.query.code || '').toLowerCase();
if (!/^[a-z0-9][a-z0-9-]{2,19}$/.test(code) || RESERVED.has(code)) return res.json({ available: false, reason: 'invalid' });
try { const r = await pool.query('SELECT 1 FROM orgs WHERE lower(code) = $1', [code]); res.json({ available: r.rows.length === 0 }); }
catch { res.json({ available: null }); }
});

// ════════════════════════════════════════════════════════════
// การสั่งซื้อและอนุมัติ
// ════════════════════════════════════════════════════════════

/* ── PromptPay QR ────────────────────────────────────────────
   สร้าง payload ตามมาตรฐาน EMVCo เอง ไม่ต้องพึ่งไลบรารีภายนอก
   โครงเป็น TLV: แท็ก 2 หลัก + ความยาว 2 หลัก + ค่า  ปิดท้ายด้วย CRC */
function tlv(tag, value) {
  return tag + String(value.length).padStart(2, '0') + value;
}
function crc16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
function promptpayPayload(target, amount) {
  const id = String(target).replace(/\D/g, '');
  let acc;
  if (id.length === 13) acc = tlv('02', id);                       // เลขบัตรประชาชน / นิติบุคคล
  else if (id.length === 10) acc = tlv('01', '0066' + id.slice(1)); // เบอร์มือถือ 0812345678 → 0066812345678
  else throw new Error('PROMPTPAY_ID ต้องเป็นเบอร์มือถือ 10 หลัก หรือเลข 13 หลัก');

  const body =
      tlv('00', '01')                                  // เวอร์ชัน payload
    + tlv('01', '12')                                  // 12 = ใช้ครั้งเดียว (มียอดกำกับ)
    + tlv('29', tlv('00', 'A000000677010111') + acc)   // AID ของพร้อมเพย์
    + tlv('53', '764')                                 // สกุลเงินบาท
    + tlv('54', amount.toFixed(2))
    + tlv('58', 'TH');
  const withTag = body + '6304';                       // ต้องรวมแท็ก CRC ก่อนคำนวณ
  return withTag + crc16(withTag);
}

/* ยอดลงท้ายไม่ซ้ำ — ผูกสตางค์กับเลขออเดอร์ จับคู่รายการโอนได้แม่นแม้ตรวจด้วยมือ */
function orderAmount(price, orderId) {
  let h = 0;
  for (let i = 0; i < orderId.length; i++) h = (h * 31 + orderId.charCodeAt(i)) >>> 0;
  return price + (h % 99 + 1) / 100;   // .01 ถึง .99 ไม่มี .00 จะได้ไม่ชนยอดกลม
}

/* ── POST /orders  { plan } ──────────────────────────────────
   org_id อ่านจาก token เท่านั้น ห้ามรับจาก body เด็ดขาด */
app.post('/orders', auth, async (req, res) => {
  if (req.claims.user_role !== 'admin')
    return res.status(403).json({ error: 'เฉพาะแอดมินของบริษัทเท่านั้นที่สั่งซื้อได้' });

  const plan = String(req.body?.plan || '');
  const spec = PLANS[plan];
  if (!spec) return res.status(400).json({ error: 'ไม่รู้จักแพ็กเกจนี้' });
  if (!PROMPTPAY) return res.status(503).json({ error: 'ระบบยังไม่เปิดรับชำระเงิน กรุณาติดต่อทีมงาน' });

  try {
    const { rows: [open] } = await pool.query(
      `SELECT id FROM orders WHERE org_id = $1 AND status IN ('waiting','checking') LIMIT 1`,
      [req.claims.org_id]);
    if (open) return res.status(409).json({ error: 'มีคำสั่งซื้อที่ยังไม่เสร็จอยู่แล้ว', order_id: open.id });

    const id = 'ord_' + crypto.randomBytes(5).toString('hex');
    const amount = orderAmount(spec.price, id);
    await pool.query(
      `INSERT INTO orders (id, org_id, plan, amount, status, created_by)
       VALUES ($1, $2, $3, $4, 'waiting', $5)`,
      [id, req.claims.org_id, plan, amount, req.claims.user_id]);

    res.json({
      id, plan, plan_label: spec.label, amount,
      qr: promptpayPayload(PROMPTPAY, amount),
      promptpay: PROMPTPAY,
      status: 'waiting',
    });
  } catch (e) {
    console.error('create order error:', e.message);
    res.status(500).json({ error: 'ระบบขัดข้อง กรุณาลองใหม่' });
  }
});

/* ── GET /orders — ออเดอร์ของบริษัทตัวเอง ────────────────────
   ไม่ส่งรูปสลิปกลับ เปลืองเน็ตเปล่า ๆ */
app.get('/orders', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, plan, amount, status, note, created_at, paid_at
         FROM orders WHERE org_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [req.claims.org_id]);
    res.json(rows);
  } catch (e) {
    console.error('list orders error:', e.message);
    res.status(500).json({ error: 'ระบบขัดข้อง' });
  }
});

/* ── POST /orders/:id/slip  { image } ────────────────────────
   image เป็น data URL ที่ย่อมาแล้วจากเบราว์เซอร์ */
app.post('/orders/:id/slip', auth, slipBody, async (req, res) => {
  const img = String(req.body?.image || '');
  if (!/^data:image\/(jpeg|png|webp);base64,/.test(img))
    return res.status(400).json({ error: 'ไฟล์ต้องเป็นรูปภาพ' });
  if (img.length > 700_000)
    return res.status(413).json({ error: 'รูปใหญ่เกินไป ลองถ่ายใหม่หรือย่อขนาดก่อน' });

  try {
    const { rowCount } = await pool.query(
      `UPDATE orders SET slip_image = $1, status = 'checking'
        WHERE id = $2 AND org_id = $3 AND status IN ('waiting','checking')`,
      [img, req.params.id, req.claims.org_id]);
    if (!rowCount) return res.status(404).json({ error: 'ไม่พบคำสั่งซื้อนี้ หรือตรวจสอบเสร็จแล้ว' });
    res.json({ ok: true, status: 'checking' });
  } catch (e) {
    console.error('upload slip error:', e.message);
    res.status(500).json({ error: 'ระบบขัดข้อง' });
  }
});

/* ── หน้าอนุมัติของทีมงาน ────────────────────────────────────
   ใช้กุญแจแยกจากระบบล็อกอินลูกค้า เทียบแบบ timing-safe */
function adminOnly(req, res, next) {
  const key = String(req.headers['x-admin-key'] || '');
  const a = Buffer.from(key), b = Buffer.from(ADMIN_KEY);
  if (!ADMIN_KEY || ADMIN_KEY.length < 24)
    return res.status(503).json({ error: 'ยังไม่ได้ตั้ง ADMIN_KEY บนเซิร์ฟเวอร์' });
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b))
    return res.status(401).json({ error: 'กุญแจไม่ถูกต้อง' });
  next();
}

app.get('/admin/orders', adminOnly, async (req, res) => {
  const only = String(req.query.status || 'checking');
  try {
    const { rows } = await pool.query(
      `SELECT o.id, o.org_id, o.plan, o.amount, o.status, o.note, o.slip_image,
              o.created_at, o.paid_at, g.code AS org_code, g.name AS org_name
         FROM orders o JOIN orgs g ON g.id = o.org_id
        WHERE ($1 = 'all' OR o.status = $1)
        ORDER BY o.created_at DESC LIMIT 100`, [only]);
    res.json(rows);
  } catch (e) {
    console.error('admin list error:', e.message);
    res.status(500).json({ error: 'ระบบขัดข้อง' });
  }
});

/* อนุมัติ — ปิดออเดอร์กับขยายเพดานต้องอยู่ใน transaction เดียวกัน
   เงื่อนไข status='checking' ทำให้กดซ้ำไม่เกิดผลสองรอบ */
app.post('/admin/orders/:id/approve', adminOnly, async (req, res) => {
  const ref = req.body?.slip_ref ? String(req.body.slip_ref).trim() : null;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [o] } = await client.query(
      `SELECT id, org_id, plan FROM orders
        WHERE id = $1 AND status = 'checking' FOR UPDATE`, [req.params.id]);
    if (!o) { await client.query('ROLLBACK'); return res.status(409).json({ error: 'ออเดอร์นี้ไม่ได้อยู่ระหว่างตรวจสอบ (อาจอนุมัติไปแล้ว)' }); }

    const spec = PLANS[o.plan];
    if (!spec) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'ไม่รู้จักแพ็กเกจของออเดอร์นี้' }); }

    await client.query(
      `UPDATE orders SET status='paid', slip_ref=$1, paid_at=now() WHERE id=$2`, [ref, o.id]);
    await client.query(
      `UPDATE orgs SET plan=$1, seat_limit=$2, item_limit=$3 WHERE id=$4`,
      [o.plan, spec.seats, spec.items, o.org_id]);
    await client.query('COMMIT');

    res.json({ ok: true, org_id: o.org_id, plan: o.plan, seat_limit: spec.seats, item_limit: spec.items });
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    if (e.code === '23505') return res.status(409).json({ error: 'สลิปใบนี้ถูกใช้ไปแล้วกับออเดอร์อื่น' });
    console.error('approve error:', e.message);
    res.status(500).json({ error: 'ระบบขัดข้อง' });
  } finally { client.release(); }
});

app.post('/admin/orders/:id/reject', adminOnly, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `UPDATE orders SET status='rejected', note=$1
        WHERE id=$2 AND status='checking'`,
      [String(req.body?.note || 'ตรวจสอบสลิปไม่ผ่าน'), req.params.id]);
    if (!rowCount) return res.status(409).json({ error: 'ออเดอร์นี้ไม่ได้อยู่ระหว่างตรวจสอบ' });
    res.json({ ok: true });
  } catch (e) {
    console.error('reject error:', e.message);
    res.status(500).json({ error: 'ระบบขัดข้อง' });
  }
});

app.get('/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true }); }
  catch { res.status(503).json({ ok: false }); }
});

/* body-parser ปฏิเสธไฟล์ใหญ่ก่อนเข้า route ถ้าไม่ดักตรงนี้ลูกค้าจะได้ HTML ไม่ใช่ข้อความไทย */
app.use((err, _req, res, _next) => {
  if (err && err.type === 'entity.too.large')
    return res.status(413).json({ error: 'ไฟล์ใหญ่เกินไป ลองถ่ายสลิปใหม่หรือย่อขนาดก่อน' });
  console.error('unhandled:', err && err.message);
  res.status(500).json({ error: 'ระบบขัดข้อง' });
});

await migrate();
app.listen(PORT, () => console.log(`auth service listening on ${PORT}`));
