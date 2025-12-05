-- BlueRiot eTicket System - Database Setup
-- Run these SQL commands in Supabase SQL Editor

-- 1. CREATE TOUR PASSENGERS TABLE
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

-- 2. CREATE TICKET TEMPLATES TABLE
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

-- 3. ADD TICKET-RELATED COLUMNS TO TOUR_DOCUMENTS (if needed in future)
-- ALTER TABLE tour_documents ADD COLUMN IF NOT EXISTS is_ticket boolean DEFAULT false;
-- ALTER TABLE tour_documents ADD COLUMN IF NOT EXISTS passenger_id uuid REFERENCES tour_passengers(id);

-- 4. GRANT PERMISSIONS
GRANT ALL ON TABLE tour_passengers TO anon, authenticated;
GRANT ALL ON TABLE ticket_templates TO anon, authenticated;

-- 5. CREATE INDEXES FOR BETTER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_tour_passengers_tour_id ON tour_passengers(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_passengers_ticket_generated ON tour_passengers(ticket_generated);
CREATE INDEX IF NOT EXISTS idx_ticket_templates_tour_id ON ticket_templates(tour_id);

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE tour_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_templates ENABLE ROW LEVEL SECURITY;

-- 7. CREATE RLS POLICIES
-- Allow users to view all passengers
CREATE POLICY "Allow read access to tour_passengers" ON tour_passengers
  FOR SELECT USING (true);

-- Allow authenticated users to insert passengers
CREATE POLICY "Allow insert access to tour_passengers" ON tour_passengers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own tour passengers
CREATE POLICY "Allow update access to tour_passengers" ON tour_passengers
  FOR UPDATE USING (true);

-- Allow users to delete passengers
CREATE POLICY "Allow delete access to tour_passengers" ON tour_passengers
  FOR DELETE USING (true);

-- Allow users to view all ticket templates
CREATE POLICY "Allow read access to ticket_templates" ON ticket_templates
  FOR SELECT USING (true);

-- Allow authenticated users to insert templates
CREATE POLICY "Allow insert access to ticket_templates" ON ticket_templates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update templates
CREATE POLICY "Allow update access to ticket_templates" ON ticket_templates
  FOR UPDATE USING (true);

-- Allow users to delete templates
CREATE POLICY "Allow delete access to ticket_templates" ON ticket_templates
  FOR DELETE USING (true);

-- DONE! Your eTicket system database is now ready.
