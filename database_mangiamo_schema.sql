-- =====================================================
-- WEBAPP BLUERIOT MANGIAMO - DATABASE SCHEMA
-- Sistema completo per gestione ristoranti e trasporti
-- =====================================================

-- =====================================================
-- 1. ESPANSIONE TABELLA shared_restaurants
-- =====================================================

-- Aggiungi colonne alla tabella esistente shared_restaurants
ALTER TABLE shared_restaurants
ADD COLUMN IF NOT EXISTS discount_type TEXT[] DEFAULT '{}',  -- Array: 'sconto', 'gratuita', 'commissione'
ADD COLUMN IF NOT EXISTS group_size VARCHAR(50),             -- 'grande', 'piccolo', 'minimo', 'solo_tl'
ADD COLUMN IF NOT EXISTS purpose VARCHAR(50),                -- 'svago', 'business', etc
ADD COLUMN IF NOT EXISTS closed_days TEXT[] DEFAULT '{}',    -- Array: 'lunedi', 'martedi', etc
ADD COLUMN IF NOT EXISTS min_people INTEGER,                 -- Numero minimo persone
ADD COLUMN IF NOT EXISTS max_people INTEGER,                 -- Numero massimo persone (NULL se illimitato)

-- Geografia gerarchica
ADD COLUMN IF NOT EXISTS continent VARCHAR(100),             -- es. 'Europa'
ADD COLUMN IF NOT EXISTS country VARCHAR(100),               -- es. 'Italia'
ADD COLUMN IF NOT EXISTS region VARCHAR(100),                -- es. 'Lazio'
ADD COLUMN IF NOT EXISTS province VARCHAR(100),              -- es. 'RM'

-- Contatti (tutti opzionali)
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS website VARCHAR(500),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255),

-- Metadata
ADD COLUMN IF NOT EXISTS added_by UUID REFERENCES tl_users(id),
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP DEFAULT NOW();

-- Commento colonne esistenti per chiarezza
COMMENT ON COLUMN shared_restaurants.name IS 'Nome del ristorante';
COMMENT ON COLUMN shared_restaurants.city IS 'Città (manteniamo per retrocompatibilità)';
COMMENT ON COLUMN shared_restaurants.discount_type IS 'Tipi di sconto: sconto, gratuita, commissione - può essere multiplo';
COMMENT ON COLUMN shared_restaurants.group_size IS 'Dimensione gruppo consigliata';
COMMENT ON COLUMN shared_restaurants.purpose IS 'Scopo: svago, business, formale, informale';
COMMENT ON COLUMN shared_restaurants.closed_days IS 'Giorni di chiusura settimanale';
COMMENT ON COLUMN shared_restaurants.continent IS 'Continente (geografia gerarchica)';
COMMENT ON COLUMN shared_restaurants.country IS 'Nazione';
COMMENT ON COLUMN shared_restaurants.region IS 'Regione';
COMMENT ON COLUMN shared_restaurants.province IS 'Provincia';

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON shared_restaurants(city);
CREATE INDEX IF NOT EXISTS idx_restaurants_country ON shared_restaurants(country);
CREATE INDEX IF NOT EXISTS idx_restaurants_discount ON shared_restaurants USING GIN(discount_type);
CREATE INDEX IF NOT EXISTS idx_restaurants_verified ON shared_restaurants(verified);

-- =====================================================
-- 2. NUOVA TABELLA shared_transports
-- =====================================================

