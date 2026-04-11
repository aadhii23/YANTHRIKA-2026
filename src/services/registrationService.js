import { supabase } from '../lib/supabaseClient';

/**
 * Get all registrations from the database
 * @returns {Promise<Array>} Array of registration objects
 */
export async function getRegistrations() {
  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching registrations:', error);
    throw new Error('Failed to fetch registrations');
  }
}

/**
 * Get registration statistics
 * @param {Array} registrations - Array of registration objects
 * @returns {Object} Statistics object
 */
export function getRegistrationStats(registrations) {
  const totalRegistrations = registrations.length;
  
  // Count distinct event names
  const uniqueEvents = new Set(registrations.map(r => r.event_name));
  const activeEvents = uniqueEvents.size;
  
  // Count SNPSU registrations
  const snpsuRegistrations = registrations.filter(r => {
    const lower = (r.college_name || '').toLowerCase().replace(/[.\s]+/g, '');
    return lower.includes('sapthagiri') || lower.includes('snpsu') || lower.includes('saptagiri');
  }).length;

  return {
    totalRegistrations,
    activeEvents,
    snpsuRegistrations
  };
}

/**
 * Search registrations across multiple fields
 * @param {Array} registrations - Array of registration objects
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered registrations
 */
export function searchRegistrations(registrations, searchTerm) {
  if (!searchTerm) return registrations;
  
  const term = searchTerm.toLowerCase();
  
  return registrations.filter(r => {
    return (
      (r.leader_name || '').toLowerCase().includes(term) ||
      (r.leader_email || '').toLowerCase().includes(term) ||
      (r.college_name || '').toLowerCase().includes(term) ||
      (r.team_name || '').toLowerCase().includes(term) ||
      (r.event_id || '').toLowerCase().includes(term) ||
      (r.event_name || '').toLowerCase().includes(term)
    );
  });
}

/**
 * Delete a registration by ID
 * @param {string} id - Registration ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteRegistration(id) {
  try {
    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting registration:', error);
    throw new Error('Failed to delete registration');
  }
}

/**
 * Update a registration
 * @param {string} id - Registration ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<boolean>} Success status
 */
export async function updateRegistration(id, updates) {
  try {
    // Remove created_at and id from updates
    const { created_at, id: _, ...cleanUpdates } = updates;
    
    const { error } = await supabase
      .from('event_registrations')
      .update(cleanUpdates)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating registration:', error);
    throw new Error('Failed to update registration');
  }
}

/**
 * Calculate team size based on member fields
 * @param {Object} registration - Registration object
 * @returns {number} Team size
 */
export function calculateTeamSize(registration) {
  return 1 + 
    (registration.member2_name ? 1 : 0) + 
    (registration.member3_name ? 1 : 0) + 
    (registration.member4_name ? 1 : 0);
}

/**
 * Get distinct event names from registrations
 * @param {Array} registrations - Array of registration objects
 * @returns {Array<string>} Sorted array of event names
 */
export function getDistinctEvents(registrations) {
  return [...new Set(registrations.map(r => r.event_name))].sort();
}

/**
 * Get distinct college names from registrations
 * @param {Array} registrations - Array of registration objects
 * @returns {Array<string>} Sorted array of college names
 */
export function getDistinctColleges(registrations) {
  return [...new Set(registrations.map(r => r.college_name))].sort();
}

/**
 * Filter registrations by event and college
 * @param {Array} registrations - Array of registration objects
 * @param {string} eventFilter - Event name filter
 * @param {string} collegeFilter - College name filter
 * @returns {Array} Filtered registrations
 */
export function filterRegistrations(registrations, eventFilter, collegeFilter) {
  return registrations.filter(r => {
    const matchesEvent = eventFilter ? r.event_name === eventFilter : true;
    const matchesCollege = collegeFilter ? r.college_name === collegeFilter : true;
    return matchesEvent && matchesCollege;
  });
}

/**
 * Sort registrations
 * @param {Array} registrations - Array of registration objects
 * @param {string} sortBy - Sort option (date-desc, date-asc, event, college)
 * @returns {Array} Sorted registrations
 */
export function sortRegistrations(registrations, sortBy) {
  const sorted = [...registrations];
  
  switch (sortBy) {
    case 'date-desc':
      return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    case 'date-asc':
      return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    case 'event':
      return sorted.sort((a, b) => a.event_name.localeCompare(b.event_name));
    case 'college':
      return sorted.sort((a, b) => a.college_name.localeCompare(b.college_name));
    default:
      return sorted;
  }
}
