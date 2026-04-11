/**
 * Debug helper utilities for development
 */

/**
 * Log registration data structure
 * @param {Object} registration - Registration object
 */
export function logRegistrationStructure(registration) {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.group('Registration Structure');
  console.log('ID:', registration.id);
  console.log('Event ID:', registration.event_id);
  console.log('Event Name:', registration.event_name);
  console.log('College:', registration.college_name);
  console.log('Team:', registration.team_name);
  console.log('Leader:', {
    name: registration.leader_name,
    email: registration.leader_email,
    phone: registration.leader_phone
  });
  console.log('Members:', {
    member2: registration.member2_name || 'N/A',
    member3: registration.member3_name || 'N/A',
    member4: registration.member4_name || 'N/A'
  });
  console.log('Created:', registration.created_at);
  console.groupEnd();
}

/**
 * Validate registration object against schema
 * @param {Object} registration - Registration object
 * @returns {Object} Validation result
 */
export function validateRegistration(registration) {
  const errors = [];
  const warnings = [];
  
  // Required fields
  if (!registration.id) errors.push('Missing id');
  if (!registration.event_name) errors.push('Missing event_name');
  if (!registration.college_name) errors.push('Missing college_name');
  if (!registration.leader_name) errors.push('Missing leader_name');
  if (!registration.leader_email) errors.push('Missing leader_email');
  if (!registration.leader_phone) errors.push('Missing leader_phone');
  if (!registration.event_id) errors.push('Missing event_id');
  if (!registration.created_at) errors.push('Missing created_at');
  
  // Optional but recommended
  if (!registration.team_name) warnings.push('No team_name provided');
  
  // Email format
  if (registration.leader_email && !registration.leader_email.includes('@')) {
    errors.push('Invalid email format');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Check if all required environment variables are set
 * @returns {Object} Environment check result
 */
export function checkEnvironment() {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const missing = required.filter(key => !import.meta.env[key]);
  
  return {
    valid: missing.length === 0,
    missing,
    message: missing.length > 0 
      ? `Missing environment variables: ${missing.join(', ')}`
      : 'All required environment variables are set'
  };
}

/**
 * Format registration for CSV export
 * @param {Object} registration - Registration object
 * @returns {Object} Flattened registration object
 */
export function formatForExport(registration) {
  return {
    'Event ID': registration.event_id,
    'Event Name': registration.event_name,
    'College': registration.college_name,
    'Team Name': registration.team_name || '',
    'Leader Name': registration.leader_name,
    'Leader Email': registration.leader_email,
    'Leader Phone': registration.leader_phone,
    'Member 2 Name': registration.member2_name || '',
    'Member 2 Email': registration.member2_email || '',
    'Member 2 Phone': registration.member2_phone || '',
    'Member 3 Name': registration.member3_name || '',
    'Member 3 Email': registration.member3_email || '',
    'Member 3 Phone': registration.member3_phone || '',
    'Member 4 Name': registration.member4_name || '',
    'Member 4 Email': registration.member4_email || '',
    'Member 4 Phone': registration.member4_phone || '',
    'Registered At': new Date(registration.created_at).toLocaleString()
  };
}
