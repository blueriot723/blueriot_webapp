-- ═══════════════════════════════════════════════════
-- 🔍 DIAGNOSI RLS PROBLEMA TASTES
-- ═══════════════════════════════════════════════════
-- Copia TUTTO questo file ed eseguilo su Supabase SQL Editor
-- Poi mandami i risultati completi!
-- ═══════════════════════════════════════════════════

-- 1️⃣ CHI SEI TU?
SELECT
    auth.uid() as "Il mio UUID",
    auth.email() as "La mia email";

-- 2️⃣ SEI IN TL_USERS?
SELECT
    id as "Il mio ID in tl_users",
    user_id as "Il mio user_id",
    created_at as "Quando sono stato creato"
FROM tl_users
WHERE user_id = auth.uid();

-- 3️⃣ QUANTI UTENTI CI SONO?
SELECT
    (SELECT COUNT(*) FROM auth.users) as "Utenti in auth.users",
    (SELECT COUNT(*) FROM tl_users) as "Utenti in tl_users",
    (SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM tl_users) as "Differenza";

-- 4️⃣ RLS È ABILITATO?
SELECT
    tablename as "Tabella",
    rowsecurity as "RLS Abilitato?"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'blueriot_tastes';

-- 5️⃣ QUALI POLICIES ESISTONO?
SELECT
    policyname as "Nome Policy",
    cmd as "Comando",
    permissive as "Permissiva?",
    roles as "Ruoli",
    qual as "Condizione USING",
    with_check as "Condizione WITH CHECK"
FROM pg_policies
WHERE tablename = 'blueriot_tastes'
ORDER BY cmd;

-- 6️⃣ QUANTI RISTORANTI CI SONO?
SELECT COUNT(*) as "Totale ristoranti in blueriot_tastes"
FROM blueriot_tastes;

-- 7️⃣ PROVA A LEGGERE I RISTORANTI (questo potrebbe dare errore)
SELECT * FROM blueriot_tastes LIMIT 1;

-- ═══════════════════════════════════════════════════
-- 📋 MANDAMI TUTTI I RISULTATI!
-- ═══════════════════════════════════════════════════
-- Anche se una query da errore, continua ed esegui le altre.
-- Dimmi per ogni query cosa vedi (numero, tabelle, errori, ecc.)
-- ═══════════════════════════════════════════════════
