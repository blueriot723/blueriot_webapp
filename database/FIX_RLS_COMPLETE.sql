-- ═══════════════════════════════════════════════════
-- 🔧 FIX COMPLETO RLS - ESECUZIONE UNICA
-- ═══════════════════════════════════════════════════
-- Questo script risolve TUTTI i problemi RLS in un colpo solo
-- Esegui TUTTO questo file su Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════
-- STEP 1: Verifica utenti mancanti
-- ═══════════════════════════════════════════════════

DO $$
DECLARE
    missing_count INTEGER;
BEGIN
    -- Conta quanti utenti mancano
    SELECT COUNT(*)
    INTO missing_count
    FROM auth.users u
    WHERE NOT EXISTS (
        SELECT 1 FROM tl_users WHERE user_id = u.id
    );

    RAISE NOTICE '📊 Utenti mancanti in tl_users: %', missing_count;
END $$;

-- ═══════════════════════════════════════════════════
-- STEP 2: Crea utenti mancanti (SOLO user_id)
-- ═══════════════════════════════════════════════════
-- Usa SOLO user_id per evitare errori su colonne mancanti

INSERT INTO tl_users (user_id)
SELECT u.id
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM tl_users WHERE user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Verifica creazione
DO $$
DECLARE
    total_users INTEGER;
    total_tl_users INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_users FROM auth.users;
    SELECT COUNT(*) INTO total_tl_users FROM tl_users;

    RAISE NOTICE '✅ Utenti auth.users: %', total_users;
    RAISE NOTICE '✅ Utenti tl_users: %', total_tl_users;

    IF total_users = total_tl_users THEN
        RAISE NOTICE '✅✅ PERFETTO! Tutti gli utenti sono sincronizzati';
    ELSE
        RAISE WARNING '⚠️ Mancano ancora % utenti', (total_users - total_tl_users);
    END IF;
END $$;

-- ═══════════════════════════════════════════════════
-- STEP 3: FIX RLS BLUERIOT_TASTES (Ristoranti)
-- ═══════════════════════════════════════════════════

-- Abilita RLS
ALTER TABLE blueriot_tastes ENABLE ROW LEVEL SECURITY;

-- Rimuovi politiche vecchie
DROP POLICY IF EXISTS "TLs can view all tastes" ON blueriot_tastes;
DROP POLICY IF EXISTS "TLs can insert tastes" ON blueriot_tastes;
DROP POLICY IF EXISTS "TLs can update tastes" ON blueriot_tastes;
DROP POLICY IF EXISTS "TLs can delete tastes" ON blueriot_tastes;
DROP POLICY IF EXISTS "Users can view tastes" ON blueriot_tastes;
DROP POLICY IF EXISTS "Anyone can view tastes" ON blueriot_tastes;

-- Crea politiche corrette (database condiviso tra tutti i TL)
CREATE POLICY "TLs can view all tastes"
    ON blueriot_tastes FOR SELECT
    USING (
        auth.uid() IN (SELECT user_id FROM tl_users)
    );

CREATE POLICY "TLs can insert tastes"
    ON blueriot_tastes FOR INSERT
    WITH CHECK (
        auth.uid() IN (SELECT user_id FROM tl_users)
    );

CREATE POLICY "TLs can update tastes"
    ON blueriot_tastes FOR UPDATE
    USING (
        auth.uid() IN (SELECT user_id FROM tl_users)
    );

CREATE POLICY "TLs can delete tastes"
    ON blueriot_tastes FOR DELETE
    USING (
        auth.uid() IN (SELECT user_id FROM tl_users)
    );

-- ═══════════════════════════════════════════════════
-- STEP 4: FIX RLS BLUERIOT_ROUTES (Trasporti)
-- ═══════════════════════════════════════════════════

ALTER TABLE blueriot_routes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "TLs can view all routes" ON blueriot_routes;
DROP POLICY IF EXISTS "TLs can insert routes" ON blueriot_routes;
DROP POLICY IF EXISTS "TLs can update routes" ON blueriot_routes;
DROP POLICY IF EXISTS "TLs can delete routes" ON blueriot_routes;

CREATE POLICY "TLs can view all routes"
    ON blueriot_routes FOR SELECT
    USING (
        auth.uid() IN (SELECT user_id FROM tl_users)
    );

CREATE POLICY "TLs can insert routes"
    ON blueriot_routes FOR INSERT
    WITH CHECK (
        auth.uid() IN (SELECT user_id FROM tl_users)
    );

CREATE POLICY "TLs can update routes"
    ON blueriot_routes FOR UPDATE
    USING (
        auth.uid() IN (SELECT user_id FROM tl_users)
    );

CREATE POLICY "TLs can delete routes"
    ON blueriot_routes FOR DELETE
    USING (
        auth.uid() IN (SELECT user_id FROM tl_users)
    );

-- ═══════════════════════════════════════════════════
-- STEP 5: FIX RLS BLUERIOT_STAY (Hotel)
-- ═══════════════════════════════════════════════════

ALTER TABLE blueriot_stay ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "TLs can view all stays" ON blueriot_stay;
DROP POLICY IF EXISTS "TLs can insert stays" ON blueriot_stay;
DROP POLICY IF EXISTS "TLs can update stays" ON blueriot_stay;
DROP POLICY IF EXISTS "TLs can delete stays" ON blueriot_stay;

CREATE POLICY "TLs can view all stays"
    ON blueriot_stay FOR SELECT
    USING (
        auth.uid() IN (SELECT user_id FROM tl_users)
    );

CREATE POLICY "TLs can insert stays"
    ON blueriot_stay FOR INSERT
    WITH CHECK (
        auth.uid() IN (SELECT user_id FROM tl_users)
    );

