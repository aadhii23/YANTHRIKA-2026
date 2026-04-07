import { createClient } from '@supabase/supabase-js';

import { verifyAuth } from './verify-auth.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE' && req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  if (!verifyAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  // Use SERVICE_ROLE_KEY if available to bypass RLS for admin actions
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return res.status(500).json({ error: 'Missing Database Config' });

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { id } = req.body;

  const { error } = await supabase.from('event_registrations').delete().eq('id', id);
  if (error) {
    console.error('Supabase Delete Error:', error);
    return res.status(500).json({ error: 'Something went wrong while deleting data', details: error.message });
  }
  return res.status(200).json({ success: true });
}
