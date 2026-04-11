/**
 * @typedef {Object} Registration
 * @property {string} id - Unique registration ID (UUID)
 * @property {string} event_id - Event identifier (e.g., YN2026-1234)
 * @property {string} event_name - Name of the event
 * @property {string} college_name - Name of the college
 * @property {string} team_name - Team name (optional)
 * @property {string} leader_name - Team leader's name
 * @property {string} leader_email - Team leader's email
 * @property {string} leader_phone - Team leader's phone number
 * @property {string|null} member2_name - Second member's name
 * @property {string|null} member2_email - Second member's email
 * @property {string|null} member2_phone - Second member's phone
 * @property {string|null} member3_name - Third member's name
 * @property {string|null} member3_email - Third member's email
 * @property {string|null} member3_phone - Third member's phone
 * @property {string|null} member4_name - Fourth member's name
 * @property {string|null} member4_email - Fourth member's email
 * @property {string|null} member4_phone - Fourth member's phone
 * @property {string} created_at - ISO timestamp of registration
 */

/**
 * @typedef {Object} RegistrationStats
 * @property {number} totalRegistrations - Total number of registrations
 * @property {number} activeEvents - Number of distinct events with registrations
 * @property {number} snpsuRegistrations - Number of SNPSU college registrations
 */

export {};
