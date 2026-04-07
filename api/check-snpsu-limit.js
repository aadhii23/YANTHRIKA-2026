import { createClient } from '@supabase/supabase-js';

/* ─────────────────────────────────────────────────────────────
   Check SNPSU Limit — lightweight endpoint for the frontend
   to verify whether SNPSU registrations are still open for
   a given event BEFORE the user submits the full form.
   ───────────────────────────────────────────────────────────── */

function isSnpsu(collegeName) {
  const lower = (collegeName || '').toLowerCase().replace(/[.\s]+/g, '');
  return lower.includes('sapthagiri') || lower.includes('snpsu') || lower.includes('saptagiri');
}

const ALLOWED_EVENTS_FOR_SNPSU = ['squad siege (bgmi)', 'squad siege (free fire)', 'bgmi', 'free fire'];

function isAllowedForSnpsu(eventName) {
  const lower = (eventName || '').toLowerCase();
  return ALLOWED_EVENTS_FOR_SNPSU.some(e => lower.includes(e));
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

    // SNPSU but event is allowed
    if (isAllowedForSnpsu(event_name)) {
      return res.status(200).json({ allowed: true });
    }

    // SNPSU but event is NOT allowed -> BLOCKED
    return res.status(200).json({
      allowed: false,
      message: 'Seats for Sapthagiri NPS University are packed. Sorry, SNPSU students cannot register for this event.',
    });

  } catch (error) {
    console.error('check-snpsu-limit error:', error);
    return res.status(500).json({ allowed: false, message: 'Internal Server Error' });
  }
}
