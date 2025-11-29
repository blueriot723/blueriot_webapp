-- =====================================================
-- BLUERIOT ECOSYSTEM - COMPLETE DATABASE SCHEMA
-- blueriot.world - Official WebApp Database
-- VERSIONE PULITA - Nessun riferimento a tabelle vecchie
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- AUTHENTICATION & USERS
-- =====================================================

-- Estendi la tabella tl_users esistente per l'ecosistema completo
ALTER TABLE tl_users
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'tl',
ADD COLUMN IF NOT EXISTS membership_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS membership_start DATE,
ADD COLUMN IF NOT EXISTS membership_end DATE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';

COMMENT ON TABLE tl_users IS 'Users of BlueRiot ecosystem - Tour Leaders and Members';
COMMENT ON COLUMN tl_users.role IS 'User role: admin, tl (tour leader), member';
COMMENT ON COLUMN tl_users.membership_status IS 'Membership status: active, pending, expired';

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_users_username ON tl_users(username);
CREATE INDEX IF NOT EXISTS idx_users_membership ON tl_users(membership_status);
CREATE INDEX IF NOT EXISTS idx_users_role ON tl_users(role);

-- =====================================================
-- SECTION 1: BLUERIOT TASTES
-- Database ristoranti, bar, bakery, gelaterie, etc.
-- =====================================================

CREATE TABLE blueriot_tastes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Info base
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    cuisine VARCHAR(100),

    -- Pricing
    price_range VARCHAR(10),

    -- Vantaggi TL (può essere multiplo)
    gratuity BOOLEAN DEFAULT FALSE,
    commission BOOLEAN DEFAULT FALSE,
    discount BOOLEAN DEFAULT FALSE,
    discount_percentage INTEGER,

    -- Location
    location VARCHAR(255),
    address TEXT,
    google_maps_link TEXT,

    -- Orari e booking
    opening_hours TEXT,
    closed_days TEXT[],
    booking_needed BOOLEAN DEFAULT FALSE,

    -- Idoneità
    suitable_for_groups BOOLEAN DEFAULT TRUE,
    min_group_size INTEGER,
    max_group_size INTEGER,

    -- Tour relevance
    tours_relevant TEXT[],

    -- Metadata
    tested_by VARCHAR(255),
    tested_date DATE,
    notes TEXT,

    -- Ratings
    rating_avg DECIMAL(3,2),
    rating_count INTEGER DEFAULT 0,

    -- Sistema
    added_by UUID REFERENCES tl_users(id),
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES tl_users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Social proof
    times_used INTEGER DEFAULT 0,
    last_used DATE
);

COMMENT ON TABLE blueriot_tastes IS 'BlueRiot Tastes - Database ristoranti, bar, bakery, gelaterie, aperitivi';
COMMENT ON COLUMN blueriot_tastes.type IS 'Tipo: restaurant, bar, bakery, quick_bite, gelateria, aperitivo, caffetteria';
COMMENT ON COLUMN blueriot_tastes.gratuity IS 'TL mangia/beve gratis';
COMMENT ON COLUMN blueriot_tastes.commission IS 'TL riceve commissione';
COMMENT ON COLUMN blueriot_tastes.discount IS 'Sconto per il gruppo';

-- Indici
CREATE INDEX idx_tastes_type ON blueriot_tastes(type);
CREATE INDEX idx_tastes_location ON blueriot_tastes(location);
CREATE INDEX idx_tastes_verified ON blueriot_tastes(verified);
CREATE INDEX idx_tastes_gratuity ON blueriot_tastes(gratuity);
CREATE INDEX idx_tastes_rating ON blueriot_tastes(rating_avg DESC);

-- =====================================================
-- SECTION 2: BLUERIOT ROUTES
-- Database trasporti: bus, ferry, NCC, taxi, treni
-- =====================================================

CREATE TABLE blueriot_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Tipo trasporto
    transport_type VARCHAR(100) NOT NULL,
    train_category VARCHAR(50),

    -- Operatore
    operator_name VARCHAR(255) NOT NULL,

    -- Area e tratta
    area_served VARCHAR(255),
    start_point VARCHAR(255),
    end_point VARCHAR(255),

    -- Frequenza e durata
    frequency VARCHAR(100),
    duration VARCHAR(100),

    -- Pricing
    price VARCHAR(100),
    ticket_info TEXT,

    -- Affidabilità
    reliability VARCHAR(50),
    reliability_notes TEXT,

    -- Contatti
    contacts TEXT,
    website VARCHAR(500),
    booking_url VARCHAR(500),

    -- Maps
    maps_link TEXT,
    route_map_url TEXT,

    -- Metadata
    notes TEXT,
    tips TEXT,

    -- Ratings
    rating_avg DECIMAL(3,2),
    rating_count INTEGER DEFAULT 0,

    -- Sistema
    added_by UUID REFERENCES tl_users(id),
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES tl_users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Usage
    times_used INTEGER DEFAULT 0,
    last_used DATE
);

