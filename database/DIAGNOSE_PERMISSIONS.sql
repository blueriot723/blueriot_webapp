-- ═══════════════════════════════════════════════════
-- DIAGNOSTIC: Check all permissions for anon/authenticated
-- ═══════════════════════════════════════════════════

-- 1. Check schema permissions
SELECT
    grantee,
    privilege_type
FROM information_schema.usage_privileges
WHERE object_schema = 'public'
    AND grantee IN ('anon', 'authenticated', 'public')
ORDER BY grantee;

-- 2. Check table permissions (focus on tl_users)
SELECT
    grantee,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
    AND table_name IN ('tl_users', 'blueriot_tastes', 'restaurant_ratings')
    AND grantee IN ('anon', 'authenticated', 'public')
ORDER BY table_name, grantee, privilege_type;

-- 3. Check RLS status on critical tables
SELECT
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('tl_users', 'blueriot_tastes', 'restaurant_ratings');

-- 4. Check existing RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    cmd as "Command",
    roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- ═══════════════════════════════════════════════════
