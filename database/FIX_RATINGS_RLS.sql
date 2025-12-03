-- ═══════════════════════════════════════════════════
-- Fix RLS policies for restaurant_ratings table
-- ═══════════════════════════════════════════════════

-- Enable RLS
ALTER TABLE restaurant_ratings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Authenticated users can rate" ON restaurant_ratings;
DROP POLICY IF EXISTS "Anyone can view ratings" ON restaurant_ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON restaurant_ratings;

-- Policy 1: Anyone can view ratings (public read)
CREATE POLICY "Anyone can view ratings"
    ON restaurant_ratings FOR SELECT
    TO public
    USING (true);

-- Policy 2: Authenticated users can insert ratings
CREATE POLICY "Authenticated users can rate"
    ON restaurant_ratings FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND auth.uid() IN (SELECT user_id FROM tl_users)
    );

-- Policy 3: Users can update their own ratings
CREATE POLICY "Users can update own ratings"
    ON restaurant_ratings FOR UPDATE
    TO authenticated
    USING (tl_id = auth.uid());

-- Verify policies
SELECT
    policyname as "Policy Name",
    cmd as "Command",
    roles as "Roles"
FROM pg_policies
WHERE tablename = 'restaurant_ratings'
ORDER BY cmd;

-- ═══════════════════════════════════════════════════
-- ✅ DONE!
-- ═══════════════════════════════════════════════════
