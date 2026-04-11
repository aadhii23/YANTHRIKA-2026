-- Create event_registration_control table
CREATE TABLE IF NOT EXISTS event_registration_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL UNIQUE,
  close_for_snpsu BOOLEAN DEFAULT false,
  close_for_all BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_event_registration_control_event_name 
ON event_registration_control(event_name);

-- Insert default records for all events (all open initially)
INSERT INTO event_registration_control (event_name, close_for_snpsu, close_for_all)
VALUES 
  ('Brainware', false, false),
  ('Verbal Wars', false, false),
  ('Byte Build (Software)', false, false),
  ('Byte Build (Hardware)', false, false),
  ('Venture Verse', false, false),
  ('Old Roll', false, false),
  ('Frame & Fame', false, false),
  ('Brainy Bunch', false, false),
  ('Syntax Wars', false, false),
  ('Squad Siege (BGMI)', false, false),
  ('Squad Siege (Free Fire)', false, false)
ON CONFLICT (event_name) DO NOTHING;

-- Enable Row Level Security (optional, for security)
ALTER TABLE event_registration_control ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" 
ON event_registration_control 
FOR SELECT 
USING (true);

-- Create policy to allow authenticated updates (for admin)
CREATE POLICY "Allow authenticated updates" 
ON event_registration_control 
FOR UPDATE 
USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_event_control_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER update_event_control_timestamp
BEFORE UPDATE ON event_registration_control
FOR EACH ROW
EXECUTE FUNCTION update_event_control_timestamp();
