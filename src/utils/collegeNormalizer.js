/**
 * College Name Normalization Utility
 * Handles variations and typos in college names
 */

// Canonical college names mapping
const COLLEGE_MAPPINGS = {
  // Sapthagiri NPS University variations
  'sapthagiri nps university': 'Sapthagiri NPS University',
  'snpsu': 'Sapthagiri NPS University',
  'sapthagiri': 'Sapthagiri NPS University',
  'saptagiri': 'Sapthagiri NPS University',
  'sathagiri': 'Sapthagiri NPS University',
  'nps university': 'Sapthagiri NPS University',
  'npsu': 'Sapthagiri NPS University',
  
  // RV College variations
  'rv college': 'RV College of Engineering',
  'rvce': 'RV College of Engineering',
  'r v college': 'RV College of Engineering',
  
  // BMS College variations
  'bms college': 'BMS College of Engineering',
  'bmsce': 'BMS College of Engineering',
  'b m s college': 'BMS College of Engineering',
  
  // RRIT variations
  'rrit': 'Rajarajeshwari Institute of Technology',
  'rajarajeshwari': 'Rajarajeshwari Institute of Technology',
  
  // St Paul's College variations (handle apostrophe)
  'st pauls college': "St Paul's College",
  'st paul college': "St Paul's College",
  'stpauls college': "St Paul's College",
  'saint pauls college': "St Paul's College",
  'saint paul college': "St Paul's College",
  
  // Dayananda Sagar variations
  'dayananda sagar': 'Dayananda Sagar University',
  'dayanand sagar': 'Dayananda Sagar University',
  'dsu': 'Dayananda Sagar University',
  'dayananda sagar university': 'Dayananda Sagar University',
  
  // Koshys variations
  'koshys': 'Koshys Institutions Of Management Studies',
  'koshy': 'Koshys Institutions Of Management Studies',
  'koshys institutions': 'Koshys Institutions Of Management Studies',
  'koshys institutions of management studies': 'Koshys Institutions Of Management Studies',
  
  // Add more colleges as needed
};

/**
 * Normalize college name to canonical form
 * @param {string} collegeName - Raw college name from input
 * @returns {string} - Normalized college name
 */
export function normalizeCollegeName(collegeName) {
  if (!collegeName) return '';
  
  // Clean the input - remove apostrophes, extra spaces, punctuation
  const cleaned = collegeName
    .toLowerCase()
    .trim()
    .replace(/['`'']/g, '')  // Remove all apostrophe variations
    .replace(/\s+/g, ' ')    // Multiple spaces to single space
    .replace(/[.,;]+$/g, '') // Remove trailing punctuation
    .replace(/\s+of\s+/g, ' of '); // Normalize "of"
  
  // Check for exact match in mappings
  if (COLLEGE_MAPPINGS[cleaned]) {
    return COLLEGE_MAPPINGS[cleaned];
  }
  
  // Check for partial matches (contains)
  for (const [key, value] of Object.entries(COLLEGE_MAPPINGS)) {
    if (cleaned.includes(key) || key.includes(cleaned)) {
      return value;
    }
  }
  
  // Return title case if no match found
  return collegeName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get list of common colleges for dropdown
 */
export const COMMON_COLLEGES = [
  'Sapthagiri NPS University',
  'RV College of Engineering',
  'BMS College of Engineering',
  'Rajarajeshwari Institute of Technology',
  "St Paul's College",
  'Dayananda Sagar University',
  'Koshys Institutions Of Management Studies',
  'PES University',
  'MSRIT',
  'CMR Institute of Technology',
  'Other'
];

/**
 * Normalize college data for analytics
 * @param {Array} registrations - Array of registration objects
 * @returns {Object} - Normalized college counts
 */
export function normalizeCollegeAnalytics(registrations) {
  const collegeCounts = {};
  
  registrations.forEach(reg => {
    const normalized = normalizeCollegeName(reg.college_name);
    collegeCounts[normalized] = (collegeCounts[normalized] || 0) + 1;
  });
  
  return collegeCounts;
}
