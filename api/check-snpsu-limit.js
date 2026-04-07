import { createClient } from '@supabase/supabase-js';

/* ─────────────────────────────────────────────────────────────
   Check SNPSU Limit — lightweight endpoint for the frontend
   to verify whether SNPSU registrations are still open for
   a given event BEFORE the user submits the full form.
   ───────────────────────────────────────────────────────────── */

// Inline copies of helper logic (Vercel serverless can't import from src/)
function isSnpsu(collegeName) {
  const lower = (collegeName || '').toLowerCase().replace(/[.\s]+/g, '');
  return lower.includes('sapthagiri') || lower.includes('snpsu') || lower.includes('saptagiri');
}

const SNPSU_LIMITS = {
  'Brainware':              20,
  'Verbal Wars':            8,
  'Byte Build (Software)':  10,
  'Byte Build (Hardware)':  5,
  'Venture Verse':          10,
  'Old Roll':               5,
  'Frame & Fame':           10,
  'Brainy Bunch':           30,
  'Syntax Wars':            12,
};

// These events have NO limit for anyone
const UNLIMITED_EVENTS = ['Squad Siege (BGMI)', 'Squad Siege (Free Fire)'];

function getSnpsuLimit(eventName) {
  if (UNLIMITED_EVENTS.some(e => eventName.toLowerCase().includes(e.toLowerCase()))) return null;
  // Exact match first
  if (SNPSU_LIMITS[eventName] !== undefined) return SNPSU_LIMITS[eventName];
  // Substring fallback
  const lower = eventName.toLowerCase();
  const key = Object.keys(SNPSU_LIMITS).find(k => lower.includes(k.toLowerCase()));
  return key ? SNPSU_LIMITS[key] : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { event_name, college_name } = req.body;

    if (!event_name || !college_name) {
      return res.status(400).json({ allowed: false, message: 'Missing event_name or college_name' });
    }

    // Not SNPSU → always allowed
    if (!isSnpsu(college_name)) {
      return res.status(200).json({ allowed: true });
    }

    // SNPSU but event is unlimited for everyone
    const limit = getSnpsuLimit(event_name);
    if (limit === null) {
      return res.status(200).json({ allowed: true });
    }

    // Count existing SNPSU registrations for this event
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ allowed: false, message: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { count, error: countError } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_name', event_name)
      .or('college_name.ilike.%sapthagiri%,college_name.ilike.%snpsu%,college_name.ilike.%saptagiri%');

    if (countError) {
      console.error('SNPSU limit check error:', countError);
      return res.status(500).json({ allowed: false, message: 'Unable to verify availability.' });
    }

    if (count >= limit) {
      return res.status(200).json({
        allowed: false,
        message: 'Seat for SNPSU is packed, sorry. You cannot register for this event.',
      });
    }

    return res.status(200).json({ allowed: true, remaining: limit - count });

  } catch (error) {
    console.error('check-snpsu-limit error:', error);
    return res.status(500).json({ allowed: false, message: 'Internal Server Error' });
  }
}