COMMENT ON TABLE blueriot_routes IS 'BlueRiot Routes - Database trasporti: bus, ferry, NCC, taxi, treni';
COMMENT ON COLUMN blueriot_routes.transport_type IS 'Tipo: bus, ferry, ncc, taxi, private, train';
COMMENT ON COLUMN blueriot_routes.train_category IS 'Categoria treno: AV, IC, EC, R, RV, S, RE';
COMMENT ON COLUMN blueriot_routes.reliability IS 'Affidabilità: high, medium, low';

-- Indici
CREATE INDEX idx_routes_type ON blueriot_routes(transport_type);
CREATE INDEX idx_routes_operator ON blueriot_routes(operator_name);
CREATE INDEX idx_routes_area ON blueriot_routes(area_served);
CREATE INDEX idx_routes_verified ON blueriot_routes(verified);
CREATE INDEX idx_routes_reliability ON blueriot_routes(reliability);

-- =====================================================
-- SECTION 3: BLUERIOT STAY
-- Database hotel, B&B, guesthouse suggeriti dai TL
-- =====================================================

CREATE TABLE blueriot_stay (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Info base
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,

    -- Location
    location VARCHAR(255),
    address TEXT,
    google_maps_link TEXT,
    distance_from_center VARCHAR(100),

    -- Pricing
    price_range VARCHAR(100),

    -- Contatti e booking
    contact VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(500),
    booking_url VARCHAR(500),

    -- Idoneità
    suitable_for_families BOOLEAN DEFAULT FALSE,
    suitable_for_groups BOOLEAN DEFAULT FALSE,
    max_guests INTEGER,

    -- Facilities
    facilities TEXT,
    facilities_array TEXT[],

    -- Commissioni TL
    commission BOOLEAN DEFAULT FALSE,
    commission_percentage INTEGER,
    special_tl_rate BOOLEAN DEFAULT FALSE,
    special_rate_details TEXT,

    -- Metadata
    notes TEXT,
    tested_by VARCHAR(255),
    tested_date DATE,
    recommended_for TEXT,

    -- Ratings
    rating_avg DECIMAL(3,2),
    rating_count INTEGER DEFAULT 0,

    -- Sistema
    added_by UUID REFERENCES tl_users(id),
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES tl_users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Usage
    times_used INTEGER DEFAULT 0,
    last_used DATE
);

COMMENT ON TABLE blueriot_stay IS 'BlueRiot Stay - Database hotel, B&B, guesthouse suggeriti';
COMMENT ON COLUMN blueriot_stay.type IS 'Tipo: hotel, bnb, guesthouse, boutique, hostel, apartment';
COMMENT ON COLUMN blueriot_stay.facilities_array IS 'Array facilities per filtri';

-- Indici
CREATE INDEX idx_stay_type ON blueriot_stay(type);
CREATE INDEX idx_stay_location ON blueriot_stay(location);
CREATE INDEX idx_stay_verified ON blueriot_stay(verified);
CREATE INDEX idx_stay_families ON blueriot_stay(suitable_for_families);
CREATE INDEX idx_stay_rating ON blueriot_stay(rating_avg DESC);

-- =====================================================
-- SECTION 4: SYNDICATE HUB
-- =====================================================

-- Tabella per documenti/PDFs del Syndicate
CREATE TABLE syndicate_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Info documento
    title VARCHAR(255) NOT NULL,
    description TEXT,
    document_type VARCHAR(100),

    -- File
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    file_type VARCHAR(50),

    -- Accesso
    access_level VARCHAR(50) DEFAULT 'member',

    -- Metadata
    uploaded_by UUID REFERENCES tl_users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Usage stats
    download_count INTEGER DEFAULT 0,
    last_downloaded TIMESTAMP
);

COMMENT ON TABLE syndicate_documents IS 'Documenti del Syndicate: forms, guide, template, contratti';

-- Tabella per feedback count
CREATE TABLE syndicate_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Tour reference
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    tour_code VARCHAR(50),

    -- Feedback data
    feedback_count INTEGER DEFAULT 0,
    positive_count INTEGER DEFAULT 0,
    negative_count INTEGER DEFAULT 0,

    -- Dettagli
    feedback_data JSONB,

    -- Metadata
    tl_id UUID REFERENCES tl_users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE syndicate_feedback IS 'Conteggio feedback per tour del Syndicate';

