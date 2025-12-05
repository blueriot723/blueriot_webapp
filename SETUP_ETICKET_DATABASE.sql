-- =====================================================
-- COPIA TUTTO QUESTO FILE E INCOLLALO IN SUPABASE
-- SQL Editor → New Query → Incolla → Run
-- =====================================================

-- STEP 1: CREATE TOUR PASSENGERS TABLE
CREATE TABLE IF NOT EXISTS tour_passengers (
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

-- STEP 2: CREATE TICKET TEMPLATES TABLE
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

-- STEP 3: GRANT PERMISSIONS
GRANT ALL ON TABLE tour_passengers TO anon, authenticated;
GRANT ALL ON TABLE ticket_templates TO anon, authenticated;

-- STEP 4: CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_tour_passengers_tour_id ON tour_passengers(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_passengers_ticket_generated ON tour_passengers(ticket_generated);
CREATE INDEX IF NOT EXISTS idx_ticket_templates_tour_id ON ticket_templates(tour_id);

-- STEP 5: ENABLE ROW LEVEL SECURITY
ALTER TABLE tour_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_templates ENABLE ROW LEVEL SECURITY;

-- STEP 6: RLS POLICIES - tour_passengers
CREATE POLICY "Allow read access to tour_passengers" ON tour_passengers FOR SELECT USING (true);
CREATE POLICY "Allow insert access to tour_passengers" ON tour_passengers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update access to tour_passengers" ON tour_passengers FOR UPDATE USING (true);
CREATE POLICY "Allow delete access to tour_passengers" ON tour_passengers FOR DELETE USING (true);

-- STEP 7: RLS POLICIES - ticket_templates
CREATE POLICY "Allow read access to ticket_templates" ON ticket_templates FOR SELECT USING (true);
CREATE POLICY "Allow insert access to ticket_templates" ON ticket_templates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update access to ticket_templates" ON ticket_templates FOR UPDATE USING (true);
CREATE POLICY "Allow delete access to ticket_templates" ON ticket_templates FOR DELETE USING (true);

-- =====================================================
-- FATTO! Le tabelle sono state create.
-- Ora puoi usare il sistema eTicket nell'app!
-- =====================================================
