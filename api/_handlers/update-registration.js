import { createClient } from '@supabase/supabase-js';
import { verifyAuth } from './verify-auth.js';
import { getEventStatus } from './event-state.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!verifyAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Missing Database Config' });
  }

  const { id, created_at, ...updates } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Missing registration id' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: existing, error: fetchError } = await supabase
    .from('event_registrations')
    .select('college_name, event_name')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    console.error('Fetch existing record error:', fetchError);
    return res.status(404).json({ error: 'Registration not found' });
  }

  const collegeName = updates.college_name ?? existing.college_name;
  const eventName = updates.event_name ?? existing.event_name;

  // Check event is open
  if (!(await getEventStatus(eventName))) {
    return res.status(400).json({
      error: `Registrations for ${eventName} are currently closed.`,
    });
  }

  const { error } = await supabase
    .from('event_registrations')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Supabase Update Error:', error);
    return res.status(500).json({
      error: 'Something went wrong while updating data',
      details: error.message,
    });
  }

  return res.status(200).json({ success: true });
}
