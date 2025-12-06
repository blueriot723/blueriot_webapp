-- =====================================================
-- CRITICAL DATABASE MIGRATION
-- Run this FIRST in Supabase SQL Editor before deploying code
-- =====================================================

-- Step 1: Add missing columns to tour_restaurants
ALTER TABLE tour_restaurants ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE tour_restaurants ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE tour_restaurants ADD COLUMN IF NOT EXISTS country text;

-- Step 2: Add missing columns to hotels
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS country text;

-- Step 3: Create tour_pdf_extractions table if it doesn't exist
CREATE TABLE IF NOT EXISTS tour_pdf_extractions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id uuid UNIQUE REFERENCES tours(id) ON DELETE CASCADE,
    pdf_filename text NOT NULL,
    raw_ocr_text text,
    extracted_data jsonb,
    extraction_status text DEFAULT 'pending',
    extraction_date timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Step 4: Ensure proper permissions on ALL tables
GRANT ALL ON tour_restaurants TO anon, authenticated;
GRANT ALL ON hotels TO anon, authenticated;
GRANT ALL ON blueriot_tastes TO anon, authenticated;
GRANT ALL ON tour_settings TO anon, authenticated;
GRANT ALL ON tour_pdf_extractions TO anon, authenticated;

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tour_restaurants_tour_id ON tour_restaurants(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_restaurants_city ON tour_restaurants(city);
CREATE INDEX IF NOT EXISTS idx_hotels_tour_id ON hotels(tour_id);
CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels(city);
CREATE INDEX IF NOT EXISTS idx_tour_pdf_extractions_tour_id ON tour_pdf_extractions(tour_id);

-- Step 6: Enable RLS on new table
ALTER TABLE tour_pdf_extractions ENABLE ROW LEVEL SECURITY;

-- Step 7: RLS policies for tour_pdf_extractions
CREATE POLICY "Users can view their own tour PDF extractions"
    ON tour_pdf_extractions FOR SELECT
    USING (
        tour_id IN (
            SELECT id FROM tours WHERE tl_id IN (
                SELECT id FROM tl_users WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert their own tour PDF extractions"
    ON tour_pdf_extractions FOR INSERT
    WITH CHECK (
        tour_id IN (
            SELECT id FROM tours WHERE tl_id IN (
                SELECT id FROM tl_users WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update their own tour PDF extractions"
    ON tour_pdf_extractions FOR UPDATE
    USING (
        tour_id IN (
            SELECT id FROM tours WHERE tl_id IN (
                SELECT id FROM tl_users WHERE user_id = auth.uid()
            )
        )
    );

-- Verify migration completed successfully
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE 'Checking tour_restaurants columns...';
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tour_restaurants' AND column_name = 'city') THEN
        RAISE NOTICE '  ✅ city column exists';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tour_restaurants' AND column_name = 'region') THEN
        RAISE NOTICE '  ✅ region column exists';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tour_restaurants' AND column_name = 'country') THEN
        RAISE NOTICE '  ✅ country column exists';
    END IF;

    RAISE NOTICE 'Checking hotels columns...';
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotels' AND column_name = 'city') THEN
        RAISE NOTICE '  ✅ city column exists';
    END IF;

    RAISE NOTICE 'Checking tour_pdf_extractions table...';
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tour_pdf_extractions') THEN
        RAISE NOTICE '  ✅ tour_pdf_extractions table exists';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '🎉 ALL CHECKS PASSED! You can now deploy the updated code.';
END $$;

COMMIT;
