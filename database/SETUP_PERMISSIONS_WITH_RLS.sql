-- ═══════════════════════════════════════════════════
-- SETUP PERMESSI - MANTIENE RLS ATTIVO
-- ═══════════════════════════════════════════════════
-- Questo script configura i permessi SENZA disabilitare RLS
-- ═══════════════════════════════════════════════════

-- GRANT permessi su schema public
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- GRANT permessi su TUTTE le tabelle
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- GRANT permessi su sequenze (per auto-increment)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Default privileges per tabelle future
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;

-- ═══════════════════════════════════════════════════
-- POLICY RLS per tl_users
-- ═══════════════════════════════════════════════════

-- Assicurati che RLS sia ATTIVO
ALTER TABLE tl_users ENABLE ROW LEVEL SECURITY;

-- Drop policy esistenti
DROP POLICY IF EXISTS "Anyone can view TL users" ON tl_users;
DROP POLICY IF EXISTS "Authenticated can read own profile" ON tl_users;

-- Policy 1: Tutti possono leggere (pubblico)
CREATE POLICY "Anyone can view TL users"
    ON tl_users FOR SELECT
    TO public
    USING (true);

-- Policy 2: Authenticated possono aggiornare proprio profilo
CREATE POLICY "Authenticated can update own profile"
    ON tl_users FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════
-- VERIFICA
-- ═══════════════════════════════════════════════════

-- Verifica permessi
SELECT
    grantee,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
    AND table_name IN ('tl_users', 'blueriot_tastes', 'restaurant_ratings')
    AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;

-- Verifica RLS status
SELECT
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('tl_users', 'blueriot_tastes', 'restaurant_ratings');

-- Verifica policies
SELECT
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'tl_users';

-- ═══════════════════════════════════════════════════
-- ✅ DONE - RLS RIMANE ATTIVO!
-- ═══════════════════════════════════════════════════
