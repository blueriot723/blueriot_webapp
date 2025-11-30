-- ═══════════════════════════════════════════════════
-- 🔧 FIX NODΞ Tables - Add Missing Columns
-- ═══════════════════════════════════════════════════
-- This script fixes existing NODΞ tables by adding missing columns
-- Safe to run multiple times (uses IF NOT EXISTS where possible)
-- ═══════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════
-- OPTION 1: Add Missing Columns (SAFE - keeps data)
-- ═══════════════════════════════════════════════════

-- Fix tour_days table - add missing columns
DO $$
BEGIN
    -- Add hotel_id if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='tour_days' AND column_name='hotel_id') THEN
        ALTER TABLE tour_days ADD COLUMN hotel_id UUID;
    END IF;

    -- Add tastes_ids if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='tour_days' AND column_name='tastes_ids') THEN
        ALTER TABLE tour_days ADD COLUMN tastes_ids UUID[];
    END IF;

    -- Add routes_ids if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='tour_days' AND column_name='routes_ids') THEN
        ALTER TABLE tour_days ADD COLUMN routes_ids UUID[];
    END IF;

    -- Add ticket_ids if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='tour_days' AND column_name='ticket_ids') THEN
        ALTER TABLE tour_days ADD COLUMN ticket_ids UUID[];
    END IF;

    -- Add other potentially missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='tour_days' AND column_name='is_hiking_day') THEN
        ALTER TABLE tour_days ADD COLUMN is_hiking_day BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='tour_days' AND column_name='cities') THEN
        ALTER TABLE tour_days ADD COLUMN cities TEXT[];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='tour_days' AND column_name='morning_schedule') THEN
        ALTER TABLE tour_days ADD COLUMN morning_schedule TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='tour_days' AND column_name='afternoon_schedule') THEN
        ALTER TABLE tour_days ADD COLUMN afternoon_schedule TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='tour_days' AND column_name='evening_schedule') THEN
        ALTER TABLE tour_days ADD COLUMN evening_schedule TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='tour_days' AND column_name='notes') THEN
        ALTER TABLE tour_days ADD COLUMN notes TEXT;
    END IF;
END $$;

-- ═══════════════════════════════════════════════════
-- OPTION 2: Clean Slate - Drop & Recreate (⚠️ DELETES DATA)
-- ═══════════════════════════════════════════════════
-- Uncomment this section ONLY if you want to start fresh
-- WARNING: This will DELETE ALL DATA in NODΞ tables!
-- ═══════════════════════════════════════════════════

/*
-- Drop tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS day_items CASCADE;
DROP TABLE IF EXISTS eticket_imports CASCADE;
DROP TABLE IF EXISTS vcard_imports CASCADE;
DROP TABLE IF EXISTS weather_cache CASCADE;
DROP TABLE IF EXISTS nodex_settings CASCADE;
DROP TABLE IF EXISTS tour_days CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;

-- Now run the NODEX_TABLES_ONLY.sql script to recreate them
*/

-- ═══════════════════════════════════════════════════
-- VERIFICATION: Check all columns exist
-- ═══════════════════════════════════════════════════

SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('tour_days', 'day_items', 'tickets', 'eticket_imports',
                     'weather_cache', 'vcard_imports', 'nodex_settings')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ═══════════════════════════════════════════════════
-- Check specifically for the missing columns
-- ═══════════════════════════════════════════════════

SELECT
    'tour_days' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='tour_days' AND column_name='hotel_id')
         THEN '✅ hotel_id exists'
         ELSE '❌ hotel_id MISSING'
    END as status
UNION ALL
SELECT
    'tour_days',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='tour_days' AND column_name='tastes_ids')
         THEN '✅ tastes_ids exists'
         ELSE '❌ tastes_ids MISSING'
    END
UNION ALL
SELECT
    'tour_days',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='tour_days' AND column_name='routes_ids')
         THEN '✅ routes_ids exists'
         ELSE '❌ routes_ids MISSING'
    END
UNION ALL
SELECT
    'tour_days',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='tour_days' AND column_name='ticket_ids')
         THEN '✅ ticket_ids exists'
         ELSE '❌ ticket_ids MISSING'
    END;

-- ═══════════════════════════════════════════════════
-- SUCCESS! ✅
-- ═══════════════════════════════════════════════════
-- All missing columns should now be added to tour_days
-- Verification query above shows status of all columns
-- ═══════════════════════════════════════════════════
