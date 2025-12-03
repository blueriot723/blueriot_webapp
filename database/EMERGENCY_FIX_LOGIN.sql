-- ═══════════════════════════════════════════════════
-- FIX EMERGENZA - Risolve login PGRST002
-- ═══════════════════════════════════════════════════
-- Questo script risolve il problema forzando l'accesso
-- completo alla tabella tl_users e resettando RLS
-- ═══════════════════════════════════════════════════

-- STEP 1: Disabilita temporaneamente RLS su tl_users
-- (così possiamo fare login mentre indaghiamo)
ALTER TABLE tl_users DISABLE ROW LEVEL SECURITY;

-- STEP 2: Forza GRANT su tl_users (anche se già fatto)
GRANT ALL ON tl_users TO anon;
GRANT ALL ON tl_users TO authenticated;
GRANT ALL ON tl_users TO public;

-- STEP 3: Forza GRANT su schema public
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO public;

-- STEP 4: Forza GRANT su tutte le tabelle
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- STEP 5: Forza GRANT su sequenze
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- STEP 6: Verifica che ora tl_users sia accessibile
SELECT
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
    AND table_name = 'tl_users'
    AND grantee IN ('anon', 'authenticated', 'public')
ORDER BY grantee, privilege_type;

-- ═══════════════════════════════════════════════════
-- ✅ FATTO!
-- ═══════════════════════════════════════════════════
-- Dopo aver eseguito questo:
-- 1. NON serve restart di Supabase
-- 2. Aspetta 10-20 secondi
-- 3. Ricarica il sito e prova login
--
-- Se funziona: il problema era RLS su tl_users
-- (poi lo riabiliteremo con policy corrette)
-- ═══════════════════════════════════════════════════
