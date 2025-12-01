-- ═══════════════════════════════════════════════════
-- 🔧 FIX RLS POLICIES - Correzione Permessi
-- ═══════════════════════════════════════════════════
-- PROBLEMA: Le politiche RLS usavano auth.uid() = tl_id
-- MA auth.uid() è in auth.users, mentre tl_id è in tl_users
-- Questi UUID sono DIVERSI!
--
-- SOLUZIONE: Usare subquery per trovare tl_users.id da auth.uid()
-- ═══════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════
-- FIX 1: TOURS TABLE
-- ═══════════════════════════════════════════════════

-- Drop old policies
DROP POLICY IF EXISTS "TLs can view their own tours" ON tours;
DROP POLICY IF EXISTS "TLs can insert their own tours" ON tours;
DROP POLICY IF EXISTS "TLs can update their own tours" ON tours;
DROP POLICY IF EXISTS "TLs can delete their own tours" ON tours;

-- Create correct policies
CREATE POLICY "TLs can view their own tours"
    ON tours FOR SELECT
    USING (
        tl_id = (SELECT id FROM tl_users WHERE user_id = auth.uid())
    );

CREATE POLICY "TLs can insert their own tours"
    ON tours FOR INSERT
    WITH CHECK (
        tl_id = (SELECT id FROM tl_users WHERE user_id = auth.uid())
    );

CREATE POLICY "TLs can update their own tours"
    ON tours FOR UPDATE
    USING (
        tl_id = (SELECT id FROM tl_users WHERE user_id = auth.uid())
    );

CREATE POLICY "TLs can delete their own tours"
    ON tours FOR DELETE
    USING (
        tl_id = (SELECT id FROM tl_users WHERE user_id = auth.uid())
    );

-- ═══════════════════════════════════════════════════
-- FIX 2: BLUERIOT_TASTES TABLE (Restaurants)
-- ═══════════════════════════════════════════════════

-- Enable RLS if not already enabled
ALTER TABLE blueriot_tastes ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Anyone can view tastes" ON blueriot_tastes;
DROP POLICY IF EXISTS "TLs can insert tastes" ON blueriot_tastes;
DROP POLICY IF EXISTS "TLs can update tastes" ON blueriot_tastes;
DROP POLICY IF EXISTS "TLs can delete tastes" ON blueriot_tastes;
DROP POLICY IF EXISTS "TLs can view all tastes" ON blueriot_tastes;
DROP POLICY IF EXISTS "Users can view tastes" ON blueriot_tastes;

-- Create permissive policies (tutti i TL possono vedere/modificare tutti i ristoranti)
CREATE POLICY "TLs can view all tastes"
    ON blueriot_tastes FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM tl_users WHERE user_id = auth.uid())
    );

CREATE POLICY "TLs can insert tastes"
    ON blueriot_tastes FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM tl_users WHERE user_id = auth.uid())
    );

CREATE POLICY "TLs can update tastes"
    ON blueriot_tastes FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM tl_users WHERE user_id = auth.uid())
    );

CREATE POLICY "TLs can delete tastes"
    ON blueriot_tastes FOR DELETE
    USING (
        EXISTS (SELECT 1 FROM tl_users WHERE user_id = auth.uid())
    );

-- ═══════════════════════════════════════════════════
-- FIX 3: BLUERIOT_ROUTES TABLE (Transport)
-- ═══════════════════════════════════════════════════

ALTER TABLE blueriot_routes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "TLs can view all routes" ON blueriot_routes;
DROP POLICY IF EXISTS "TLs can insert routes" ON blueriot_routes;
DROP POLICY IF EXISTS "TLs can update routes" ON blueriot_routes;
DROP POLICY IF EXISTS "TLs can delete routes" ON blueriot_routes;

CREATE POLICY "TLs can view all routes"
    ON blueriot_routes FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM tl_users WHERE user_id = auth.uid())
    );

CREATE POLICY "TLs can insert routes"
    ON blueriot_routes FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM tl_users WHERE user_id = auth.uid())
    );

CREATE POLICY "TLs can update routes"
    ON blueriot_routes FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM tl_users WHERE user_id = auth.uid())
    );

CREATE POLICY "TLs can delete routes"
    ON blueriot_routes FOR DELETE
    USING (
        EXISTS (SELECT 1 FROM tl_users WHERE user_id = auth.uid())
    );

-- ═══════════════════════════════════════════════════
-- FIX 4: BLUERIOT_STAY TABLE (Hotels)
-- ═══════════════════════════════════════════════════

ALTER TABLE blueriot_stay ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "TLs can view all stays" ON blueriot_stay;
DROP POLICY IF EXISTS "TLs can insert stays" ON blueriot_stay;
DROP POLICY IF EXISTS "TLs can update stays" ON blueriot_stay;
DROP POLICY IF EXISTS "TLs can delete stays" ON blueriot_stay;

CREATE POLICY "TLs can view all stays"
    ON blueriot_stay FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM tl_users WHERE user_id = auth.uid())
    );

CREATE POLICY "TLs can insert stays"
    ON blueriot_stay FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM tl_users WHERE user_id = auth.uid())
    );

CREATE POLICY "TLs can update stays"
    ON blueriot_stay FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM tl_users WHERE user_id = auth.uid())
    );

CREATE POLICY "TLs can delete stays"
    ON blueriot_stay FOR DELETE
    USING (
        EXISTS (SELECT 1 FROM tl_users WHERE user_id = auth.uid())
    );

-- ═══════════════════════════════════════════════════
-- FIX 5: TOUR_DAYS TABLE
-- ═══════════════════════════════════════════════════

ALTER TABLE tour_days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "TLs can view their tour days" ON tour_days;
DROP POLICY IF EXISTS "TLs can insert their tour days" ON tour_days;
DROP POLICY IF EXISTS "TLs can update their tour days" ON tour_days;
DROP POLICY IF EXISTS "TLs can delete their tour days" ON tour_days;

-- TLs can only access days for their own tours
CREATE POLICY "TLs can view their tour days"
    ON tour_days FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tours
            WHERE tours.id = tour_days.tour_id
            AND tours.tl_id = (SELECT id FROM tl_users WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "TLs can insert their tour days"
    ON tour_days FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tours
            WHERE tours.id = tour_days.tour_id
            AND tours.tl_id = (SELECT id FROM tl_users WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "TLs can update their tour days"
    ON tour_days FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM tours
            WHERE tours.id = tour_days.tour_id
            AND tours.tl_id = (SELECT id FROM tl_users WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "TLs can delete their tour days"
    ON tour_days FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM tours
            WHERE tours.id = tour_days.tour_id
            AND tours.tl_id = (SELECT id FROM tl_users WHERE user_id = auth.uid())
        )
    );

-- ═══════════════════════════════════════════════════
-- ✅ DONE! RLS Policies Fixed
-- ═══════════════════════════════════════════════════
-- Ora:
-- - I tour appartengono al TL che li ha creati
-- - TASTES/ROUTES/STAY sono condivisi tra tutti i TL
-- - I giorni dei tour seguono i permessi del tour padre
-- ═══════════════════════════════════════════════════
