-- ═══════════════════════════════════════════════════
-- 🔴 Create Remaining NODΞ Tables (6 tables)
-- ═══════════════════════════════════════════════════
-- Crea le 6 tabelle NODΞ mancanti
-- tour_days esiste già e non viene toccata
-- ═══════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════
-- TABLE 1: tickets
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    ticket_name VARCHAR(255),
    ticket_type VARCHAR(100),
    operator VARCHAR(255),
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

CREATE INDEX IF NOT EXISTS idx_tickets_tour_id ON tickets(tour_id);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_type ON tickets(ticket_type);
CREATE INDEX IF NOT EXISTS idx_tickets_operator ON tickets(operator);

-- ═══════════════════════════════════════════════════
-- TABLE 2: eticket_imports
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS eticket_imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES tours(id) ON DELETE SET NULL,
    user_id UUID REFERENCES tl_users(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    raw_text TEXT,
    extracted_data JSONB,
    extraction_method VARCHAR(50),
    confidence_score DECIMAL(3, 2),
    ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
    import_status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    imported_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eticket_imports_tour_id ON eticket_imports(tour_id);
CREATE INDEX IF NOT EXISTS idx_eticket_imports_import_status ON eticket_imports(import_status);
CREATE INDEX IF NOT EXISTS idx_eticket_imports_imported_at ON eticket_imports(imported_at DESC);

-- ═══════════════════════════════════════════════════
-- TABLE 3: weather_cache
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
    condition VARCHAR(50),
    raw_data JSONB,
    cached_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '6 hours'
);

CREATE INDEX IF NOT EXISTS idx_weather_cache_city_date ON weather_cache(city, forecast_date);
CREATE INDEX IF NOT EXISTS idx_weather_cache_expires_at ON weather_cache(expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_weather_cache_unique ON weather_cache(city, forecast_date);

-- ═══════════════════════════════════════════════════
-- TABLE 4: vcard_imports
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
    suggested_type VARCHAR(50),
    confidence_score DECIMAL(3, 2),
    mapping_status VARCHAR(50) DEFAULT 'pending',
    mapped_to_module VARCHAR(50),
    mapped_to_id UUID,
    imported_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vcard_imports_user_id ON vcard_imports(user_id);
CREATE INDEX IF NOT EXISTS idx_vcard_imports_mapping_status ON vcard_imports(mapping_status);
CREATE INDEX IF NOT EXISTS idx_vcard_imports_suggested_type ON vcard_imports(suggested_type);

-- ═══════════════════════════════════════════════════
-- TABLE 5: nodex_settings
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS nodex_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES tl_users(id) ON DELETE CASCADE,
    language VARCHAR(10) DEFAULT 'it',
    default_currency VARCHAR(10) DEFAULT 'EUR',
    weather_units VARCHAR(20) DEFAULT 'metric',
    pdf_template_preference VARCHAR(50) DEFAULT 'standard',
    auto_import_vcards BOOLEAN DEFAULT FALSE,
    enable_weather_cache BOOLEAN DEFAULT TRUE,
    settings_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nodex_settings_user_id ON nodex_settings(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_nodex_settings_unique_user ON nodex_settings(user_id);

-- ═══════════════════════════════════════════════════
-- TABLE 6: day_items
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS day_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_id UUID NOT NULL REFERENCES tour_days(id) ON DELETE CASCADE,
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    start_time TIME,
    end_time TIME,
    duration INTEGER,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    address TEXT,
    tastes_id UUID,
    routes_id UUID,
    stay_id UUID,
    ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
    price DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'EUR',
    notes TEXT,
    is_mandatory BOOLEAN DEFAULT FALSE,
    is_booking_required BOOLEAN DEFAULT FALSE,
    booking_status VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_day_items_day_id ON day_items(day_id);
CREATE INDEX IF NOT EXISTS idx_day_items_tour_id ON day_items(tour_id);
CREATE INDEX IF NOT EXISTS idx_day_items_item_type ON day_items(item_type);
CREATE INDEX IF NOT EXISTS idx_day_items_position ON day_items(day_id, position);
CREATE UNIQUE INDEX IF NOT EXISTS idx_day_items_unique_position ON day_items(day_id, position);

-- ═══════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
-- VERIFICA FINALE
-- ═══════════════════════════════════════════════════

SELECT
    'tour_days' as table_name,
    '✓ Already exists' as status
UNION ALL
SELECT table_name, '✅ Created' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('tickets', 'eticket_imports', 'weather_cache',
                   'vcard_imports', 'nodex_settings', 'day_items')
ORDER BY table_name;
