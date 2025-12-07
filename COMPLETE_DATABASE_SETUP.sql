-- =====================================================
-- BLUERIOT DATABASE SCHEMA REFERENCE
-- =====================================================
-- Questo file documenta lo schema ESISTENTE in Supabase
-- Ultima modifica: 2025-12-07
-- =====================================================
-- NOTA: Le tabelle esistono già! Questo file è solo
-- documentazione di riferimento per gli sviluppatori.
-- =====================================================


-- ═══════════════════════════════════════════════════════════════
-- SEZIONE 1: tl_users (Tour Leaders)
-- ═══════════════════════════════════════════════════════════════
-- Profili Tour Leader collegati a auth.users

/*
CREATE TABLE tl_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE REFERENCES auth.users(id),
    username varchar UNIQUE,
    full_name varchar,
    email varchar,
    phone varchar,
    role varchar,                    -- 'tl', 'admin', etc.
    membership_status varchar,
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz
);
*/


-- ═══════════════════════════════════════════════════════════════
-- SEZIONE 2: tours (NODΞ Tour Management)
-- ═══════════════════════════════════════════════════════════════
-- Tour gestiti dai TL

/*
CREATE TABLE tours (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tl_id uuid REFERENCES tl_users(id),          -- FK a Tour Leader
    code text UNIQUE NOT NULL,                   -- es. ITL240315
    name text NOT NULL,
    operator text,                               -- Tour Operator
    start_date date NOT NULL,
    end_date date,                               -- Durata calcolata da date
    status text DEFAULT 'upcoming',              -- upcoming, active, completed
    passenger_count integer DEFAULT 0,           -- Numero passeggeri
    feedback_count integer DEFAULT 0,
    map_url text,
    operator_website text,
    created_at timestamptz DEFAULT now()
);

-- NOTA: Non esiste colonna 'duration' - calcola da (end_date - start_date)
-- NOTA: Non esiste 'user_id' - usa 'tl_id' tramite tl_users
*/


-- ═══════════════════════════════════════════════════════════════
-- SEZIONE 3: tour_days (Giorni del Tour)
-- ═══════════════════════════════════════════════════════════════

/*
CREATE TABLE tour_days (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id uuid REFERENCES tours(id) ON DELETE CASCADE,
    day_number integer NOT NULL,                 -- 1, 2, 3...
    date date,
    city text,
    cities text[],                               -- Array di città
    title text,
    description text,
    wake_up_time time,
    morning_schedule text,
    afternoon_schedule text,
    evening_schedule text,
    notes text,
    hotel_id uuid,
    tastes_ids uuid[],
    routes_ids uuid[],
    ticket_ids uuid[],
    is_hiking_day boolean DEFAULT false,
    activities jsonb,
    created_at timestamptz DEFAULT now(),
    UNIQUE(tour_id, day_number)
);
*/


-- ═══════════════════════════════════════════════════════════════
-- SEZIONE 4: day_items (Elementi Giornalieri)
-- ═══════════════════════════════════════════════════════════════

/*
CREATE TABLE day_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id uuid REFERENCES tour_days(id) ON DELETE CASCADE,
    tour_id uuid REFERENCES tours(id) ON DELETE CASCADE,
    item_type varchar NOT NULL,                  -- activity, restaurant, transport, hotel, info
    color varchar,
    position integer DEFAULT 0,                  -- Ordine elementi
    start_time time,
    end_time time,
    duration integer,                            -- Minuti
    title varchar NOT NULL,
    description text,
    location varchar,
    address text,
    tastes_id uuid REFERENCES blueriot_tastes(id),
    routes_id uuid REFERENCES blueriot_routes(id),
    stay_id uuid REFERENCES blueriot_stay(id),
    ticket_id uuid,
    price numeric,
    currency varchar DEFAULT 'EUR',
    notes text,
    is_mandatory boolean DEFAULT false,
    is_booking_required boolean DEFAULT false,
    booking_status varchar,
    metadata jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz
);

-- NOTA: Usa 'item_type' non 'type'
-- NOTA: Usa 'start_time' (time) non 'time' (text)
-- NOTA: 'position' per ordinamento, non 'sort_order'
*/


-- ═══════════════════════════════════════════════════════════════
-- SEZIONE 5: blueriot_tastes (ΤΔSΤΞ5 - Ristoranti)
-- ═══════════════════════════════════════════════════════════════

