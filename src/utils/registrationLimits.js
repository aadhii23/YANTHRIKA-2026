/**
 * Registration Limits Utility
 * Checks if an event has reached its registration limit and should be auto-closed
 */

import { ALL_EVENTS } from '../data/events';

/**
 * Check if an event should be closed based on registration count
 * @param {string} eventName - Name of the event
 * @param {number} currentCount - Current number of registrations
 * @returns {boolean} - True if event should be closed
 */
export function shouldEventBeClosed(eventName, currentCount) {
  const event = ALL_EVENTS.find(e => e.name === eventName);
  if (!event || !event.registrationLimit) return false;
  return currentCount >= event.registrationLimit;
}

/**
 * Get the registration limit for an event
 * @param {string} eventName - Name of the event
 * @returns {number|null} - Registration limit or null if no limit
 */
export function getRegistrationLimit(eventName) {
  const event = ALL_EVENTS.find(e => e.name === eventName);
  return event?.registrationLimit || null;
}

/**
 * Get remaining slots for an event
 * @param {string} eventName - Name of the event
 * @param {number} currentCount - Current number of registrations
 * @returns {number|null} - Remaining slots or null if no limit
 */
export function getRemainingSlots(eventName, currentCount) {
  const limit = getRegistrationLimit(eventName);
  if (!limit) return null;
  return Math.max(0, limit - currentCount);
}

/**
 * Check if an event is at capacity
 * @param {string} eventName - Name of the event
 * @param {number} currentCount - Current number of registrations
 * @returns {boolean} - True if event is at capacity
 */
export function isEventAtCapacity(eventName, currentCount) {
  return shouldEventBeClosed(eventName, currentCount);
}
