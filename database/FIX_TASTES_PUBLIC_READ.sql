-- ═══════════════════════════════════════════════════
-- 🔧 FIX RLS TASTES - PERMETTI LETTURA PUBBLICA
-- ═══════════════════════════════════════════════════
-- PROBLEMA: Gli utenti non possono leggere blueriot_tastes
--           perché non sono autenticati (auth.uid() è NULL)
--
-- SOLUZIONE: Permetti lettura pubblica, ma richiedi
--            autenticazione per INSERT/UPDATE/DELETE
-- ═══════════════════════════════════════════════════

-- Rimuovi tutte le policy esistenti
DROP POLICY IF EXISTS "TLs can view all tastes" ON blueriot_tastes;
DROP POLICY IF EXISTS "TLs can insert tastes" ON blueriot_tastes;
DROP POLICY IF EXISTS "TLs can update tastes" ON blueriot_tastes;
DROP POLICY IF EXISTS "TLs can delete tastes" ON blueriot_tastes;
DROP POLICY IF EXISTS "Users can view tastes" ON blueriot_tastes;
DROP POLICY IF EXISTS "Anyone can view tastes" ON blueriot_tastes;
DROP POLICY IF EXISTS "Public read access" ON blueriot_tastes;
DROP POLICY IF EXISTS "Authenticated can insert" ON blueriot_tastes;
DROP POLICY IF EXISTS "Authenticated can update" ON blueriot_tastes;
DROP POLICY IF EXISTS "Authenticated can delete" ON blueriot_tastes;

-- Abilita RLS (manteniamo la sicurezza!)
ALTER TABLE blueriot_tastes ENABLE ROW LEVEL SECURITY;

-- ✅ LETTURA PUBBLICA (chiunque può vedere i ristoranti)
CREATE POLICY "Public read access"
    ON blueriot_tastes FOR SELECT
    USING (true);

-- 🔒 SOLO UTENTI AUTENTICATI E IN TL_USERS possono INSERT
CREATE POLICY "Authenticated TLs can insert"
    ON blueriot_tastes FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND auth.uid() IN (SELECT user_id FROM tl_users)
    );

-- 🔒 SOLO UTENTI AUTENTICATI E IN TL_USERS possono UPDATE
CREATE POLICY "Authenticated TLs can update"
    ON blueriot_tastes FOR UPDATE
    USING (
        auth.uid() IS NOT NULL
        AND auth.uid() IN (SELECT user_id FROM tl_users)
    );

-- 🔒 SOLO UTENTI AUTENTICATI E IN TL_USERS possono DELETE
CREATE POLICY "Authenticated TLs can delete"
    ON blueriot_tastes FOR DELETE
    USING (
        auth.uid() IS NOT NULL
        AND auth.uid() IN (SELECT user_id FROM tl_users)
    );

-- Verifica che le policy siano state create
SELECT
    policyname as "Nome Policy",
    cmd as "Comando"
FROM pg_policies
WHERE tablename = 'blueriot_tastes'
ORDER BY cmd;

-- ═══════════════════════════════════════════════════
-- ✅ FATTO!
-- ═══════════════════════════════════════════════════
-- Ora:
-- - TUTTI possono LEGGERE i ristoranti (anche senza login)
-- - SOLO TL autenticati possono AGGIUNGERE/MODIFICARE/CANCELLARE
--
-- RLS è ancora ABILITATO = SICURO! ✅
-- ═══════════════════════════════════════════════════
