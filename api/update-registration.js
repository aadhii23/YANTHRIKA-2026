import { createClient } from '@supabase/supabase-js';
import { verifyAuth } from './verify-auth.js';

/* ─────────────────────────────────────────────────────────────
   SNPSU helpers (same logic as register-event.js)
   ───────────────────────────────────────────────────────────── */
const SNPSU_LIMITS = {
  'Brainware':              20,
  'Verbal Wars':             8,
  'Byte Build (Software)':  10,
  'Byte Build (Hardware)':   5,
  'Venture Verse':          10,
  'Old Roll':                5,
  'Frame & Fame':           10,
  'Brainy Bunch':           30,
  'Syntax Wars':            12,
};

const UNLIMITED_EVENTS = ['Squad Siege (BGMI)', 'Squad Siege (Free Fire)'];

function isSnpsu(collegeName) {
  const lower = (collegeName || '').toLowerCase().replace(/[.\s]+/g, '');
  return lower.includes('sapthagiri') || lower.includes('snpsu') || lower.includes('saptagiri');
}

function getSnpsuLimit(eventName) {
  if (UNLIMITED_EVENTS.some(e => eventName.toLowerCase().includes(e.toLowerCase()))) return null;
  if (SNPSU_LIMITS[eventName] !== undefined) return SNPSU_LIMITS[eventName];
  const lower = eventName.toLowerCase();
  const key = Object.keys(SNPSU_LIMITS).find(k => lower.includes(k.toLowerCase()));
  return key ? SNPSU_LIMITS[key] : null;
}

export default async function handler(req, res) {
  if (req.method !== 'PUT' && req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  if (!verifyAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return res.status(500).json({ error: 'Missing Database Config' });

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { id, ...updates } = req.body;

  // ── SNPSU limit check when event_name or college_name is being changed ──
  const collegeName = updates.college_name;
  const eventName = updates.event_name;

  if (collegeName && eventName && isSnpsu(collegeName)) {
    const limit = getSnpsuLimit(eventName);
    if (limit !== null) {
      // Count existing SNPSU registrations for this event, excluding the current record
      const { count, error: countError } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', eventName)
        .neq('id', id)
        .or('college_name.ilike.%sapthagiri%,college_name.ilike.%snpsu%,college_name.ilike.%saptagiri%');

      if (countError) {
        console.error('SNPSU limit check error on update:', countError);
        return res.status(500).json({ error: 'Unable to verify SNPSU availability.' });
      }

      if (count >= limit) {
        return res.status(400).json({
          error: 'Seat for SNPSU is packed, sorry. You cannot register for this event.',
        });
      }
    }
  }

  const { error } = await supabase.from('event_registrations').update(updates).eq('id', id);
  if (error) return res.status(500).json({ error: 'Something went wrong while updating data' });
  return res.status(200).json({ success: true });
}
