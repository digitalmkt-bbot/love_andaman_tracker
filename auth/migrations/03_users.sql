-- ════════════════════════════════════════════════════════════
-- 03_users.sql — ตารางผู้ใช้สำหรับ service ออก JWT
--
-- รันหลัง 02_rls_jwt.sql
-- ตารางนี้ตั้งใจให้ PostgREST มองไม่เห็น เพราะไม่ควรมีใคร
-- อ่าน password_hash ผ่าน REST API ได้ ต่อให้มี token ก็ตาม
-- ════════════════════════════════════════════════════════════

BEGIN;

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  org_id        TEXT        NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  username      TEXT        NOT NULL,
  password_hash TEXT        NOT NULL,
  display_name  TEXT,
  role          TEXT        NOT NULL DEFAULT 'staff',
  active        BOOLEAN     NOT NULL DEFAULT true,
  must_change_password BOOLEAN NOT NULL DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT users_role_chk CHECK (role IN ('admin','staff','viewer'))
);

-- ชื่อผู้ใช้ซ้ำข้ามบริษัทได้ แต่ห้ามซ้ำภายในบริษัทเดียวกัน
-- (บริษัท ก. และ ข. ตั้งชื่อ 'admin' ได้ทั้งคู่)
CREATE UNIQUE INDEX IF NOT EXISTS users_org_username_uidx
  ON users (org_id, lower(username));

CREATE INDEX IF NOT EXISTS users_org_idx ON users (org_id);

-- ── กัน PostgREST แตะตารางนี้เด็ดขาด ────────────────────────
-- password_hash ต้องไม่มีทางหลุดออกทาง REST API
REVOKE ALL ON TABLE users FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN
    REVOKE ALL ON TABLE users FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='app_user') THEN
    REVOKE ALL ON TABLE users FROM app_user;
  END IF;
END $$;

-- ── บันทึกการล็อกอินที่ล้มเหลว ไว้ดูว่ามีคนพยายามเดารหัสไหม ──
CREATE TABLE IF NOT EXISTS login_attempts (
  id         BIGSERIAL PRIMARY KEY,
  org_code   TEXT,
  username   TEXT,
  ip         TEXT,
  ok         BOOLEAN NOT NULL,
  at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS login_attempts_at_idx ON login_attempts (at DESC);
REVOKE ALL ON TABLE login_attempts FROM PUBLIC;

COMMIT;