CREATE POLICY "TLs can update stays"
    ON blueriot_stay FOR UPDATE
    USING (
        auth.uid() IN (SELECT user_id FROM tl_users)
    );

CREATE POLICY "TLs can delete stays"
    ON blueriot_stay FOR DELETE
    USING (
        auth.uid() IN (SELECT user_id FROM tl_users)
    );

-- ═══════════════════════════════════════════════════
-- STEP 6: FIX RLS TOURS (Solo i tuoi tour)
-- ═══════════════════════════════════════════════════

ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "TLs can view their own tours" ON tours;
DROP POLICY IF EXISTS "TLs can insert their own tours" ON tours;
DROP POLICY IF EXISTS "TLs can update their own tours" ON tours;
DROP POLICY IF EXISTS "TLs can delete their own tours" ON tours;

CREATE POLICY "TLs can view their own tours"
    ON tours FOR SELECT
    USING (
        tl_id IN (SELECT id FROM tl_users WHERE user_id = auth.uid())
    );

CREATE POLICY "TLs can insert their own tours"
    ON tours FOR INSERT
    WITH CHECK (
        tl_id IN (SELECT id FROM tl_users WHERE user_id = auth.uid())
    );

CREATE POLICY "TLs can update their own tours"
    ON tours FOR UPDATE
    USING (
        tl_id IN (SELECT id FROM tl_users WHERE user_id = auth.uid())
    );

CREATE POLICY "TLs can delete their own tours"
    ON tours FOR DELETE
    USING (
        tl_id IN (SELECT id FROM tl_users WHERE user_id = auth.uid())
    );

-- ═══════════════════════════════════════════════════
-- STEP 7: FIX RLS TOUR_DAYS (Giorni del tour)
-- ═══════════════════════════════════════════════════

ALTER TABLE tour_days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "TLs can view their tour days" ON tour_days;
DROP POLICY IF EXISTS "TLs can insert their tour days" ON tour_days;
DROP POLICY IF EXISTS "TLs can update their tour days" ON tour_days;
DROP POLICY IF EXISTS "TLs can delete their tour days" ON tour_days;

CREATE POLICY "TLs can view their tour days"
    ON tour_days FOR SELECT
    USING (
        tour_id IN (
            SELECT t.id FROM tours t
            WHERE t.tl_id IN (SELECT id FROM tl_users WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "TLs can insert their tour days"
    ON tour_days FOR INSERT
    WITH CHECK (
        tour_id IN (
            SELECT t.id FROM tours t
            WHERE t.tl_id IN (SELECT id FROM tl_users WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "TLs can update their tour days"
    ON tour_days FOR UPDATE
    USING (
        tour_id IN (
            SELECT t.id FROM tours t
            WHERE t.tl_id IN (SELECT id FROM tl_users WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "TLs can delete their tour days"
    ON tour_days FOR DELETE
    USING (
        tour_id IN (
            SELECT t.id FROM tours t
            WHERE t.tl_id IN (SELECT id FROM tl_users WHERE user_id = auth.uid())
        )
    );

-- ═══════════════════════════════════════════════════
-- STEP 8: Verifica finale
-- ═══════════════════════════════════════════════════

DO $$
DECLARE
    tastes_policies INTEGER;
    routes_policies INTEGER;
    stay_policies INTEGER;
    tours_policies INTEGER;
    days_policies INTEGER;
BEGIN
    -- Conta le politiche per ogni tabella
    SELECT COUNT(*) INTO tastes_policies FROM pg_policies WHERE tablename = 'blueriot_tastes';
    SELECT COUNT(*) INTO routes_policies FROM pg_policies WHERE tablename = 'blueriot_routes';
    SELECT COUNT(*) INTO stay_policies FROM pg_policies WHERE tablename = 'blueriot_stay';
    SELECT COUNT(*) INTO tours_policies FROM pg_policies WHERE tablename = 'tours';
    SELECT COUNT(*) INTO days_policies FROM pg_policies WHERE tablename = 'tour_days';

    RAISE NOTICE '═══════════════════════════════════════';
    RAISE NOTICE '✅ VERIFICA RLS POLICIES';
    RAISE NOTICE '═══════════════════════════════════════';
    RAISE NOTICE 'blueriot_tastes: % policies (atteso: 4)', tastes_policies;
    RAISE NOTICE 'blueriot_routes: % policies (atteso: 4)', routes_policies;
    RAISE NOTICE 'blueriot_stay: % policies (atteso: 4)', stay_policies;
    RAISE NOTICE 'tours: % policies (atteso: 4)', tours_policies;
    RAISE NOTICE 'tour_days: % policies (atteso: 4)', days_policies;
    RAISE NOTICE '═══════════════════════════════════════';

    IF tastes_policies = 4 AND routes_policies = 4 AND stay_policies = 4
       AND tours_policies = 4 AND days_policies = 4 THEN
        RAISE NOTICE '✅✅✅ TUTTO OK! RLS configurato correttamente';
    ELSE
        RAISE WARNING '⚠️ Alcune tabelle hanno un numero di policies diverso da 4';
    END IF;
END $$;

-- ═══════════════════════════════════════════════════
-- ✅ COMPLETATO!
-- ═══════════════════════════════════════════════════
-- RLS abilitato e configurato per:
-- ✅ blueriot_tastes (database condiviso)
-- ✅ blueriot_routes (database condiviso)
-- ✅ blueriot_stay (database condiviso)
-- ✅ tours (solo i tuoi tour)
-- ✅ tour_days (solo giorni dei tuoi tour)
--
-- Ora prova a:
-- 1. Creare un tour
-- 2. Aggiungere un ristorante in TASTES
-- 3. Generare giorni per il tour
-- ═══════════════════════════════════════════════════
