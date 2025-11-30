-- =====================================================
-- MIGRATION 005: VCARD IMPORTS
-- =====================================================
-- Track vCard imports and temporary staging area

CREATE TABLE IF NOT EXISTS vcard_imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Import metadata
    filename VARCHAR(255),
    file_size_bytes INTEGER,

    -- vCard data
    name VARCHAR(255) NOT NULL,
    formatted_name VARCHAR(255),
    organization VARCHAR(255),

    -- Contact info
    phone_numbers TEXT[], -- Can have multiple
    emails TEXT[],
    websites TEXT[],

    -- Address
    street_address TEXT,
    city VARCHAR(255),
    postal_code VARCHAR(50),
    country VARCHAR(100),
    full_address TEXT,

    -- Geolocation (if available in vCard)
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),

    -- Notes from vCard
    notes TEXT,

    -- Auto-classification
    suggested_type VARCHAR(100), -- restaurant, hotel, driver, emergency, other
    confidence_score DECIMAL(3,2),

    -- Mapping status
    mapping_status VARCHAR(50), -- pending, mapped, skipped, rejected
    mapped_to_module VARCHAR(50), -- tastes, stay, emergency
    mapped_to_id UUID, -- ID in the target module

    -- Manual review
    reviewed BOOLEAN DEFAULT FALSE,
    reviewed_by UUID REFERENCES tl_users(id),
    reviewed_at TIMESTAMP,

    -- Raw vCard data
    raw_vcard TEXT,

    -- System
    imported_at TIMESTAMP DEFAULT NOW(),
    imported_by UUID REFERENCES tl_users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vcard_name ON vcard_imports(name);
CREATE INDEX IF NOT EXISTS idx_vcard_city ON vcard_imports(city);
CREATE INDEX IF NOT EXISTS idx_vcard_status ON vcard_imports(mapping_status);
CREATE INDEX IF NOT EXISTS idx_vcard_type ON vcard_imports(suggested_type);
CREATE INDEX IF NOT EXISTS idx_vcard_module ON vcard_imports(mapped_to_module);
CREATE INDEX IF NOT EXISTS idx_vcard_reviewed ON vcard_imports(reviewed);

-- Comments
COMMENT ON TABLE vcard_imports IS 'Imported vCards with auto-classification';
COMMENT ON COLUMN vcard_imports.suggested_type IS 'Auto-detected type: restaurant, hotel, driver, emergency';
COMMENT ON COLUMN vcard_imports.mapping_status IS 'pending, mapped, skipped, rejected';
COMMENT ON COLUMN vcard_imports.mapped_to_module IS 'tastes, stay, emergency';
