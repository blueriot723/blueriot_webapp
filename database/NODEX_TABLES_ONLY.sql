-- ═══════════════════════════════════════════════════
-- 🔴 NODΞ Tables - Add to Existing Supabase Database
-- ═══════════════════════════════════════════════════
-- This script adds ONLY the 7 NODΞ tables
-- It SKIPS the existing tables: blueriot_tastes, blueriot_routes, blueriot_stay, tours, tl_users
--
-- Instructions:
-- 1. Open Supabase SQL Editor
-- 2. Copy/paste this ENTIRE file
-- 3. Click "Run"
-- 4. Done! ✅
-- ═══════════════════════════════════════════════════

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════
-- TABLE 1: tour_days
-- ═══════════════════════════════════════════════════
-- Day management with dual numbering system
-- calendar_date: fixed calendar date
-- logical_day_number: reorderable position (drag & drop)
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tour_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    calendar_date DATE NOT NULL,
    logical_day_number INTEGER NOT NULL,
    cities TEXT[],
    morning_schedule TEXT,
    afternoon_schedule TEXT,
    evening_schedule TEXT,
    is_hiking_day BOOLEAN DEFAULT FALSE,
    hotel_id UUID, -- References blueriot_stay(id) - soft reference
    tastes_ids UUID[], -- References blueriot_tastes(id) - soft reference
    routes_ids UUID[], -- References blueriot_routes(id) - soft reference
    ticket_ids UUID[], -- References tickets(id) - soft reference
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for tour_days
CREATE INDEX IF NOT EXISTS idx_tour_days_tour_id ON tour_days(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_days_calendar_date ON tour_days(calendar_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tour_days_unique_logical ON tour_days(tour_id, logical_day_number);

-- ═══════════════════════════════════════════════════
-- TABLE 2: tickets
-- ═══════════════════════════════════════════════════
-- Ticket management (train, bus, museum, etc.)
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    ticket_name VARCHAR(255),
    ticket_type VARCHAR(100), -- daily_pass, weekly_pass, transport_ticket, museum_ticket, etc.
    operator VARCHAR(255), -- TRENITALIA, ITALO, ATAC, etc.
    ticket_number VARCHAR(255),
    valid_from DATE,
    valid_until DATE,
    cities TEXT[],
    zones TEXT[],
    passenger_name VARCHAR(255),
    price DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'EUR',
    notes TEXT,
    file_url TEXT,
    created_by UUID REFERENCES tl_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for tickets
CREATE INDEX IF NOT EXISTS idx_tickets_tour_id ON tickets(tour_id);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_type ON tickets(ticket_type);
CREATE INDEX IF NOT EXISTS idx_tickets_operator ON tickets(operator);

-- ═══════════════════════════════════════════════════
-- TABLE 3: eticket_imports
-- ═══════════════════════════════════════════════════
-- Audit log for eTicket parsing (PDF, QR, Barcode)
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS eticket_imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES tours(id) ON DELETE SET NULL,
    user_id UUID REFERENCES tl_users(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50), -- pdf, image_qr, image_barcode
    file_size INTEGER,
    raw_text TEXT,
    extracted_data JSONB,
    extraction_method VARCHAR(50), -- pdf_text, qr_code, barcode_ean13, etc.
    confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
    ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
    import_status VARCHAR(50) DEFAULT 'pending', -- pending, processed, failed, mapped
    error_message TEXT,
    imported_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for eticket_imports
CREATE INDEX IF NOT EXISTS idx_eticket_imports_tour_id ON eticket_imports(tour_id);
CREATE INDEX IF NOT EXISTS idx_eticket_imports_import_status ON eticket_imports(import_status);
CREATE INDEX IF NOT EXISTS idx_eticket_imports_imported_at ON eticket_imports(imported_at DESC);

-- ═══════════════════════════════════════════════════
-- TABLE 4: weather_cache
-- ═══════════════════════════════════════════════════
-- Cache for weather forecasts (6-hour TTL)
-- Reduces API calls to Open-Meteo
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS weather_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city VARCHAR(100) NOT NULL,
    forecast_date DATE NOT NULL,
    temp_max DECIMAL(5, 2),
    temp_min DECIMAL(5, 2),
    temp_avg DECIMAL(5, 2),
    precipitation_sum DECIMAL(5, 2),
    precipitation_probability INTEGER,
    wind_speed_max DECIMAL(5, 2),
    weather_code INTEGER,
    condition VARCHAR(50), -- sunny, cloudy, rainy, etc.
    raw_data JSONB,
    cached_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '6 hours'
);

-- Indexes for weather_cache
CREATE INDEX IF NOT EXISTS idx_weather_cache_city_date ON weather_cache(city, forecast_date);
CREATE INDEX IF NOT EXISTS idx_weather_cache_expires_at ON weather_cache(expires_at);

-- Unique constraint for weather cache
CREATE UNIQUE INDEX IF NOT EXISTS idx_weather_cache_unique ON weather_cache(city, forecast_date);

-- ═══════════════════════════════════════════════════
-- TABLE 5: vcard_imports
-- ═══════════════════════════════════════════════════
-- vCard contact import staging
-- Auto-classifies contacts (restaurant, hotel, driver, emergency)
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS vcard_imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES tl_users(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    organization VARCHAR(255),
    phone_numbers TEXT[],
    emails TEXT[],
    full_address TEXT,
    street VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    notes TEXT,
    suggested_type VARCHAR(50), -- restaurant, hotel, driver, emergency, guide
    confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
    mapping_status VARCHAR(50) DEFAULT 'pending', -- pending, mapped, rejected
    mapped_to_module VARCHAR(50), -- tastes, stay, routes
    mapped_to_id UUID,
    imported_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for vcard_imports
CREATE INDEX IF NOT EXISTS idx_vcard_imports_user_id ON vcard_imports(user_id);
CREATE INDEX IF NOT EXISTS idx_vcard_imports_mapping_status ON vcard_imports(mapping_status);
CREATE INDEX IF NOT EXISTS idx_vcard_imports_suggested_type ON vcard_imports(suggested_type);

-- ═══════════════════════════════════════════════════
-- TABLE 6: nodex_settings
-- ═══════════════════════════════════════════════════
-- User preferences for NODΞ
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS nodex_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES tl_users(id) ON DELETE CASCADE,
    language VARCHAR(10) DEFAULT 'it',
    default_currency VARCHAR(10) DEFAULT 'EUR',
    weather_units VARCHAR(20) DEFAULT 'metric', -- metric, imperial
    pdf_template_preference VARCHAR(50) DEFAULT 'standard',
    auto_import_vcards BOOLEAN DEFAULT FALSE,
    enable_weather_cache BOOLEAN DEFAULT TRUE,
    settings_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for nodex_settings
CREATE INDEX IF NOT EXISTS idx_nodex_settings_user_id ON nodex_settings(user_id);

-- Unique constraint for nodex_settings
CREATE UNIQUE INDEX IF NOT EXISTS idx_nodex_settings_unique_user ON nodex_settings(user_id);

-- ═══════════════════════════════════════════════════
-- TABLE 7: day_items
-- ═══════════════════════════════════════════════════
-- Movable day blocks (activities, meals, transport, suggestions)
-- Color-coded: orange, light_blue, blue, green, purple
-- Each item can be moved independently between days
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS day_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_id UUID NOT NULL REFERENCES tour_days(id) ON DELETE CASCADE,
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL, -- activity, lunch, dinner, transport, suggestion
    color VARCHAR(50) NOT NULL, -- orange, light_blue, blue, green, purple
    position INTEGER NOT NULL DEFAULT 0,
    start_time TIME,
    end_time TIME,
    duration INTEGER, -- in minutes
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    address TEXT,
    tastes_id UUID, -- Link to restaurant (blueriot_tastes)
    routes_id UUID, -- Link to transport (blueriot_routes)
    stay_id UUID, -- Link to hotel (blueriot_stay)
    ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
    price DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'EUR',
    notes TEXT,
    is_mandatory BOOLEAN DEFAULT FALSE,
    is_booking_required BOOLEAN DEFAULT FALSE,
    booking_status VARCHAR(50), -- pending, confirmed, cancelled
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for day_items
CREATE INDEX IF NOT EXISTS idx_day_items_day_id ON day_items(day_id);
CREATE INDEX IF NOT EXISTS idx_day_items_tour_id ON day_items(tour_id);
CREATE INDEX IF NOT EXISTS idx_day_items_item_type ON day_items(item_type);
CREATE INDEX IF NOT EXISTS idx_day_items_position ON day_items(day_id, position);

-- Unique constraint for position within day
CREATE UNIQUE INDEX IF NOT EXISTS idx_day_items_unique_position ON day_items(day_id, position);

-- ═══════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════
-- Auto-update updated_at timestamp
-- ═══════════════════════════════════════════════════

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all NODΞ tables
DROP TRIGGER IF EXISTS update_tour_days_updated_at ON tour_days;
CREATE TRIGGER update_tour_days_updated_at
    BEFORE UPDATE ON tour_days
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;
CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_nodex_settings_updated_at ON nodex_settings;
CREATE TRIGGER update_nodex_settings_updated_at
    BEFORE UPDATE ON nodex_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_day_items_updated_at ON day_items;
CREATE TRIGGER update_day_items_updated_at
    BEFORE UPDATE ON day_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════
-- VERIFICATION QUERY
-- ═══════════════════════════════════════════════════
-- Run this to verify all tables were created
-- ═══════════════════════════════════════════════════

SELECT
    table_name,
    CASE
        WHEN table_name IN ('tour_days', 'tickets', 'eticket_imports', 'weather_cache',
                            'vcard_imports', 'nodex_settings', 'day_items')
        THEN '✅ NODΞ Table'
        WHEN table_name IN ('blueriot_tastes', 'blueriot_routes', 'blueriot_stay', 'tours', 'tl_users')
        THEN '✓ Existing Table'
        ELSE 'Other'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'tour_days', 'tickets', 'eticket_imports', 'weather_cache',
    'vcard_imports', 'nodex_settings', 'day_items',
    'blueriot_tastes', 'blueriot_routes', 'blueriot_stay', 'tours', 'tl_users'
)
ORDER BY table_name;

-- ═══════════════════════════════════════════════════
-- SUCCESS! 🎉
-- ═══════════════════════════════════════════════════
-- You should now have:
-- ✅ 7 new NODΞ tables created
-- ✅ All indexes and constraints added
-- ✅ Triggers for auto-update timestamps
-- ✅ Existing tables untouched
--
-- Next steps:
-- 1. Deploy NODΞ Backend to Render
-- 2. Test API endpoints
-- 3. Connect frontend PWA
-- ═══════════════════════════════════════════════════
