-- =====================================================
-- MIGRATION 007: DAY ITEMS (Movable Blocks)
-- =====================================================
-- Movable items within days: activities, meals, transport, suggestions
-- Each item has a color and can be moved between days

CREATE TABLE IF NOT EXISTS day_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Day reference (can be moved to different days)
    day_id UUID NOT NULL REFERENCES tour_days(id) ON DELETE CASCADE,
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,

    -- Item type and color
    item_type VARCHAR(50) NOT NULL, -- activity, lunch, dinner, transport, suggestion
    color VARCHAR(50) NOT NULL, -- orange, light_blue, blue, green, purple

    -- Position in the day (for ordering)
    position INTEGER NOT NULL DEFAULT 0,

    -- Time (optional)
    start_time TIME,
    end_time TIME,
    duration_minutes INTEGER,

    -- Content
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    notes TEXT,

    -- Links to other modules
    tastes_id UUID, -- Link to restaurant (for meals)
    routes_id UUID, -- Link to transport (for transport items)
    stay_id UUID, -- Link to hotel (rarely used)

    -- Additional metadata
    is_confirmed BOOLEAN DEFAULT FALSE,
    is_optional BOOLEAN DEFAULT FALSE,
    cost_estimate DECIMAL(10,2),
    booking_required BOOLEAN DEFAULT FALSE,
    booking_url TEXT,

    -- System
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES tl_users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_day_items_day ON day_items(day_id);
CREATE INDEX IF NOT EXISTS idx_day_items_tour ON day_items(tour_id);
CREATE INDEX IF NOT EXISTS idx_day_items_type ON day_items(item_type);
CREATE INDEX IF NOT EXISTS idx_day_items_position ON day_items(day_id, position);

-- Unique position per day (for ordering)
CREATE UNIQUE INDEX IF NOT EXISTS idx_day_items_unique_position
    ON day_items(day_id, position);

-- Color mapping (for reference)
-- activity -> orange (#FFE5CC pastel orange)
-- lunch -> light_blue (#CCE5FF pastel light blue)
-- dinner -> blue (#B3D9FF pastel blue)
-- transport -> green (#CCFFCC pastel green)
-- suggestion -> purple (#E5CCFF pastel purple)

-- Comments
COMMENT ON TABLE day_items IS 'Movable items within tour days with color coding';
COMMENT ON COLUMN day_items.item_type IS 'activity, lunch, dinner, transport, suggestion';
COMMENT ON COLUMN day_items.color IS 'orange, light_blue, blue, green, purple';
COMMENT ON COLUMN day_items.position IS 'Order position within the day (unique per day)';
