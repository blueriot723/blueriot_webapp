-- =====================================================
-- MIGRATION 001: TOUR DAYS
-- =====================================================
-- Days management system for tours
-- Supports calendar_date, logical_day_number, reordering

CREATE TABLE IF NOT EXISTS tour_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Tour reference
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,

    -- Day identification
    calendar_date DATE NOT NULL,
    logical_day_number INTEGER NOT NULL,
    day_title VARCHAR(255),

    -- Location
    cities TEXT[], -- Array of cities visited this day
    primary_city VARCHAR(255),

    -- Schedule blocks
    morning_schedule TEXT,
    afternoon_schedule TEXT,
    evening_schedule TEXT,

    -- Hiking info
    is_hiking_day BOOLEAN DEFAULT FALSE,
    hiking_distance_km DECIMAL(5,2),
    hiking_elevation_m INTEGER,
    hiking_difficulty VARCHAR(50), -- easy, moderate, challenging, difficult
    hiking_map_link TEXT,

    -- Meeting points
    meeting_point VARCHAR(255),
    meeting_time TIME,

    -- Links to other modules
    hotel_id UUID, -- Link to SΤΔΥ
    tastes_ids UUID[], -- Links to ΤΔSΤΞ5
    routes_ids UUID[], -- Links to R0UT35
    ticket_ids UUID[], -- Links to tickets
    emergency_contact_id UUID, -- Primary emergency contact for this day

    -- Notes
    tl_notes TEXT,
    passenger_notes TEXT,

    -- System
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES tl_users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tour_days_tour ON tour_days(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_days_date ON tour_days(calendar_date);
CREATE INDEX IF NOT EXISTS idx_tour_days_logical ON tour_days(logical_day_number);
CREATE INDEX IF NOT EXISTS idx_tour_days_cities ON tour_days USING GIN(cities);

-- Ensure unique logical_day_number per tour
CREATE UNIQUE INDEX IF NOT EXISTS idx_tour_days_unique_logical
    ON tour_days(tour_id, logical_day_number);

-- Comments
COMMENT ON TABLE tour_days IS 'Tour days with calendar dates and logical numbering';
COMMENT ON COLUMN tour_days.logical_day_number IS 'Reorderable day number (e.g. Day 1, Day 2)';
COMMENT ON COLUMN tour_days.calendar_date IS 'Actual calendar date (fixed)';