/*
CREATE TABLE blueriot_tastes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar NOT NULL,
    type varchar NOT NULL,                       -- ristorante, bar, pizzeria, etc.
    cuisine varchar,
    price_range varchar,                         -- €, €€, €€€, €€€€
    location varchar,
    city varchar,
    region varchar,
    country varchar DEFAULT 'Italy',
    address text,
    google_maps_link text,
    phone text,
    contact_person text,
    opening_hours text,
    closed_days text[],                          -- Array giorni chiusura
    booking_needed boolean DEFAULT false,
    suitable_for_groups boolean DEFAULT true,
    min_group_size integer,
    max_group_size integer,
    tours_relevant text[],
    gratuity boolean DEFAULT false,              -- TL mangia gratis
    commission boolean DEFAULT false,
    commission_percentage integer,
    discount boolean DEFAULT false,
    discount_percentage integer,
    notes text,
    tested_by varchar,
    tested_date date,
    rating_avg numeric,
    rating_count integer DEFAULT 0,
    added_by uuid,
    verified boolean DEFAULT false,
    verified_by uuid,
    times_used integer DEFAULT 0,
    last_used date,
    created_at timestamp DEFAULT now(),
    updated_at timestamp
);
*/


-- ═══════════════════════════════════════════════════════════════
-- SEZIONE 6: blueriot_routes (R0UT35 - Trasporti)
-- ═══════════════════════════════════════════════════════════════

/*
CREATE TABLE blueriot_routes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    transport_type varchar NOT NULL,             -- Bus, Train, Ferry, etc.
    train_category varchar,
    operator_name varchar NOT NULL,
    area_served varchar,
    start_point varchar,                         -- Partenza
    end_point varchar,                           -- Arrivo
    frequency varchar,
    duration varchar,
    price varchar,
    ticket_info text,
    reliability varchar,
    reliability_notes text,
    contacts text,
    website varchar,
    booking_url varchar,
    maps_link text,
    route_map_url text,
    notes text,
    tips text,
    rating_avg numeric,
    rating_count integer DEFAULT 0,
    added_by uuid,
    verified boolean DEFAULT false,
    verified_by uuid,
    times_used integer DEFAULT 0,
    last_used date,
    created_at timestamp DEFAULT now(),
    updated_at timestamp
);

-- NOTA: Usa 'start_point' e 'end_point', non 'from_location' e 'to_location'
-- NOTA: Usa 'transport_type' non 'type'
-- NOTA: Usa 'operator_name' non 'company'
*/


-- ═══════════════════════════════════════════════════════════════
-- SEZIONE 7: blueriot_stay (SΤΔΥ - Hotel)
-- ═══════════════════════════════════════════════════════════════

/*
CREATE TABLE blueriot_stay (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar NOT NULL,
    type varchar NOT NULL,                       -- Hotel, B&B, Apartment, Hostel
    location varchar,                            -- Città/zona
    address text,
    google_maps_link text,
    distance_from_center varchar,
    price_range varchar,                         -- €, €€, €€€
    contact varchar,
    phone varchar,
    website varchar,
    booking_url varchar,
    suitable_for_families boolean DEFAULT true,
    suitable_for_groups boolean DEFAULT true,
    max_guests integer,
    facilities text,
    facilities_array text[],
    commission boolean DEFAULT false,
    commission_percentage integer,
    special_tl_rate boolean DEFAULT false,
    special_rate_details text,
    notes text,
    tested_by varchar,
    tested_date date,
    recommended_for text,
    rating_avg numeric,
    rating_count integer DEFAULT 0,
    added_by uuid,
    verified boolean DEFAULT false,
    verified_by uuid,
    times_used integer DEFAULT 0,
    last_used date,
    created_at timestamp DEFAULT now(),
    updated_at timestamp
);

-- NOTA: Usa 'location' non 'city'
-- NOTA: Usa 'price_range' non 'price'
-- NOTA: Non esiste colonna 'stars'
*/


-- ═══════════════════════════════════════════════════════════════
-- SEZIONE 8: tour_passengers (eTicket System)
-- ═══════════════════════════════════════════════════════════════

/*
CREATE TABLE tour_passengers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id uuid REFERENCES tours(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    email text,
    phone text,
    ticket_generated boolean DEFAULT false,
    ticket_url text,
    wallet_pass_url text,
    created_at timestamptz DEFAULT now()
);

-- NOTA: Non esistono colonne 'room_number', 'room_type', 'qr_code', 'notes'
*/


-- ═══════════════════════════════════════════════════════════════
-- SEZIONE 9: ticket_templates
-- ═══════════════════════════════════════════════════════════════

