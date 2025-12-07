-- =====================================================
-- BLUERIOT COMPLETE DATABASE SETUP
-- =====================================================
-- ESEGUI QUESTO FILE IN SUPABASE SQL EDITOR
-- Copia TUTTO e incolla in: SQL Editor → New Query → Run
-- =====================================================
-- Ultima modifica: 2024-12-07
-- Creato per BlueRiot Syndicate Web App
-- =====================================================

-- ═══════════════════════════════════════════════════
-- SEZIONE 1: TABELLE UTENTI E AUTENTICAZIONE
-- ═══════════════════════════════════════════════════

-- Tabella TL (Tour Leaders)
CREATE TABLE IF NOT EXISTS tl_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    email text,
    phone text,
    company text,
    role text DEFAULT 'tl',
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════
-- SEZIONE 2: TABELLA ΤΔSΤΞ5 (TASTES - Ristoranti)
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS blueriot_tastes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    city text,
    location text,               -- Fallback per city
    region text,
    country text DEFAULT 'Italy',
    cuisine text,
    price_range text,            -- €, €€, €€€, €€€€
    address text,
    phone text,                  -- Può contenere più numeri separati da virgola
    google_maps_link text,
    opening_hours text,
    booking_needed boolean DEFAULT false,
    min_group_size integer,
    max_group_size integer,
    gratuity boolean DEFAULT false,        -- TL mangia gratis
    commission boolean DEFAULT false,
    commission_percentage decimal(5,2),
    discount_percentage decimal(5,2),
    notes text,
    tested_by text,
    tested_date date,
    rating_avg decimal(3,2) DEFAULT 0,
    total_ratings integer DEFAULT 0,
    created_by uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════
-- SEZIONE 3: TABELLA R0UT35 (ROUTES - Trasporti)
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS blueriot_routes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    from_location text NOT NULL,
    to_location text NOT NULL,
    type text DEFAULT 'Bus',     -- Bus, Treno, Ferry, Taxi, NCC
    company text,
    duration text,               -- es. "2h 30m"
    distance text,               -- es. "150 km"
    price text,
    price_per_person decimal(10,2),
    booking_url text,
    phone text,
    notes text,
    created_by uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════