CREATE TABLE IF NOT EXISTS shared_transports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Tipo e info base
    transport_type VARCHAR(50) NOT NULL,  -- 'taxi', 'ncc', 'bus_privato', 'van', etc
    company_name VARCHAR(255) NOT NULL,

    -- Geografia gerarchica (stessa struttura dei ristoranti)
    continent VARCHAR(100),
    country VARCHAR(100),
    region VARCHAR(100),
    province VARCHAR(100),
    city VARCHAR(100),

    -- Servizi e caratteristiche
    services TEXT[] DEFAULT '{}',         -- 'aeroporto', 'stazione', 'tours', etc
    vehicle_types TEXT[] DEFAULT '{}',    -- 'sedan', 'van', 'minibus', etc
    max_passengers INTEGER,

    -- Prezzi (opzionali)
    price_range VARCHAR(50),              -- '€', '€€', '€€€'
    fixed_rates JSONB,                    -- JSON con tariffe fisse per tratte comuni

    -- Disponibilità
    available_24h BOOLEAN DEFAULT FALSE,
    closed_days TEXT[] DEFAULT '{}',

    -- Vantaggi per TL
    discount_type TEXT[] DEFAULT '{}',    -- 'sconto', 'gratuita', 'commissione'
    tl_benefits TEXT,                     -- Descrizione benefici specifici

    -- Contatti (tutti opzionali)
    contact_email VARCHAR(255),
    website VARCHAR(500),
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    contact_person VARCHAR(255),

    -- Metadata
    notes TEXT,
    added_by UUID REFERENCES tl_users(id),
    verified BOOLEAN DEFAULT FALSE,
    rating_avg DECIMAL(3,2),
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Commenti
COMMENT ON TABLE shared_transports IS 'Database condiviso di mezzi di trasporto (taxi, NCC, etc)';
COMMENT ON COLUMN shared_transports.transport_type IS 'Tipo: taxi, ncc, bus_privato, van';
COMMENT ON COLUMN shared_transports.services IS 'Servizi offerti: aeroporto, stazione, tours';
COMMENT ON COLUMN shared_transports.discount_type IS 'Vantaggi: sconto, gratuita, commissione';
COMMENT ON COLUMN shared_transports.fixed_rates IS 'Tariffe fisse in formato JSON';

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_transports_type ON shared_transports(transport_type);
CREATE INDEX IF NOT EXISTS idx_transports_city ON shared_transports(city);
CREATE INDEX IF NOT EXISTS idx_transports_country ON shared_transports(country);
CREATE INDEX IF NOT EXISTS idx_transports_verified ON shared_transports(verified);

-- =====================================================
-- 3. TABELLA SUGGERIMENTI TOUR
-- =====================================================

CREATE TABLE IF NOT EXISTS tour_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,

    -- Cosa viene suggerito
    suggestion_type VARCHAR(50) NOT NULL,  -- 'restaurant', 'transport'
    resource_id UUID NOT NULL,             -- ID del ristorante o trasporto

    -- Contesto del suggerimento
    day_number INTEGER,                    -- Giorno del tour (opzionale)
    meal_type VARCHAR(50),                 -- 'colazione', 'pranzo', 'cena' (per ristoranti)
    route_type VARCHAR(50),                -- 'aeroporto', 'hotel', 'escursione' (per trasporti)

    -- Stato
    status VARCHAR(50) DEFAULT 'suggested', -- 'suggested', 'accepted', 'rejected', 'used'
    accepted_at TIMESTAMP,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    notes TEXT
);

COMMENT ON TABLE tour_suggestions IS 'Suggerimenti automatici di ristoranti/trasporti per ogni tour';
COMMENT ON COLUMN tour_suggestions.suggestion_type IS 'Tipo: restaurant o transport';
COMMENT ON COLUMN tour_suggestions.status IS 'Stato: suggested, accepted, rejected, used';

