-- ═══════════════════════════════════════════════════
-- Fix schema permissions for PostgREST
-- ═══════════════════════════════════════════════════
-- ERROR: DB:could not query the database for the scheme cache (PGRST02)
-- This happens when anon/authenticated roles can't read schema metadata
-- ═══════════════════════════════════════════════════

-- Grant USAGE on public schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant SELECT on all tables in public schema
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant SELECT on all sequences (needed for INSERT with auto-increment)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Make sure future tables also get these permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

-- Verify grants
SELECT
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
    AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, table_name, privilege_type;

-- ═══════════════════════════════════════════════════
-- ✅ DONE!
-- ═══════════════════════════════════════════════════
-- After running this, you may need to:
-- 1. Restart Supabase project (or wait a few minutes)
-- 2. Clear browser cache and reload the app
-- ═══════════════════════════════════════════════════