-- SEZIONE 4: TABELLA SΤΔΥ (STAY - Hotel)
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS blueriot_stay (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    city text,
    region text,
    country text DEFAULT 'Italy',
    type text DEFAULT 'Hotel',   -- Hotel, B&B, Appartamento, Ostello
    stars integer,               -- 1-5
    address text,
    phone text,
    email text,
    website text,
    price text,                  -- es. "€80-120"
    price_per_night decimal(10,2),
    breakfast_included boolean DEFAULT true,
    commission boolean DEFAULT false,
    commission_percentage decimal(5,2),
    contact text,                -- Nome del contatto
    notes text,
    created_by uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════
-- SEZIONE 5: TABELLA TOURS (NODΞ - Tour Management)
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tours (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,                -- Owner del tour
    tl_id uuid REFERENCES tl_users(id),
    code text NOT NULL,          -- es. ITL240315
    name text NOT NULL,          -- es. "Best of Italy"
    operator text,               -- Tour Operator
    pax integer DEFAULT 0,       -- Numero passeggeri
    tl_count integer DEFAULT 1,  -- Numero Tour Leaders
    start_date date NOT NULL,
    end_date date,
    duration integer DEFAULT 7,  -- Giorni
    status text DEFAULT 'upcoming', -- upcoming, active, completed
    notes text,
    settings jsonb,              -- Impostazioni tour
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════
-- SEZIONE 6: TABELLA TOUR_ITEMS (Elementi giornalieri)
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tour_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id uuid REFERENCES tours(id) ON DELETE CASCADE,
    day integer NOT NULL,        -- Giorno del tour (1, 2, 3...)
    type text DEFAULT 'activity', -- activity, restaurant, transport, hotel, info, link, map
    title text NOT NULL,
    description text,
    time text,                   -- Orario (es. "09:00")
    link text,                   -- URL opzionale
    location text,               -- Indirizzo/luogo
    ref_id uuid,                 -- Riferimento a tastes/routes/stay
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════
-- SEZIONE 7: TABELLE ETICKET SYSTEM
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tour_passengers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id uuid REFERENCES tours(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    email text,
    phone text,
    room_number text,
    room_type text,              -- Single, Double, Triple, Twin
    ticket_generated boolean DEFAULT false,
    ticket_url text,
    wallet_pass_url text,
    qr_code text,
    notes text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id uuid UNIQUE REFERENCES tours(id) ON DELETE CASCADE,
    template_name text NOT NULL,
    template_file_url text NOT NULL,
    logo_url text,
    name_position_x integer,
    name_position_y integer,
    font_size integer DEFAULT 24,
    font_color text DEFAULT '#000000',
    created_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════
-- SEZIONE 8: TABELLE TOUR RESTAURANTS & HOTELS
-- ═══════════════════════════════════════════════════

-- Ristoranti specifici per tour (copia da blueriot_tastes)
CREATE TABLE IF NOT EXISTS tour_restaurants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id uuid REFERENCES tours(id) ON DELETE CASCADE,
    taste_id uuid REFERENCES blueriot_tastes(id),
    day integer,
    meal_type text,              -- breakfast, lunch, dinner
    time text,
    pax integer,
    confirmed boolean DEFAULT false,
    notes text,
    city text,
    region text,
    country text,
    created_at timestamptz DEFAULT now()
);

-- Hotel specifici per tour (copia da blueriot_stay)
CREATE TABLE IF NOT EXISTS hotels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id uuid REFERENCES tours(id) ON DELETE CASCADE,
    stay_id uuid REFERENCES blueriot_stay(id),
    day_start integer,           -- Giorno check-in
    day_end integer,             -- Giorno check-out
    nights integer,
    confirmed boolean DEFAULT false,
    confirmation_number text,
    notes text,
    city text,
    region text,
    country text,
    created_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════
-- SEZIONE 9: TABELLE PDF OCR & EXTRACTION
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tour_pdf_extractions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id uuid UNIQUE REFERENCES tours(id) ON DELETE CASCADE,
    pdf_filename text NOT NULL,
    raw_ocr_text text,
    extracted_data jsonb,
    extraction_status text DEFAULT 'pending',
    extraction_date timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════
-- SEZIONE 10: TABELLA RATINGS
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS taste_ratings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    taste_id uuid REFERENCES blueriot_tastes(id) ON DELETE CASCADE,
    user_id uuid,
    rating integer CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════
-- SEZIONE 11: INDEXES PER PERFORMANCE
-- ═══════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_tl_users_user_id ON tl_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tours_user_id ON tours(user_id);
CREATE INDEX IF NOT EXISTS idx_tours_tl_id ON tours(tl_id);
CREATE INDEX IF NOT EXISTS idx_tours_start_date ON tours(start_date);
CREATE INDEX IF NOT EXISTS idx_tour_items_tour_id ON tour_items(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_items_day ON tour_items(day);
CREATE INDEX IF NOT EXISTS idx_blueriot_tastes_city ON blueriot_tastes(city);
CREATE INDEX IF NOT EXISTS idx_blueriot_tastes_country ON blueriot_tastes(country);
CREATE INDEX IF NOT EXISTS idx_blueriot_routes_from ON blueriot_routes(from_location);
CREATE INDEX IF NOT EXISTS idx_blueriot_routes_to ON blueriot_routes(to_location);
CREATE INDEX IF NOT EXISTS idx_blueriot_stay_city ON blueriot_stay(city);
CREATE INDEX IF NOT EXISTS idx_tour_passengers_tour_id ON tour_passengers(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_restaurants_tour_id ON tour_restaurants(tour_id);
CREATE INDEX IF NOT EXISTS idx_hotels_tour_id ON hotels(tour_id);

-- ═══════════════════════════════════════════════════
-- SEZIONE 12: ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════

ALTER TABLE tl_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueriot_tastes ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueriot_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueriot_stay ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_pdf_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE taste_ratings ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════
-- SEZIONE 13: RLS POLICIES
-- ═══════════════════════════════════════════════════

-- TL Users - utenti possono vedere/modificare solo il proprio profilo
CREATE POLICY "Users can view own tl profile" ON tl_users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tl profile" ON tl_users FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tl profile" ON tl_users FOR UPDATE USING (auth.uid() = user_id);

-- Tours - utenti possono vedere/modificare solo i propri tour
CREATE POLICY "Users can view own tours" ON tours FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tours" ON tours FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tours" ON tours FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tours" ON tours FOR DELETE USING (auth.uid() = user_id);

-- Tour Items - collegati ai tour
CREATE POLICY "Users can manage tour items" ON tour_items FOR ALL USING (
    tour_id IN (SELECT id FROM tours WHERE user_id = auth.uid())
);

-- Database condivisi (tastes, routes, stay) - accessibili a tutti gli autenticati
CREATE POLICY "Authenticated can view tastes" ON blueriot_tastes FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert tastes" ON blueriot_tastes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update tastes" ON blueriot_tastes FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete tastes" ON blueriot_tastes FOR DELETE USING (true);

CREATE POLICY "Authenticated can view routes" ON blueriot_routes FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert routes" ON blueriot_routes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update routes" ON blueriot_routes FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete routes" ON blueriot_routes FOR DELETE USING (true);

CREATE POLICY "Authenticated can view stay" ON blueriot_stay FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert stay" ON blueriot_stay FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update stay" ON blueriot_stay FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete stay" ON blueriot_stay FOR DELETE USING (true);

-- Tour Passengers
CREATE POLICY "Allow read tour_passengers" ON tour_passengers FOR SELECT USING (true);
CREATE POLICY "Allow insert tour_passengers" ON tour_passengers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update tour_passengers" ON tour_passengers FOR UPDATE USING (true);
CREATE POLICY "Allow delete tour_passengers" ON tour_passengers FOR DELETE USING (true);

-- Ticket Templates
CREATE POLICY "Allow read ticket_templates" ON ticket_templates FOR SELECT USING (true);
CREATE POLICY "Allow insert ticket_templates" ON ticket_templates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update ticket_templates" ON ticket_templates FOR UPDATE USING (true);
CREATE POLICY "Allow delete ticket_templates" ON ticket_templates FOR DELETE USING (true);

-- Tour Restaurants & Hotels
CREATE POLICY "Allow manage tour_restaurants" ON tour_restaurants FOR ALL USING (true);
CREATE POLICY "Allow manage hotels" ON hotels FOR ALL USING (true);

-- PDF Extractions
CREATE POLICY "Allow manage pdf_extractions" ON tour_pdf_extractions FOR ALL USING (true);

-- Ratings
CREATE POLICY "Allow manage ratings" ON taste_ratings FOR ALL USING (true);

-- ═══════════════════════════════════════════════════
-- SEZIONE 14: GRANTS
-- ═══════════════════════════════════════════════════

GRANT ALL ON tl_users TO anon, authenticated;
GRANT ALL ON tours TO anon, authenticated;
GRANT ALL ON tour_items TO anon, authenticated;
GRANT ALL ON blueriot_tastes TO anon, authenticated;
GRANT ALL ON blueriot_routes TO anon, authenticated;
GRANT ALL ON blueriot_stay TO anon, authenticated;
GRANT ALL ON tour_passengers TO anon, authenticated;
GRANT ALL ON ticket_templates TO anon, authenticated;
GRANT ALL ON tour_restaurants TO anon, authenticated;
GRANT ALL ON hotels TO anon, authenticated;
GRANT ALL ON tour_pdf_extractions TO anon, authenticated;
GRANT ALL ON taste_ratings TO anon, authenticated;

-- ═══════════════════════════════════════════════════
-- VERIFICA SETUP
-- ═══════════════════════════════════════════════════

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════';
    RAISE NOTICE '✅ BLUERIOT DATABASE SETUP COMPLETATO!';
    RAISE NOTICE '═══════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Tabelle create:';
    RAISE NOTICE '  • tl_users          - Tour Leaders';
    RAISE NOTICE '  • tours             - Tour NODΞ';
    RAISE NOTICE '  • tour_items        - Elementi giornalieri';
    RAISE NOTICE '  • blueriot_tastes   - Database ristoranti ΤΔSΤΞ5';
    RAISE NOTICE '  • blueriot_routes   - Database trasporti R0UT35';
    RAISE NOTICE '  • blueriot_stay     - Database hotel SΤΔΥ';
    RAISE NOTICE '  • tour_passengers   - Passeggeri eTicket';
    RAISE NOTICE '  • ticket_templates  - Template biglietti';
    RAISE NOTICE '  • tour_restaurants  - Ristoranti per tour';
    RAISE NOTICE '  • hotels            - Hotel per tour';
    RAISE NOTICE '  • tour_pdf_extractions - PDF OCR';
    RAISE NOTICE '  • taste_ratings     - Valutazioni ristoranti';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 RLS abilitato su tutte le tabelle';
    RAISE NOTICE '📊 Indexes creati per performance';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════';
END $$;
