-- =====================================================
-- BLUERIOT ECOSYSTEM - FINAL DATABASE SCHEMA
-- Schema ottimizzato basato sul CRUD funzionante
-- Generato da index.html implementazione
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SECTION 1: BLUERIOT TASTES
-- =====================================================

CREATE TABLE IF NOT EXISTS blueriot_tastes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Basic info (REQUIRED)
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,

    -- Cuisine & pricing
    cuisine VARCHAR(100),
    price_range VARCHAR(10),

    -- TL Benefits
    gratuity BOOLEAN DEFAULT FALSE,
    commission BOOLEAN DEFAULT FALSE,
    discount BOOLEAN DEFAULT FALSE,
    discount_percentage INTEGER,

    -- Location (REQUIRED: location)
    location VARCHAR(255) NOT NULL,
    address TEXT,
    google_maps_link TEXT,

    -- Hours & booking
    opening_hours TEXT,
    booking_needed BOOLEAN DEFAULT FALSE,

    -- Group suitability
    suitable_for_groups BOOLEAN DEFAULT TRUE,
    min_group_size INTEGER,
    max_group_size INTEGER,

    -- Tours & testing
    tours_relevant TEXT[],
    tested_by VARCHAR(255),
    tested_date DATE,

    -- Notes
    notes TEXT,

    -- System
    added_by UUID REFERENCES tl_users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tastes_type ON blueriot_tastes(type);
CREATE INDEX IF NOT EXISTS idx_tastes_location ON blueriot_tastes(location);
CREATE INDEX IF NOT EXISTS idx_tastes_gratuity ON blueriot_tastes(gratuity);
CREATE INDEX IF NOT EXISTS idx_tastes_commission ON blueriot_tastes(commission);
CREATE INDEX IF NOT EXISTS idx_tastes_suitable_groups ON blueriot_tastes(suitable_for_groups);

-- =====================================================
-- SECTION 2: BLUERIOT ROUTES
-- =====================================================

CREATE TABLE IF NOT EXISTS blueriot_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Transport type (REQUIRED)
    transport_type VARCHAR(100) NOT NULL,
    train_category VARCHAR(50),

    -- Operator (REQUIRED)
    operator_name VARCHAR(255) NOT NULL,

    -- Route info
    area_served VARCHAR(255),
    start_point VARCHAR(255),
    end_point VARCHAR(255),

    -- Timing & pricing
    frequency VARCHAR(100),
    duration VARCHAR(100),
    price VARCHAR(100),
    ticket_info TEXT,

    -- Reliability
    reliability VARCHAR(50),
    reliability_notes TEXT,

    -- Contacts & links
    contacts TEXT,
    website VARCHAR(500),
    booking_url VARCHAR(500),
    maps_link TEXT,

    -- Additional info
    notes TEXT,
    tips TEXT,

    -- System
    added_by UUID REFERENCES tl_users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_routes_type ON blueriot_routes(transport_type);
CREATE INDEX IF NOT EXISTS idx_routes_operator ON blueriot_routes(operator_name);
CREATE INDEX IF NOT EXISTS idx_routes_area ON blueriot_routes(area_served);
CREATE INDEX IF NOT EXISTS idx_routes_reliability ON blueriot_routes(reliability);

-- =====================================================
-- SECTION 3: BLUERIOT STAY
-- =====================================================

CREATE TABLE IF NOT EXISTS blueriot_stay (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Basic info (REQUIRED)
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,

    -- Location (REQUIRED: location)
    location VARCHAR(255) NOT NULL,
    address TEXT,
    google_maps_link TEXT,
    distance_from_center VARCHAR(100),

    -- Pricing
    price_range VARCHAR(100),

    -- Contacts & booking
    contact VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(500),
    booking_url VARCHAR(500),

    -- Suitability
    suitable_for_families BOOLEAN DEFAULT FALSE,
    suitable_for_groups BOOLEAN DEFAULT FALSE,
    max_guests INTEGER,

    -- Facilities
    facilities TEXT,
    facilities_array TEXT[],

    -- TL Benefits
    commission BOOLEAN DEFAULT FALSE,
    commission_percentage INTEGER,
    special_tl_rate BOOLEAN DEFAULT FALSE,
    special_rate_details TEXT,

    -- Testing & recommendations
    tested_by VARCHAR(255),
    tested_date DATE,
    recommended_for TEXT,

    -- Notes
    notes TEXT,

    -- System
    added_by UUID REFERENCES tl_users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_stay_type ON blueriot_stay(type);
CREATE INDEX IF NOT EXISTS idx_stay_location ON blueriot_stay(location);
CREATE INDEX IF NOT EXISTS idx_stay_families ON blueriot_stay(suitable_for_families);
CREATE INDEX IF NOT EXISTS idx_stay_groups ON blueriot_stay(suitable_for_groups);
CREATE INDEX IF NOT EXISTS idx_stay_commission ON blueriot_stay(commission);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE blueriot_tastes IS 'TASTES database - Restaurants, bars, bakeries, gelaterias';
COMMENT ON COLUMN blueriot_tastes.type IS 'Type: restaurant, bar, bakery, quick_bite, gelateria, aperitivo, caffetteria';
COMMENT ON COLUMN blueriot_tastes.gratuity IS 'TL eats/drinks for free';
COMMENT ON COLUMN blueriot_tastes.commission IS 'TL receives commission';
COMMENT ON COLUMN blueriot_tastes.discount IS 'Group discount available';

COMMENT ON TABLE blueriot_routes IS 'ROUTES database - Transport: bus, ferry, taxi, NCC, trains';
COMMENT ON COLUMN blueriot_routes.transport_type IS 'Type: bus, ferry, taxi, ncc, train, private';
COMMENT ON COLUMN blueriot_routes.train_category IS 'Train category: AV, IC, EC, R, RV, S, RE';
COMMENT ON COLUMN blueriot_routes.reliability IS 'Reliability: high, medium, low';

COMMENT ON TABLE blueriot_stay IS 'STAY database - Alternative hotels, B&Bs, guesthouses';
COMMENT ON COLUMN blueriot_stay.type IS 'Type: hotel, bnb, guesthouse, boutique, hostel, apartment';
COMMENT ON COLUMN blueriot_stay.facilities_array IS 'Array of facilities for filtering';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check tables exist:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name LIKE 'blueriot_%';

-- Check columns for TASTES:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'blueriot_tastes' ORDER BY ordinal_position;

-- Check columns for ROUTES:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'blueriot_routes' ORDER BY ordinal_position;

-- Check columns for STAY:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'blueriot_stay' ORDER BY ordinal_position;
