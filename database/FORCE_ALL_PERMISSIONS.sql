-- ═══════════════════════════════════════════════════
-- FORCE ALL PERMISSIONS - Complete fix for PGRST002
-- ═══════════════════════════════════════════════════
-- This script grants ALL necessary permissions explicitly
-- Execute this to fix login and schema cache errors
-- ═══════════════════════════════════════════════════

-- STEP 1: Grant USAGE on schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO public;

-- STEP 2: Grant permissions on tl_users (CRITICAL for login)
GRANT SELECT ON tl_users TO anon;
GRANT SELECT ON tl_users TO authenticated;
GRANT SELECT ON tl_users TO public;

-- STEP 3: Grant permissions on blueriot_tastes
GRANT SELECT ON blueriot_tastes TO anon;
GRANT SELECT ON blueriot_tastes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON blueriot_tastes TO authenticated;

-- STEP 4: Grant permissions on restaurant_ratings
GRANT SELECT ON restaurant_ratings TO anon;
GRANT SELECT ON restaurant_ratings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON restaurant_ratings TO authenticated;

-- STEP 5: Grant permissions on ALL other tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- STEP 6: Grant sequence permissions (needed for auto-increment IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- STEP 7: Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

-- STEP 8: Verify grants on critical tables
SELECT
    grantee,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
    AND table_name IN ('tl_users', 'blueriot_tastes', 'restaurant_ratings')
    AND grantee IN ('anon', 'authenticated', 'public')
ORDER BY table_name, grantee, privilege_type;

-- ═══════════════════════════════════════════════════
-- ✅ DONE!
-- ═══════════════════════════════════════════════════
-- After running this script:
-- 1. Wait 30-60 seconds
-- 2. OR restart your Supabase project from Dashboard
-- 3. Clear browser cache (Ctrl+Shift+Delete)
-- 4. Try login again at https://blueriot723.github.io
-- ═══════════════════════════════════════════════════
