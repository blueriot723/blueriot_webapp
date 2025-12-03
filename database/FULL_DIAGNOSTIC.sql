-- ═══════════════════════════════════════════════════
-- DIAGNOSI COMPLETA - Trova il problema PGRST002
-- ═══════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════
-- 1. VERIFICA CHE LE TABELLE ESISTANO
-- ═══════════════════════════════════════════════════
SELECT
    tablename as "Tabella",
    rowsecurity as "RLS Attivo"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ═══════════════════════════════════════════════════
-- 2. PERMESSI SCHEMA PUBLIC
-- ═══════════════════════════════════════════════════
SELECT
    grantee as "Ruolo",
    privilege_type as "Permesso"
FROM information_schema.usage_privileges
WHERE object_schema = 'public'
    AND grantee IN ('anon', 'authenticated', 'public', 'postgres')
ORDER BY grantee;

-- ═══════════════════════════════════════════════════
-- 3. PERMESSI SU TL_USERS (CRITICO PER LOGIN)
-- ═══════════════════════════════════════════════════
SELECT
    grantee as "Ruolo",
    privilege_type as "Permesso"
FROM information_schema.table_privileges
WHERE table_schema = 'public'
    AND table_name = 'tl_users'
    AND grantee IN ('anon', 'authenticated', 'public', 'postgres')
ORDER BY grantee, privilege_type;

-- ═══════════════════════════════════════════════════
-- 4. PERMESSI SU BLUERIOT_TASTES
-- ═══════════════════════════════════════════════════
SELECT
    grantee as "Ruolo",
    privilege_type as "Permesso"
FROM information_schema.table_privileges
WHERE table_schema = 'public'
    AND table_name = 'blueriot_tastes'
    AND grantee IN ('anon', 'authenticated', 'public', 'postgres')
ORDER BY grantee, privilege_type;

-- ═══════════════════════════════════════════════════
-- 5. PERMESSI SU RESTAURANT_RATINGS
-- ═══════════════════════════════════════════════════
SELECT
    grantee as "Ruolo",
    privilege_type as "Permesso"
FROM information_schema.table_privileges
WHERE table_schema = 'public'
    AND table_name = 'restaurant_ratings'
    AND grantee IN ('anon', 'authenticated', 'public', 'postgres')
ORDER BY grantee, privilege_type;

-- ═══════════════════════════════════════════════════
-- 6. POLICIES RLS ATTIVE
-- ═══════════════════════════════════════════════════
SELECT
    tablename as "Tabella",
    policyname as "Policy",
    cmd as "Comando",
    roles as "Ruoli"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- ═══════════════════════════════════════════════════
-- 7. RUOLI DISPONIBILI
-- ═══════════════════════════════════════════════════
SELECT
    rolname as "Ruolo",
    rolsuper as "Superuser",
    rolinherit as "Inherit",
    rolcreaterole as "Create Role",
    rolcreatedb as "Create DB"
FROM pg_roles
WHERE rolname IN ('anon', 'authenticated', 'public', 'postgres', 'authenticator')
ORDER BY rolname;

-- ═══════════════════════════════════════════════════
-- ✅ FINE DIAGNOSI
-- ═══════════════════════════════════════════════════
-- Copia TUTTI i risultati e mandali a Claude
-- ═══════════════════════════════════════════════════
