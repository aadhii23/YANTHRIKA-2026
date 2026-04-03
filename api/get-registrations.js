import { createClient } from '@supabase/supabase-js';

import { verifyAuth } from './verify-auth.js';

export default async function handler(req, res) {
  console.log('[DEBUG] Incoming request to get-registrations. Cookies:', req.headers.cookie ? 'YES' : 'NO');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  if (!verifyAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return res.status(500).json({ error: 'Missing Database Config' });

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('event_registrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: 'Something went wrong while fetching data' });
  return res.status(200).json(data);
}
