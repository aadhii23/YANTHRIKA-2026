/**
 * Detects if a college name belongs to Sapthagiri NPS University (SNPSU)
 * @param {string} collegeName - The college name to check
 * @returns {boolean} - True if the college is SNPSU
 */
export function isSnpsuCollege(collegeName) {
  if (!collegeName) return false;
  
  const normalized = collegeName.toLowerCase().replace(/[.\s]+/g, '');
  
  const snpsuKeywords = [
    'snpsu',
    'sapthagiri',
    'saptagiri',
    'sapthagirinpsuniversity',
    'sapthagiriuniversity',
    'npsu'
  ];
  
  return snpsuKeywords.some(keyword => normalized.includes(keyword));
}

/**
 * Gets the appropriate error message based on closure type
 * @param {boolean} closeForAll - Whether event is closed for all
 * @param {boolean} closeForSnpsu - Whether event is closed for SNPSU
 * @param {string} eventName - Name of the event
 * @returns {string} - Error message
 */
export function getClosureMessage(closeForAll, closeForSnpsu, eventName) {
  if (closeForAll) {
    return `Registrations for ${eventName} are currently closed.`;
  }
  if (closeForSnpsu) {
    return `Registrations for ${eventName} are closed for Sapthagiri NPS University students. Students from other colleges can still register.`;
  }
  return '';
}
