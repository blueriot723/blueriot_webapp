-- =====================================================
-- MIGRATION 002: TICKETS
-- =====================================================
-- Ticket management for tours (passes, single tickets, museum tickets)

CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Tour/Day reference
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    day_ids UUID[], -- Can be valid for multiple days

    -- Ticket info
    ticket_name VARCHAR(255) NOT NULL,
    ticket_type VARCHAR(100) NOT NULL, -- daily_pass, weekly_pass, single_ticket, museum_ticket, transport_ticket
    ticket_number VARCHAR(255),

    -- Operator
    operator VARCHAR(255),
    website VARCHAR(500),

    -- Validity
    valid_from DATE,
    valid_to DATE,
    validity_hours INTEGER, -- Hours from first use
    validity_days INTEGER, -- Days from first use

    -- Coverage
    cities TEXT[], -- Cities where valid
    zones TEXT[], -- Zones covered (e.g. Zone 1-3)
    coverage_notes TEXT,

    -- Passenger info
    passenger_name VARCHAR(255),
    is_nominative BOOLEAN DEFAULT FALSE,

    -- Pricing
    adult_price DECIMAL(10,2),
    child_price DECIMAL(10,2),
    group_discount_percentage INTEGER,

    -- Usage restrictions
    restrictions TEXT,
    blackout_dates DATE[],

    -- Notes
    notes TEXT,
    tl_notes TEXT,

    -- System
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES tl_users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tickets_tour ON tickets(tour_id);
CREATE INDEX IF NOT EXISTS idx_tickets_type ON tickets(ticket_type);
CREATE INDEX IF NOT EXISTS idx_tickets_valid_from ON tickets(valid_from);
CREATE INDEX IF NOT EXISTS idx_tickets_valid_to ON tickets(valid_to);
CREATE INDEX IF NOT EXISTS idx_tickets_cities ON tickets USING GIN(cities);
CREATE INDEX IF NOT EXISTS idx_tickets_day_ids ON tickets USING GIN(day_ids);

-- Comments
COMMENT ON TABLE tickets IS 'Tour tickets and passes';
COMMENT ON COLUMN tickets.ticket_type IS 'daily_pass, weekly_pass, single_ticket, museum_ticket, transport_ticket';
COMMENT ON COLUMN tickets.day_ids IS 'Days where this ticket is valid/needed';