-- Indici
CREATE INDEX IF NOT EXISTS idx_suggestions_tour ON tour_suggestions(tour_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_type ON tour_suggestions(suggestion_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON tour_suggestions(status);

-- =====================================================
-- 4. FUNZIONI HELPER PER SUGGERIMENTI INTELLIGENTI
-- =====================================================

-- Funzione per ottenere ristoranti disponibili in una città per un giorno specifico
CREATE OR REPLACE FUNCTION get_available_restaurants(
    p_city VARCHAR,
    p_day_of_week VARCHAR,
    p_min_people INTEGER DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    discount_type TEXT[],
    rating_avg DECIMAL,
    tl_free BOOLEAN,
    commission BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.name,
        r.discount_type,
        r.rating_avg,
        r.tl_free,
        r.commission
    FROM shared_restaurants r
    WHERE
        LOWER(r.city) = LOWER(p_city)
        AND (r.closed_days IS NULL OR NOT (p_day_of_week = ANY(r.closed_days)))
        AND (p_min_people IS NULL OR r.min_people IS NULL OR r.min_people <= p_min_people)
        AND (r.verified = TRUE OR r.verified IS NULL)
    ORDER BY
        r.rating_avg DESC NULLS LAST,
        r.rating_count DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_available_restaurants IS 'Trova ristoranti disponibili per città e giorno della settimana';

-- Funzione per ottenere trasporti in una città
CREATE OR REPLACE FUNCTION get_available_transports(
    p_city VARCHAR,
    p_transport_type VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    company_name VARCHAR,
    transport_type VARCHAR,
    discount_type TEXT[],
    rating_avg DECIMAL,
    available_24h BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id,
        t.company_name,
        t.transport_type,
        t.discount_type,
        t.rating_avg,
        t.available_24h
    FROM shared_transports t
    WHERE
        LOWER(t.city) = LOWER(p_city)
        AND (p_transport_type IS NULL OR t.transport_type = p_transport_type)
        AND (t.verified = TRUE OR t.verified IS NULL)
    ORDER BY
        t.rating_avg DESC NULLS LAST,
        t.rating_count DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_available_transports IS 'Trova trasporti disponibili per città e tipo';

-- =====================================================
-- 5. TRIGGER PER TIMESTAMP AUTOMATICO
-- =====================================================

CREATE OR REPLACE FUNCTION update_last_updated()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applica trigger alle tabelle
DROP TRIGGER IF EXISTS set_last_updated_restaurants ON shared_restaurants;
CREATE TRIGGER set_last_updated_restaurants
    BEFORE UPDATE ON shared_restaurants
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated();

DROP TRIGGER IF EXISTS set_last_updated_transports ON shared_transports;
CREATE TRIGGER set_last_updated_transports
    BEFORE UPDATE ON shared_transports
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated();

-- =====================================================
-- 6. RLS (ROW LEVEL SECURITY) - Opzionale
-- =====================================================

-- Se vuoi abilitare RLS per sicurezza:
-- ALTER TABLE shared_restaurants ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE shared_transports ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tour_suggestions ENABLE ROW LEVEL SECURITY;

-- Policy di esempio (tutti possono leggere, solo autenticati possono scrivere):
-- CREATE POLICY "Tutti possono vedere ristoranti" ON shared_restaurants FOR SELECT USING (true);
-- CREATE POLICY "TL possono aggiungere ristoranti" ON shared_restaurants FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- 7. DATI DI TEST (Opzionali)
-- =====================================================

-- Esempio ristorante Roma
/*
INSERT INTO shared_restaurants (
    name, city, country, region, province, continent,
    discount_type, group_size, closed_days,
    contact_email, phone, website,
    rating_avg, tl_free, commission
) VALUES (
    'Trattoria da Mario',
    'Roma',
    'Italia',
    'Lazio',
    'RM',
    'Europa',
    ARRAY['gratuita', 'commissione'],
    'grande',
    ARRAY['lunedi'],
    'mario@trattoria.it',
    '+39 06 1234567',
    'www.trattoriamario.it',
    4.5,
    TRUE,
    TRUE
);
*/

-- Esempio trasporto Roma
/*
INSERT INTO shared_transports (
    transport_type, company_name, city, country, continent,
    services, vehicle_types, max_passengers,
    discount_type, available_24h,
    phone, whatsapp, contact_person,
    rating_avg
) VALUES (
    'ncc',
    'Rome VIP Transfer',
    'Roma',
    'Italia',
    'Europa',
    ARRAY['aeroporto', 'stazione', 'tours'],
    ARRAY['sedan', 'van'],
    8,
    ARRAY['sconto', 'commissione'],
    TRUE,
    '+39 333 1234567',
    '+39 333 1234567',
    'Giuseppe',
    4.7
);
*/

-- =====================================================
-- FINE SCHEMA
-- =====================================================
