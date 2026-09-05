-- ════════════════════════════════════════════════════════════
-- 06_orders.sql — ตารางคำสั่งซื้อ + ปิดช่องอัปเกรดเอง
--
-- รันหลัง 05_org_limits.sql · รันซ้ำได้ ไม่พัง
-- ════════════════════════════════════════════════════════════

BEGIN;

CREATE TABLE IF NOT EXISTS orders (
  id          TEXT PRIMARY KEY,
  org_id      TEXT        NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  plan        TEXT        NOT NULL,
  amount      NUMERIC(10,2) NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'waiting',
  slip_image  TEXT,                    -- รูปสลิปเก็บเป็น data URL (ย่อแล้วฝั่งเบราว์เซอร์)
  slip_ref    TEXT,                    -- เลขอ้างอิงรายการจากธนาคาร / API ตรวจสลิป
  note        TEXT,                    -- เหตุผลตอนปฏิเสธ หรือบันทึกของแอดมิน
  created_by  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at     TIMESTAMPTZ,
  CONSTRAINT orders_status_chk CHECK (status IN ('waiting','checking','paid','rejected'))
);

-- สลิปใบเดียวใช้ได้ครั้งเดียว — ให้ฐานข้อมูลปฏิเสธเอง ปลอดภัยกว่าเช็กในโค้ด
-- ใช้ partial index เพราะออเดอร์ที่ยังไม่ส่งสลิปมี slip_ref เป็น NULL หลายแถวได้
CREATE UNIQUE INDEX IF NOT EXISTS orders_slip_ref_uidx
  ON orders (slip_ref) WHERE slip_ref IS NOT NULL;

CREATE INDEX IF NOT EXISTS orders_org_idx    ON orders (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status, created_at DESC);

-- ── กัน PostgREST แตะตารางนี้ ────────────────────────────────
-- การอนุมัติต้องผ่าน auth service เท่านั้น
REVOKE ALL ON TABLE orders FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon')     THEN REVOKE ALL ON TABLE orders FROM anon;     END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='app_user') THEN REVOKE ALL ON TABLE orders FROM app_user; END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='webuser')  THEN REVOKE ALL ON TABLE orders FROM webuser;  END IF;
END $$;

-- ── ปิดช่องอัปเกรดตัวเอง ─────────────────────────────────────
-- หน้าเว็บต้องอ่าน orgs ได้ (เอาชื่อบริษัทกับเพดานไปแสดง)
-- แต่ต้องเขียนไม่ได้ ไม่งั้นเปิด DevTools แล้วยิง PATCH ขยายเพดานเองได้เลย
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='webuser') THEN
    REVOKE INSERT, UPDATE, DELETE ON TABLE orgs FROM webuser;
    GRANT  SELECT ON TABLE orgs TO webuser;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='app_user') THEN
    REVOKE INSERT, UPDATE, DELETE ON TABLE orgs FROM app_user;
    GRANT  SELECT ON TABLE orgs TO app_user;
  END IF;
END $$;

COMMIT;
