-- =====================================================
-- MIGRATION 003: ETICKET IMPORT LOG
-- =====================================================
-- Track imported eTickets for audit and classification

CREATE TABLE IF NOT EXISTS eticket_imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Import metadata
    filename VARCHAR(255),
    file_type VARCHAR(50), -- pdf, image_qr, image_barcode
    file_size_bytes INTEGER,

    -- Parsing results
    parse_status VARCHAR(50), -- success, partial, failed
    parse_method VARCHAR(100), -- pdf_text, qr_code, barcode_ean, barcode_code128

    -- Extracted data (raw)
    raw_text TEXT,
    extracted_data JSONB,

    -- Classification
    auto_classified_type VARCHAR(100),
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    manual_override_type VARCHAR(100),

    -- Linked ticket (if created)
    ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,

    -- Tour/Day assignment
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    day_id UUID,

    -- System
    imported_at TIMESTAMP DEFAULT NOW(),
    imported_by UUID REFERENCES tl_users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_eticket_imports_tour ON eticket_imports(tour_id);
CREATE INDEX IF NOT EXISTS idx_eticket_imports_ticket ON eticket_imports(ticket_id);
CREATE INDEX IF NOT EXISTS idx_eticket_imports_status ON eticket_imports(parse_status);
CREATE INDEX IF NOT EXISTS idx_eticket_imports_type ON eticket_imports(auto_classified_type);
CREATE INDEX IF NOT EXISTS idx_eticket_imports_date ON eticket_imports(imported_at);

-- Comments
COMMENT ON TABLE eticket_imports IS 'Log of imported eTickets with parsing metadata';
COMMENT ON COLUMN eticket_imports.extracted_data IS 'JSON structure with all parsed fields';
COMMENT ON COLUMN eticket_imports.confidence_score IS 'Auto-classification confidence (0-1)';
