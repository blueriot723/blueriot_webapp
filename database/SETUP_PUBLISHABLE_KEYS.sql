-- ═══════════════════════════════════════════════════
-- SETUP COMPLETO per Publishable/Secret Keys
-- ═══════════════════════════════════════════════════
-- Questo script configura tutti i permessi necessari
-- per far funzionare il nuovo sistema Publishable/Secret keys
-- ═══════════════════════════════════════════════════

-- STEP 1: Disabilita RLS su tl_users (temporaneo per login)
ALTER TABLE tl_users DISABLE ROW LEVEL SECURITY;

-- STEP 2: GRANT permessi su schema public
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO public;

-- STEP 3: GRANT permessi su tl_users (CRITICO per login)
GRANT SELECT ON tl_users TO anon;
GRANT SELECT ON tl_users TO authenticated;
GRANT SELECT ON tl_users TO public;
GRANT INSERT, UPDATE, DELETE ON tl_users TO authenticated;

-- STEP 4: GRANT permessi su blueriot_tastes
GRANT SELECT ON blueriot_tastes TO anon;
GRANT SELECT ON blueriot_tastes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON blueriot_tastes TO authenticated;

-- STEP 5: GRANT permessi su restaurant_ratings
GRANT SELECT ON restaurant_ratings TO anon;
GRANT SELECT ON restaurant_ratings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON restaurant_ratings TO authenticated;

-- STEP 6: GRANT permessi su TUTTE le altre tabelle
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- STEP 7: GRANT permessi su sequenze (per auto-increment)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- STEP 8: Default privileges per tabelle future
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;

-- ═══════════════════════════════════════════════════
-- VERIFICA PERMESSI
-- ═══════════════════════════════════════════════════

-- Verifica permessi su tl_users
SELECT
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
    AND table_name = 'tl_users'
    AND grantee IN ('anon', 'authenticated', 'public')
ORDER BY grantee, privilege_type;

-- Verifica permessi su blueriot_tastes
SELECT
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
    AND table_name = 'blueriot_tastes'
    AND grantee IN ('anon', 'authenticated', 'public')
ORDER BY grantee, privilege_type;

-- Verifica RLS status
SELECT
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('tl_users', 'blueriot_tastes', 'restaurant_ratings');

-- ═══════════════════════════════════════════════════
-- ✅ DONE!
-- ═══════════════════════════════════════════════════
-- Dopo aver eseguito questo SQL:
-- 1. Le Publishable/Secret keys dovrebbero funzionare
-- 2. Il login dovrebbe essere sbloccato
-- 3. TASTES dovrebbe funzionare
--
-- Se continua a dare PGRST002, potrebbe essere necessario:
-- - Riavviare il progetto Supabase (Settings → General → Pause/Restore)
-- - Aspettare 2-3 minuti per propagazione
-- ═══════════════════════════════════════════════════
