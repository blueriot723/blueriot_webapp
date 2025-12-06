-- =====================================================
-- MIGRATION 006: NODΞ SETTINGS
-- =====================================================
-- System settings and preferences for NODΞ

CREATE TABLE IF NOT EXISTS nodex_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User reference (one settings row per TL)
    tl_user_id UUID NOT NULL UNIQUE REFERENCES tl_users(id) ON DELETE CASCADE,

    -- General preferences
    language VARCHAR(5) DEFAULT 'it', -- it, en, de, fr, es
    timezone VARCHAR(100) DEFAULT 'Europe/Rome',

    -- Notifications
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT FALSE,

    -- Auto-classification
    auto_classify_tickets BOOLEAN DEFAULT TRUE,
    auto_classify_vcards BOOLEAN DEFAULT TRUE,
    classification_threshold DECIMAL(3,2) DEFAULT 0.70, -- Minimum confidence

    -- PDF OCP preferences
    pdf_include_weather BOOLEAN DEFAULT TRUE,
    pdf_include_maps BOOLEAN DEFAULT TRUE,
    pdf_language VARCHAR(5) DEFAULT 'it',

    -- Weather
    weather_cache_hours INTEGER DEFAULT 6,
    weather_units VARCHAR(10) DEFAULT 'metric', -- metric, imperial

    -- eTicket reader
    eticket_auto_assign BOOLEAN DEFAULT FALSE,
    eticket_store_raw_files BOOLEAN DEFAULT TRUE,

    -- vCard
    vcard_auto_map BOOLEAN DEFAULT FALSE,
    vcard_require_review BOOLEAN DEFAULT TRUE,

    -- UI preferences
    theme VARCHAR(50) DEFAULT 'cyber-dark',
    compact_view BOOLEAN DEFAULT FALSE,

    -- Advanced
    advanced_mode BOOLEAN DEFAULT FALSE,
    developer_mode BOOLEAN DEFAULT FALSE,

    -- System
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nodex_settings_user ON nodex_settings(tl_user_id);

-- Comments
COMMENT ON TABLE nodex_settings IS 'NODΞ user preferences and settings';
COMMENT ON COLUMN nodex_settings.classification_threshold IS 'Minimum confidence (0-1) for auto-classification';
COMMENT ON COLUMN nodex_settings.weather_cache_hours IS 'Hours before refreshing weather cache';
