-- ════════════════════════════════════════════════════════════
-- 04_demo_plan.sql — เปลี่ยนจากทดลองฟรี 14 วัน เป็นแพ็กเกจ Demo ใช้ฟรีไม่มีวันหมดอายุ
--
-- รันหลัง 03_users.sql และ **ต้องรันก่อน deploy server.mjs ตัวใหม่**
-- เพราะ server ตัวใหม่จะเขียน plan = 'demo' ถ้ายังไม่รันไฟล์นี้ การสมัครจะล้มเหลว
--
-- ไฟล์นี้รันซ้ำได้ ไม่พัง
-- ════════════════════════════════════════════════════════════

BEGIN;

-- ── 1) เปิดให้ plan รับค่า 'demo' ได้ ──────────────────────
-- ไม่ทราบชื่อ constraint เดิม จึงไล่หาจากตัวที่อ้างถึงคอลัมน์ plan แล้วถอดออก
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace ns ON ns.oid = rel.relnamespace
    WHERE rel.relname = 'orgs'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%plan%'
  LOOP
    EXECUTE format('ALTER TABLE orgs DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE orgs ADD CONSTRAINT orgs_plan_chk
  CHECK (plan IN ('demo','trial','starter','business','enterprise'));

-- ── 2) ย้ายบัญชีทดลองเดิมมาเป็น Demo ───────────────────────
UPDATE orgs SET plan = 'demo' WHERE plan = 'trial';

-- ── 3) ปลดวันหมดอายุให้ทุกบัญชี ────────────────────────────
-- หมายเหตุ: บรรทัดนี้ปลดให้ "ทุก" บัญชีรวมลูกค้าที่จ่ายเงินแล้วด้วย
-- ถ้าต้องการปลดเฉพาะบัญชีฟรี ให้เปลี่ยนเป็น
--   UPDATE orgs SET expires_at = NULL WHERE plan IN ('demo','trial');
UPDATE orgs SET expires_at = NULL;

-- ── 4) แพ็กเกจ Demo นั่งได้ 5 คน ───────────────────────────
-- แตะเฉพาะ demo ไม่ยุ่งกับที่นั่งของลูกค้าที่จ่ายเงินแล้ว
UPDATE orgs SET seat_limit = 5 WHERE plan = 'demo';

COMMIT;