-- Tabella per e-tickets
CREATE TABLE syndicate_etickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Ticket info
    ticket_code VARCHAR(100) UNIQUE NOT NULL,
    ticket_type VARCHAR(100),

    -- Riferimenti
    user_id UUID REFERENCES tl_users(id),
    tour_id UUID REFERENCES tours(id),

    -- Validità
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,

    -- Usage
    used_at TIMESTAMP,
    used_by UUID REFERENCES tl_users(id),

    -- Dati ticket
    ticket_data JSONB,

    -- QR code
    qr_code_url TEXT,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE syndicate_etickets IS 'E-tickets per eventi, workshop, membership Syndicate';

-- =====================================================
-- FUNZIONI HELPER
-- =====================================================

-- Funzione per cercare locali (tastes) con filtri
CREATE OR REPLACE FUNCTION search_tastes(
    p_type VARCHAR DEFAULT NULL,
    p_location VARCHAR DEFAULT NULL,
    p_gratuity BOOLEAN DEFAULT NULL,
    p_verified BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    type VARCHAR,
    location VARCHAR,
    price_range VARCHAR,
    rating_avg DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id,
        t.name,
        t.type,
        t.location,
        t.price_range,
        t.rating_avg
    FROM blueriot_tastes t
    WHERE
        (p_type IS NULL OR t.type = p_type)
        AND (p_location IS NULL OR LOWER(t.location) LIKE '%' || LOWER(p_location) || '%')
        AND (p_gratuity IS NULL OR t.gratuity = p_gratuity)
        AND (p_verified IS NULL OR t.verified = p_verified)
    ORDER BY t.rating_avg DESC NULLS LAST, t.times_used DESC;
END;
$$ LANGUAGE plpgsql;

-- Funzione per cercare trasporti
CREATE OR REPLACE FUNCTION search_routes(
    p_transport_type VARCHAR DEFAULT NULL,
    p_area VARCHAR DEFAULT NULL,
    p_reliability VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    transport_type VARCHAR,
    operator_name VARCHAR,
    area_served VARCHAR,
    reliability VARCHAR,
    rating_avg DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.transport_type,
        r.operator_name,
        r.area_served,
        r.reliability,
        r.rating_avg
    FROM blueriot_routes r
    WHERE
        (p_transport_type IS NULL OR r.transport_type = p_transport_type)
        AND (p_area IS NULL OR LOWER(r.area_served) LIKE '%' || LOWER(p_area) || '%')
        AND (p_reliability IS NULL OR r.reliability = p_reliability)
    ORDER BY r.rating_avg DESC NULLS LAST, r.times_used DESC;
END;
$$ LANGUAGE plpgsql;

-- Funzione per cercare alloggi
CREATE OR REPLACE FUNCTION search_stay(
    p_type VARCHAR DEFAULT NULL,
    p_location VARCHAR DEFAULT NULL,
    p_families BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    type VARCHAR,
    location VARCHAR,
    price_range VARCHAR,
    rating_avg DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.name,
        s.type,
        s.location,
        s.price_range,
        s.rating_avg
    FROM blueriot_stay s
    WHERE
        (p_type IS NULL OR s.type = p_type)
        AND (p_location IS NULL OR LOWER(s.location) LIKE '%' || LOWER(p_location) || '%')
        AND (p_families IS NULL OR s.suitable_for_families = p_families)
    ORDER BY s.rating_avg DESC NULLS LAST, s.times_used DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER PER UPDATED_AT AUTOMATICO
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applica trigger a tutte le tabelle
CREATE TRIGGER set_updated_at_tastes
    BEFORE UPDATE ON blueriot_tastes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_routes
    BEFORE UPDATE ON blueriot_routes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_stay
    BEFORE UPDATE ON blueriot_stay
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- VIEWS UTILI
-- =====================================================

-- View per i top rated tastes
CREATE OR REPLACE VIEW top_tastes AS
SELECT
    id, name, type, location, price_range,
    rating_avg, rating_count, times_used,
    gratuity, commission, discount
FROM blueriot_tastes
WHERE verified = TRUE AND rating_avg >= 4.0
ORDER BY rating_avg DESC, rating_count DESC
LIMIT 50;

-- View per statistiche utente
CREATE OR REPLACE VIEW user_stats AS
SELECT
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.membership_status,
    COUNT(DISTINCT t.id) as tours_count,
    COUNT(DISTINCT bt.id) as tastes_added,
    COUNT(DISTINCT br.id) as routes_added,
    COUNT(DISTINCT bs.id) as stays_added
FROM tl_users u
LEFT JOIN tours t ON t.tl_id = u.id
LEFT JOIN blueriot_tastes bt ON bt.added_by = u.id
LEFT JOIN blueriot_routes br ON br.added_by = u.id
LEFT JOIN blueriot_stay bs ON bs.added_by = u.id
GROUP BY u.id;

-- =====================================================
-- FINE SCHEMA
-- =====================================================
