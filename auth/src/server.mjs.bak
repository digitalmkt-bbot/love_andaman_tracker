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
 * ────────────────────────────────────────────────────────────
 */

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

const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '64kb' }));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ORIGINS.includes('*')) res.set('Access-Control-Allow-Origin', '*');
  else if (origin && ORIGINS.includes(origin)) res.set('Access-Control-Allow-Origin', origin);
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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

app.get('/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true }); }
  catch { res.status(503).json({ ok: false }); }
});

app.listen(PORT, () => console.log(`auth service listening on ${PORT}`));
