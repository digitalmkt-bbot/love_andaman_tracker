#!/usr/bin/env node
// seed-org.mjs — เปิดบริษัทลูกค้าใหม่ + ผู้ใช้แอดมิน
//
// railway run --service auth-clone node auth/seed-org.mjs --name "บริษัท ก." --code toura --admin somchai
// railway run --service auth-clone node auth/seed-org.mjs --org org_la --admin nok --role staff
//
// --plan trial|starter|business|enterprise   --seats N   --days N   --role admin|staff|viewer
// ไม่ใส่ --pass = สุ่มรหัสให้ แสดงครั้งเดียว ระบบไม่เก็บไว้ให้ดูอีก
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const a = Object.fromEntries(process.argv.slice(2).reduce((x,c,i,r) => { if (c.startsWith('--')) x.push([c.slice(2), r[i+1]]); return x; }, []));
const SEATS = { trial:5, starter:5, business:20, enterprise:100 };

if (!a.admin) {
  console.error('ใช้: --admin <ชื่อผู้ใช้> [--name "บริษัท" --code รหัส] [--org org_xxx]');
  process.exit(2);
}

const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: /railway|amazonaws/.test(process.env.DATABASE_URL || '') ? { rejectUnauthorized:false } : undefined
});

await db.connect();

try {
  await db.query('BEGIN');

let orgId = a.org;
  let code = a.code;

if (!orgId) {
  if (!a.name || !a.code) throw new Error('บริษัทใหม่ต้องมี --name และ --code');
  const plan = a.plan || 'starter';
  orgId = 'org_' + crypto.randomBytes(4).toString('hex');
  await db.query(
    'INSERT INTO orgs (id,code,name,plan,seat_limit,status,expires_at) VALUES ($1,$2,$3,$4,$5,\'active\', CASE WHEN $6::int IS NULL THEN NULL ELSE now() + ($6 || \' days\')::interval END)',
    [orgId, a.code.toLowerCase(), a.name, plan, Number(a.seats || SEATS[plan]), a.days ? Number(a.days) : null]
    );
} else {
  const r = await db.query('SELECT code FROM orgs WHERE id=$1', [orgId]);
  if (!r.rows.length) throw new Error('ไม่พบ org ' + orgId);
  code = r.rows[0].code;
}

const orgRow = await db.query('SELECT seat_limit FROM orgs WHERE id=$1 FOR UPDATE', [orgId]);
  const cntRow = await db.query('SELECT count(*)::int AS n FROM users WHERE org_id=$1', [orgId]);
  const seatLimit = orgRow.rows[0].seat_limit;
  const used = cntRow.rows[0].n;
  if (used >= seatLimit) throw new Error('ที่นั่งเต็ม (' + seatLimit + ' คน) กรุณาอัปเกรดแพ็กเกจ');

const pass = a.pass || crypto.randomBytes(9).toString('base64url');
  const uid = 'u_' + crypto.randomBytes(6).toString('hex');
  const hash = await bcrypt.hash(pass, 10);

await db.query(
  'INSERT INTO users (id,org_id,username,password_hash,role,must_change_password) VALUES ($1,$2,$3,$4,$5,$6)',
  [uid, orgId, a.admin, hash, a.role || 'admin', !a.pass]
  );

await db.query('COMMIT');

console.log('');
  console.log('✅ เรียบร้อย');
  console.log('   org id      ' + orgId);
  console.log('   รหัสบริษัท   ' + code + '   <- ใช้ตอนล็อกอิน');
  console.log('   ผู้ใช้       ' + a.admin);
  console.log('   รหัสผ่าน     ' + pass);
  console.log('   ที่นั่ง       ' + (used + 1) + '/' + seatLimit);
  console.log('');
  console.log('   จดรหัสผ่านไว้เดี๋ยวนี้ ระบบไม่แสดงอีก');
  console.log('');
} catch (e) {
  await db.query('ROLLBACK').catch(() => {});
  console.error('❌ ' + e.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
