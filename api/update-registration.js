import { createClient } from '@supabase/supabase-js';

import { verifyAuth } from './verify-auth.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT' && req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  if (!verifyAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return res.status(500).json({ error: 'Missing Database Config' });

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { id, ...updates } = req.body;

  const { error } = await supabase.from('event_registrations').update(updates).eq('id', id);
  if (error) return res.status(500).json({ error: 'Something went wrong while updating data' });
  return res.status(200).json({ success: true });
}
