-- ═══════════════════════════════════════════════════
-- 🔧 FIX RLS POLICIES - VERSIONE FINALE
-- ═══════════════════════════════════════════════════
-- IMPORTANTE: Esegui DOPO aver creato gli utenti in tl_users!
-- ═══════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════
-- TOURS TABLE - Solo i tuoi tour
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
-- BLUERIOT_TASTES - Database condiviso tra tutti i TL
-- ═══════════════════════════════════════════════════

ALTER TABLE blueriot_tastes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "TLs can view all tastes" ON blueriot_tastes;
DROP POLICY IF EXISTS "TLs can insert tastes" ON blueriot_tastes;
DROP POLICY IF EXISTS "TLs can update tastes" ON blueriot_tastes;
DROP POLICY IF EXISTS "TLs can delete tastes" ON blueriot_tastes;

-- Tutti i TL autenticati possono fare tutto
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
-- BLUERIOT_ROUTES - Database condiviso
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
-- BLUERIOT_STAY - Database condiviso
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
-- TOUR_DAYS - Solo giorni dei tuoi tour
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
-- ✅ DONE! RLS configurato correttamente
-- ═══════════════════════════════════════════════════
-- Le politiche ora usano:
-- - auth.uid() IN (SELECT user_id FROM tl_users) per database condivisi
-- - Subquery per tours e tour_days (solo i tuoi)
-- ═══════════════════════════════════════════════════