/*
CREATE TABLE ticket_templates (
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
*/


-- ═══════════════════════════════════════════════════════════════
-- SEZIONE 10: tour_pdf_extractions (PDF OCR)
-- ═══════════════════════════════════════════════════════════════

/*
CREATE TABLE tour_pdf_extractions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id uuid UNIQUE REFERENCES tours(id) ON DELETE CASCADE,
    pdf_filename text,
    raw_ocr_text text,
    extracted_data jsonb,
    extraction_status text DEFAULT 'pending',
    extraction_date timestamptz,
    created_at timestamptz DEFAULT now()
);
*/


-- ═══════════════════════════════════════════════════════════════
-- SEZIONE 11: restaurant_ratings
-- ═══════════════════════════════════════════════════════════════
-- NOTA: Si chiama 'restaurant_ratings' NON 'taste_ratings'

/*
CREATE TABLE restaurant_ratings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid REFERENCES blueriot_tastes(id),
    tl_id uuid REFERENCES tl_users(id),
    rating integer CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamptz DEFAULT now(),
    UNIQUE(restaurant_id, tl_id)
);
*/


-- ═══════════════════════════════════════════════════════════════
-- SEZIONE 12: Altre Tabelle Esistenti
-- ═══════════════════════════════════════════════════════════════

/*
Tabelle aggiuntive già presenti nel database:

- hotels                    - Hotel specifici per tour
- tour_restaurants          - Ristoranti specifici per tour
- tour_hotels              - Link tour-hotel
- tour_activities          - Attività tour
- tour_documents           - Documenti tour
- tour_files               - File allegati
- tour_links               - Link utili
- tour_emergency_contacts  - Contatti emergenza
- tour_settings            - Impostazioni tour
- tour_templates           - Template tour predefiniti
- emergency_contacts       - Contatti emergenza globali
- eticket_imports          - Import eTicket
- syndicate_documents      - Documenti Syndicate
- syndicate_etickets       - eTicket Syndicate
- syndicate_feedback       - Feedback Syndicate
- feedback_responses       - Risposte feedback
- tickets                  - Biglietti
- top_tastes               - Ristoranti preferiti
- user_stats               - Statistiche utente
- vcard_imports            - Import vCard
- weather_cache            - Cache meteo
- nodex_settings           - Impostazioni NODΞ
*/


-- ═══════════════════════════════════════════════════════════════
-- SEZIONE 13: RLS Policies Esistenti
-- ═══════════════════════════════════════════════════════════════

/*
Policies già configurate:

blueriot_tastes:
  - "Public can read tastes" (SELECT) - true
  - "TLs can insert tastes" (INSERT)
  - "TLs can update tastes" (UPDATE)
  - "TLs can delete tastes" (DELETE)

blueriot_routes:
  - "TLs can view all routes" (SELECT)
  - "TLs can insert routes" (INSERT)
  - "TLs can update routes" (UPDATE)
  - "TLs can delete routes" (DELETE)

blueriot_stay:
  - "TLs can view all stays" (SELECT)
  - "TLs can insert stays" (INSERT)
  - "TLs can update stays" (UPDATE)
  - "TLs can delete stays" (DELETE)

tours:
  - "TLs can view their own tours" (SELECT)
  - "TLs can insert their own tours" (INSERT)
  - "TLs can update their own tours" (UPDATE)
  - "TLs can delete their own tours" (DELETE)
  - "Allow insert for authenticated users" (INSERT)

tour_days:
  - "TLs can view their tour days" (SELECT)
  - "TLs can insert their tour days" (INSERT)
  - "TLs can update their tour days" (UPDATE)
  - "TLs can delete their tour days" (DELETE)

tour_passengers, ticket_templates:
  - Allow read/insert/update/delete for all authenticated

tl_users:
  - "Anon read tl_users" (SELECT) - true
  - "Allow authenticated users to read all TL profiles" (SELECT)
  - "Authenticated can update own profile" (UPDATE)
*/


-- ═══════════════════════════════════════════════════════════════
-- SEZIONE 14: Query Diagnostiche Utili
-- ═══════════════════════════════════════════════════════════════

-- Lista tutte le tabelle
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Lista colonne di una tabella
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tours';

-- Lista tutte le policies
-- SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public';

-- Lista tutti gli indici
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';


-- ═══════════════════════════════════════════════════════════════
-- FINE DOCUMENTAZIONE SCHEMA
-- ═══════════════════════════════════════════════════════════════
