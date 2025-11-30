-- ═══════════════════════════════════════════════════
-- 🔴 TOURS TABLE - Base Tour Management
-- ═══════════════════════════════════════════════════
-- This table is the foundation for the NODΞ system
-- Create this FIRST before creating tour_days
-- ═══════════════════════════════════════════════════

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════
-- TABLE: tours
-- ═══════════════════════════════════════════════════
-- Core tour information managed by Tour Leaders
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tl_id UUID NOT NULL REFERENCES tl_users(id) ON DELETE CASCADE,

    -- Tour identification
    code VARCHAR(50) NOT NULL UNIQUE,  -- Tour code (e.g., "IT2025-01")
    name VARCHAR(255) NOT NULL,         -- Tour name (e.g., "Italian Lakes Adventure")

    -- Operator & status
    operator VARCHAR(255),              -- Tour operator name
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'archived', 'cancelled'

    -- Dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- System timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_dates CHECK (end_date >= start_date),
    CONSTRAINT valid_status CHECK (status IN ('active', 'archived', 'cancelled'))
);

-- ═══════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_tours_tl_id ON tours(tl_id);
CREATE INDEX IF NOT EXISTS idx_tours_code ON tours(code);
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_dates ON tours(start_date, end_date);

-- ═══════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tours_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tours_updated_at_trigger ON tours;
CREATE TRIGGER tours_updated_at_trigger
    BEFORE UPDATE ON tours
    FOR EACH ROW
    EXECUTE FUNCTION update_tours_updated_at();

-- ═══════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════

ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

-- Policy: TLs can only see/edit their own tours
DROP POLICY IF EXISTS "TLs can view their own tours" ON tours;
CREATE POLICY "TLs can view their own tours"
    ON tours FOR SELECT
    USING (auth.uid() = tl_id);

DROP POLICY IF EXISTS "TLs can insert their own tours" ON tours;
CREATE POLICY "TLs can insert their own tours"
    ON tours FOR INSERT
    WITH CHECK (auth.uid() = tl_id);

DROP POLICY IF EXISTS "TLs can update their own tours" ON tours;
CREATE POLICY "TLs can update their own tours"
    ON tours FOR UPDATE
    USING (auth.uid() = tl_id);

DROP POLICY IF EXISTS "TLs can delete their own tours" ON tours;
CREATE POLICY "TLs can delete their own tours"
    ON tours FOR DELETE
    USING (auth.uid() = tl_id);

-- ═══════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════

COMMENT ON TABLE tours IS 'Tour management - Core tour information for NODΞ system';
COMMENT ON COLUMN tours.code IS 'Unique tour code identifier';
COMMENT ON COLUMN tours.name IS 'Human-readable tour name';
COMMENT ON COLUMN tours.operator IS 'Tour operator company name';
COMMENT ON COLUMN tours.status IS 'Tour status: active, archived, cancelled';
COMMENT ON COLUMN tours.start_date IS 'Tour start date';
COMMENT ON COLUMN tours.end_date IS 'Tour end date';

-- ═══════════════════════════════════════════════════
-- ✅ DONE! Now you can create tour_days table
-- ═══════════════════════════════════════════════════
