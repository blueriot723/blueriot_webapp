-- =====================================================
-- BLUERIOT - AGGIUNTE NECESSARIE
-- =====================================================
-- Esegui in Supabase SQL Editor
-- Data: 2025-12-07
-- =====================================================


-- ═══════════════════════════════════════════════════════════════
-- 1. RLS Policies per day_items (MANCANTI)
-- ═══════════════════════════════════════════════════════════════

-- Abilita RLS su day_items
ALTER TABLE day_items ENABLE ROW LEVEL SECURITY;

-- Policy SELECT: TL può vedere day_items dei propri tour
CREATE POLICY "TLs can view their day items" ON day_items
FOR SELECT USING (
    tour_id IN (
        SELECT t.id FROM tours t
        WHERE t.tl_id IN (
            SELECT id FROM tl_users WHERE user_id = auth.uid()
        )
    )
);

-- Policy INSERT: TL può inserire day_items nei propri tour
CREATE POLICY "TLs can insert day items" ON day_items
FOR INSERT WITH CHECK (
    tour_id IN (
        SELECT t.id FROM tours t
        WHERE t.tl_id IN (
            SELECT id FROM tl_users WHERE user_id = auth.uid()
        )
    )
);

-- Policy UPDATE: TL può modificare day_items dei propri tour
CREATE POLICY "TLs can update their day items" ON day_items
FOR UPDATE USING (
    tour_id IN (
        SELECT t.id FROM tours t
        WHERE t.tl_id IN (
            SELECT id FROM tl_users WHERE user_id = auth.uid()
        )
    )
);

-- Policy DELETE: TL può eliminare day_items dei propri tour
CREATE POLICY "TLs can delete their day items" ON day_items
FOR DELETE USING (
    tour_id IN (
        SELECT t.id FROM tours t
        WHERE t.tl_id IN (
            SELECT id FROM tl_users WHERE user_id = auth.uid()
        )
    )
);


-- ═══════════════════════════════════════════════════════════════
-- 2. Grants per day_items
-- ═══════════════════════════════════════════════════════════════

GRANT ALL ON day_items TO authenticated;


-- ═══════════════════════════════════════════════════════════════
-- 3. Verifica
-- ═══════════════════════════════════════════════════════════════

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════';
    RAISE NOTICE '✅ POLICIES AGGIUNTE CON SUCCESSO!';
    RAISE NOTICE '═══════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'day_items ora ha:';
    RAISE NOTICE '  • RLS abilitato';
    RAISE NOTICE '  • Policy SELECT per TL';
    RAISE NOTICE '  • Policy INSERT per TL';
    RAISE NOTICE '  • Policy UPDATE per TL';
    RAISE NOTICE '  • Policy DELETE per TL';
    RAISE NOTICE '';
END $$;
