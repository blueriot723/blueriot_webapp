-- ═══════════════════════════════════════════════════
-- Add missing columns for hierarchical structure and commission
-- ═══════════════════════════════════════════════════

-- Add commission_percentage if not exists
ALTER TABLE blueriot_tastes
ADD COLUMN IF NOT EXISTS commission_percentage INTEGER;

-- Verify columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'blueriot_tastes'
AND column_name IN ('country', 'region', 'city', 'commission_percentage', 'phone')
ORDER BY column_name;

-- ═══════════════════════════════════════════════════
-- ✅ FATTO!
-- ═══════════════════════════════════════════════════
