-- ════════════════════════════════════════════════════════════
-- 05_org_limits.sql — ทำให้เพดานการใช้งานเป็นข้อมูลของแต่ละบริษัท
--
-- เดิมเพดานเป็นเลขตายตัวในหน้าเว็บ อัปเกรดแล้วจึงไม่มีผลอะไร
-- ย้ายมาเก็บที่ตาราง orgs แอปจะอ่านของตัวเองไปใช้
--
-- รันหลัง 04_demo_plan.sql · รันซ้ำได้ ไม่พัง
-- ════════════════════════════════════════════════════════════

BEGIN;

-- จำนวนงานรวมทุกหัวข้อ (tasks + posts + jobs) ที่บริษัทนี้ใส่ได้
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS item_limit INT NOT NULL DEFAULT 50;

-- เติมค่าตามแพ็กเกจ
-- seat_limit ไม่แตะ ของเดิมตั้งไว้เท่าไรคงไว้เท่านั้น (บางรายอาจตกลงจำนวนพิเศษไว้)
UPDATE orgs SET item_limit =     50 WHERE plan = 'demo';
UPDATE orgs SET item_limit =   1000 WHERE plan = 'starter';
UPDATE orgs SET item_limit =   2000 WHERE plan = 'business';
UPDATE orgs SET item_limit = 999999 WHERE plan = 'enterprise';

COMMIT;

-- ── ตอนอนุมัติการชำระเงิน ให้รันประมาณนี้ ───────────────────
--   UPDATE orgs SET plan='starter',  seat_limit=10, item_limit=1000 WHERE id=$1;
--   UPDATE orgs SET plan='business', seat_limit=20, item_limit=2000 WHERE id=$1;
-- แอป poll ทุก 15 วินาที เพดานจะขยายเองโดยลูกค้าไม่ต้องออกจากระบบ
