import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables (URL or KEY)');
  }

  return createClient(url, key);
}

/**
 * Returns true (open) or false (closed) for a single event.
 * Defaults to true if the row doesn't exist.
 */
export async function getEventStatus(eventName) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('event_status')
    .select('is_open')
    .eq('event_name', eventName)
    .single();

  if (error || !data) return true; // default open
  return data.is_open;
}

/**
 * Returns all event statuses as { eventName: bool, ... }
 */
export async function getAllEventStatuses() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('event_status')
    .select('event_name, is_open');

  if (error || !data) return {};
  return Object.fromEntries(data.map(row => [row.event_name, row.is_open]));
}

/**
 * Upserts the open/close state for a specific event.
 */
export async function setEventStatus(eventName, isOpen) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('event_status')
    .upsert({ event_name: eventName, is_open: Boolean(isOpen) }, { onConflict: 'event_name' });

  if (error) throw error;
}
